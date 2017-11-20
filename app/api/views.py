"""
Metadata API

Workflow proceeds as follows:
    * All interactions with metadata records, aside from exporting particular
    records in a particular format (dublin core, iso, etc) are done with PUT,
    POST, or DELETE. POST is used so that user credentials can be sent along
    with request to, say, view all metadata records. If the user is an admin
    they will be able to see all records in the database. If not, the user
    will only be able to see their own records.

    * To submit a new record, the user makes a PUT request to `api/metadata
    to see all metadata records, the user makes a POST request to
    `api/metadata`. The response from the PUT request contains the record's
    ID.

    * To get a particular record, POST to `api/metadata/<string:_oid>`. To
    update a particular record, PUT to `api/metadata/<string:_oid>`.

    * To publish a particular record,
    POST to `/api/metadata/<string:_oid>/publish`. It is the client's
    responsibility to make sure a draft version of the record has been
    initialized on the server, for example, by first making a PUT request
    with complete metadata to `api/metadata`.
"""
import json
import lxml.etree as ET
import geocoder
import os
import requests
import urllib
import stat
import shutil
import pymssql
import hashlib
import ConfigParser
import re

#Email dependencies
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from datetime import datetime
from dicttoxml import dicttoxml
from flask import request, jsonify, Response
from flask import current_app as app
from flask_cors import cross_origin
from mongoengine import ValidationError

from . import api
from .. import es
from .. import uploadedfiles
from ..models import Metadata, Attachment, Metadata_Subset

import gptInsert


@api.route('/api/metadata', methods=['POST', 'PUT'])
@cross_origin(origin='*', methods=['POST', 'PUT'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def metadata():
    """
    Handle get and push requests coming to metadata server

    POST is an update of an existing record.

    PUT is a new record being created.

    Access control is done here. A user can modify only their own records
    because their session_id sent with the request.

    returns:
        Response with newly created or edited record as data.
    """
    username = _authenticate_user_from_session(request)
    admin_username = _authenticate_admin_from_session(request)

    if username or admin_username:
        if request.method == 'POST':

            # execute raw MongoDB query and return all of the user's records
	    if username:
	            recs = Metadata.objects(__raw__={'username': username})
        	    return jsonify(dict(results=recs))
	    elif admin_username:
		return jsonify({"message":"Admin cannot use POST on this route."})

        if request.method == 'PUT':

            new_md = Metadata.from_json(json.dumps(request.json['record']))

            new_md.id = None
            new_md.placeholder = False
            new_md.default = None
            new_md.username = username

            new_md.topic_category

            # this avoids errors in submitting None where a list is expected.
            # string -> dict -> string seems wasteful, but don't see other way
            new_md = Metadata.from_json(
                        json.dumps(
                            {
                                k: v
                                for (k, v) in json.loads(
                                        new_md.to_json()
                                    ).iteritems()
                                if v != ''
                            }
                        )
            )

            new_md.save()

            # return a JSON record of new metadata to load into the page
            return jsonify(record=new_md)

    else:
        return Response('Bad or missing session id.', status=401)


@api.route('/api/metadata/load-record/<string:oid>', methods=['POST'])
@cross_origin(origin='*', methods=['POST'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def get_record(oid):
    """
    Handle get and push requests coming to metadata server

    POST is an update of an existing record.

    Access control is done here. An admin can modify anyone's records
    but they must be an admin in the authenication database.

    returns:
        Response with newly created or edited record as data.
    """

    username = _authenticate_admin_from_session(request)

    if username:

        # execute raw MongoDB query and return the record with the specified oid.
        recs = Metadata.objects.get_or_404(pk=oid)
        return jsonify(dict(results=recs))

    else:
        return Response('Bad or missing session id.', status=401)



@api.route('/api/metadata/<string:_oid>', methods=['POST', 'PUT'])
@cross_origin(origin='*', methods=['POST', 'PUT'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def get_single_metadata(_oid):
    """
    Retrieve or update the metadata record with given _oid. Retrieval is done
    via POST because we must pass a session id so that the user is
    authenticated.

    Access control is done here. A user can modify only their own records
    because their session_id sent with the request.
    """
    username = _authenticate_user_from_session(request)
    admin_username = _authenticate_admin_from_session(request)
    
    if admin_username:

        try:
            if request.method == 'PUT':

                if ('record' in request.json and '_id' in request.json['record']):

                    existing_record = \
                        Metadata.objects.get_or_404(pk=_oid)

                    updater = Metadata.from_json(
                        json.dumps(request.json['record'])
                    )

                    for f in existing_record._fields:
                        existing_record[f] = updater[f]

                    existing_record.save()

                    return jsonify(record=existing_record)

                else:
                    return Response('Bad or missing id', 400)

            else:
                    record = Metadata.objects.get_or_404(pk=_oid)
 
                    record.format_dates()

                    return jsonify(record=record)
        except:

            return Response('Bad request for record with id ' + _oid, 400)
        
    elif username:

        try:
            if request.method == 'PUT':

                if ('record' in request.json and '_id' in request.json['record']):

                    existing_record = \
                        Metadata.objects.get_or_404(pk=_oid,
                                                    username=username)

                    updater = Metadata.from_json(
                        json.dumps(request.json['record'])
                    )

                    for f in existing_record._fields:
                        existing_record[f] = updater[f]

                    existing_record.save()

                    return jsonify(record=existing_record)

                else:
                    return Response('Bad or missing id', 400)

            else:
                    record = Metadata.objects.get_or_404(
                        pk=_oid, username=username
                    )
 
                    record.format_dates()

                    return jsonify(record=record)
        except:

            return Response('Bad request for record with id ' + _oid, 400)

    else:
        return Response('Bad or missing session id.', status=401)


    
@api.route('/api/metadata/admin/<string:page_number>/<string:records_per_page>/<string:sort_on>/<string:current_publish_state>', methods=['POST'])
@cross_origin(origin='*', methods=['POST'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def get_all_metadata(page_number, records_per_page, sort_on, current_publish_state):
    """
    Retrieve all metadata records for admin view. Retrieval is done
    via POST because we must pass a session id so that the user is
    authenticated.

    Access control is done here. An admin is authenticated if their
    session id is valid, and they are part of the admin group
    """
    username = _authenticate_admin_from_session(request)

    #pageNumber is 0 based index. Need first page to start at 0 for math for setting arrayLowerBound and arrayUpperBound.
    try:
        if username:

	    publishing_states = ['false', 'pending', 'true']
	    sort_attributes = ['title', 'md_pub_date', 'summary']

            if request.method == 'POST':
                #need to do input sanitization on all these values! Separating variables so outside does not have direct access to
                #database query.
		if sort_on in sort_attributes:
			sort_by = sort_on
		else:
			sort_by = 'title'

		if current_publish_state not in publishing_states:
                    return Response("Error: specified publish state not supported.", 400)

		else:
                    publish_status = current_publish_state

                record_list = Metadata.objects(__raw__={'published':publish_status}).order_by(sort_by)

                arrayLowerBound = int(page_number) * int(records_per_page)
                arrayUpperBound = int(page_number) * int(records_per_page) + int(records_per_page)
                #Only return array elements between indicies. Don't want to return all possible values
                #and overload browser with too much data. This is a version of 'pagination.'
                return jsonify(dict(results=record_list[arrayLowerBound:arrayUpperBound], num_entries=(len(record_list)/int(records_per_page))))
            
        else:
            return Response('Bad or missing session id.', status=401)

    except:

        return Response('Bad request for records', 400)


@api.route('/api/metadata/doiark/<string:page_number>/<string:records_per_page>/<string:sort_on>', methods=['POST'])
@cross_origin(origin='*', methods=['POST'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def get_doi_ark_requests(page_number, records_per_page, sort_on):
    """
    Retrieve all metadata records for admin view. Retrieval is done
    via POST because we must pass a session id so that the user is
    authenticated.

    Access control is done here. A user can modify only their own records
    because their session_id sent with the request.
    """
    username = _authenticate_admin_from_session(request)

    #pageNumber is 0 based index. Need first page to start at 0 for math for setting arrayLowerBound and arrayUpperBound.
    try:
        if username:
            if request.method == 'POST':
                #need to do input sanitization on all these values! Separating variables so outside does not have direct access to
                #database query.
                if sort_on == 'title':
                    sort_by = 'title'
                elif sort_on == 'md_pub_date':
                    sort_by = 'md_pub_date'
                elif sort_on == 'summary':
                    sort_by = 'summary'
                elif sort_on == 'assigned_doi_ark':
                    sort_by = 'assigned_doi_ark'
                else:
                    sort_by = 'title'

                #Look for published records with either DOI or ARK requests without DOI or ARK assigned, then records with DOI
                #or ARK already assigned
                record_list = Metadata.objects(__raw__={'$and': [{'published':'pending'}, {'$or': [{'doi_ark_request':'DOI'}, {'doi_ark_request':'ARK'}, {'doi_ark_request':'both'}]}]}).order_by(sort_by)

                arrayLowerBound = int(page_number) * int(records_per_page)
                arrayUpperBound = int(page_number) * int(records_per_page) + int(records_per_page)
                #Only return array elements between indicies. Don't want to return all possible values
                #and overload browser with too much data. This is a version of 'pagination.'
                return jsonify(dict(results=record_list[arrayLowerBound:arrayUpperBound], num_entries=(len(record_list)/int(records_per_page))))

        else:
            return Response('Bad or missing session id.', status=401)

    except:

        return Response('Bad request for records', 400)


@api.route('/api/metadata/doiark/search/<string:search_term>/<string:page_number>/<string:records_per_page>/<string:sort_by>', methods=['POST'])
@cross_origin(origin='*', methods=['POST'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def search_doi_ark_requests(search_term, page_number, records_per_page, sort_by):
    """
    Retrieve all metadata records for admin view. Retrieval is done
    via POST because we must pass a session id so that the user is
    authenticated.

    Access control is done here. A user can modify only their own records
    because their session_id sent with the request.
    """
    username = _authenticate_admin_from_session(request)

    #pageNumber is 0 based index. Need first page to start at 0 for math for setting arrayLowerBound and arrayUpperBound.
    try:
        if username:
            if request.method == 'POST':
                #need to do input sanitization on values on route! 
                
                #This query returns a list of records that have been published and either the title, summary, or one of the authors have the
                #search term in it.
                record_list = Metadata.objects(__raw__={'$and':[{'published':'pending'}, {'$or': [{'doi_ark_request':'DOI'}, {'doi_ark_request':'ARK'}]}, {'$or':[{'title':{'$regex':".*" + search_term + ".*", '$options': '-i'}}, {'summary':{'$regex':".*" + search_term + ".*", '$options': '-i'}}, {'citation': {'$elemMatch':{'name':{'$regex':".*" + search_term + ".*", '$options': '-i'}}}}]}]}).order_by(sort_by)

                arrayLowerBound = int(page_number) * int(records_per_page)
                arrayUpperBound = int(page_number) * int(records_per_page) + int(records_per_page)

                #Only return array elements between indicies. Don't want to return all possible values
                #and overload browser with too much data. This is a version of 'pagination.'
                return jsonify(dict(results=record_list[arrayLowerBound:arrayUpperBound], num_entries=(len(record_list)/int(records_per_page))))

        else:
            return Response('Bad or missing session id.', status=401)
            
    except:

        return Response('Bad request for records', 400)


    
@api.route('/api/metadata/doi/<string:page_number>/<string:records_per_page>/<string:sort_on>/<string:doi_ark_value>', methods=['POST'])
@cross_origin(origin='*', methods=['POST'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def set_doi_ark(page_number, records_per_page, sort_on, doi_ark_value):
    """
    Retrieve all metadata records for admin view. Retrieval is done
    via POST because we must pass a session id so that the user is
    authenticated.

    Access control is done here. A user can modify only their own records
    because their session_id sent with the request.
    """
    username = _authenticate_admin_from_session(request)

    #pageNumber is 0 based index. Need first page to start at 0 for math for setting arrayLowerBound and arrayUpperBound.
    try:
        if username:
            if request.method == 'POST':
                #need to do input sanitization on all these values! Separating variables so outside does not have direct access to
                #database query.
                if sort_on == 'title':
                    sort_by = 'title'
                elif sort_on == 'md_pub_date':
                    sort_by = 'md_pub_date'
                elif sort_on == 'summary':
                    sort_by = 'summary'
                else:
                    sort_by = 'title'

                record_list = Metadata.objects(__raw__={'published':'pending'}).order_by(sort_by)
                
                arrayLowerBound = int(page_number) * int(records_per_page)
                arrayUpperBound = int(page_number) * int(records_per_page) + int(records_per_page)
                #Only return array elements between indicies. Don't want to return all possible values
                #and overload browser with too much data. This is a version of 'pagination.'
                return jsonify(dict(results=record_list[arrayLowerBound:arrayUpperBound], num_entries=(len(record_list)/int(records_per_page))))

        else:
            return Response('Bad or missing session id.', status=401)

    except:

        return Response('Bad request for records', 400)

    
@api.route('/api/metadata/admin/search/<string:search_term>/<string:page_number>/<string:records_per_page>/<string:sort_by>', methods=['POST'])
@cross_origin(origin='*', methods=['POST'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def search_metadata(search_term, page_number, records_per_page, sort_by):
    """
    Retrieve all metadata records for admin view. Retrieval is done
    via POST because we must pass a session id so that the user is
    authenticated.

    Access control is done here. A user can modify only their own records
    because their session_id sent with the request.
    """
    username = _authenticate_admin_from_session(request)

    #pageNumber is 0 based index. Need first page to start at 0 for math for setting arrayLowerBound and arrayUpperBound.
    try:
        if username:
            record_state = request.json['record_state']
            #sanitize record_state
            record_publish_states = ['false', 'pending', 'true']
               
            if request.method == 'POST':
                #Input sanitization on record_state
                if record_state not in record_publish_states:
                    return Response("Error: record_state value not one of the allowed states.", 400)

                #This query returns a list of records that have been published and either the title, summary, or one of the authors have the
                #search term in it.
                record_list = Metadata.objects(__raw__={'$and':[{'published':record_state}, {'$or':[{'title':{'$regex':".*" + search_term + ".*", '$options': '-i'}}, {'summary':{'$regex':".*" + search_term + ".*", '$options': '-i'}}, {'citation': {'$elemMatch':{'name':{'$regex':".*" + search_term + ".*", '$options': '-i'}}}}]}]}).order_by(sort_by)

                arrayLowerBound = int(page_number) * int(records_per_page)
                arrayUpperBound = int(page_number) * int(records_per_page) + int(records_per_page)

                #Only return array elements between indicies. Don't want to return all possible values
                #and overload browser with too much data. This is a version of 'pagination.'
                return jsonify(dict(results=record_list[arrayLowerBound:arrayUpperBound], num_entries=(len(record_list)/int(records_per_page))))

        else:
            return Response('Bad or missing session id.', status=401)
           
    except:

        return Response('Bad request for records', 400)


    
@api.route('/api/metadata/<string:_oid>/delete', methods=['POST'])
@cross_origin(origin='*', methods=['POST'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def delete_metadata_record(_oid):

    username = _authenticate_user_from_session(request)
    admin_username = _authenticate_user_from_session(request)
    
    if username or admin_username:
	md = Metadata.objects.get_or_404(pk=_oid)
 
	if md.published == "false" or md.published == "pending":
		#Delete from MongoDB
        	md.delete()

		#Only delete files on file system if the record has been submitted for publication. Otherwise, files will not exist.
		if md.published == "pending":
			#Delete uploaded files from file system
			preprod_dir = app.config['PREPROD_DIRECTORY']
			preprod_path = os.path.join(preprod_dir, _oid)

			try:
			        shutil.rmtree(preprod_path)
			except ValueError:
				pass

	else:
		return jsonify({"message":"File has already been published. Cannot delete!"})

	return jsonify({"message":"File deleted!"})
    else:

        return Response('Bad or missing session id.', status=401)


@api.route('/api/metadata/<string:_oid>/admin-publish', methods=['POST'])
@cross_origin(origin='*', methods=['POST'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def admin_publish_metadata_record(_oid):

    username = _authenticate_admin_from_session(request)
   
    if username:
	#Buffer size we will break file into for hashing files. Need this for large files!
	BUF_SIZE = 65536  # lets read stuff in 64kb chunks!

	#Config file is 'getUsername.conf' located in the current directory
    	config_file = os.path.dirname(__file__) + '/checksum.conf'

        elasticsearch_record = request.json['elasticsearch_record']

	str_id = elasticsearch_record["uid"]
	
	schema_type = request.json['schema_type']

        #Move file from pre-prod directory to production directory
        preprod_dir = app.config['PREPROD_DIRECTORY']
        prod_dir = app.config['PROD_DIRECTORY']

        if os.path.exists(os.path.dirname(preprod_dir)):
            
            preprod_path = os.path.join(preprod_dir, str_id)

            prod_path = os.path.join(prod_dir, str_id)

            #Make the directory in the production directory
            #Move the XML file from the preprod directory to the prod directory
            try:
                os.rename(preprod_path, prod_path)
            except OSError:
                return "Moving file on backend filesystem error"

            #set permissions on the new directory in prod: record's directory: read and execute; directories inside record's directory: read only;  and all files read only
	    try:
		for root, dirs, files in os.walk(prod_path):
			for f in files:
				os.chmod(os.path.join(prod_path, f), stat.S_IRUSR | stat.S_IRGRP | stat.S_IROTH)

	        os.chmod(prod_path, stat.S_IRUSR | stat.S_IXUSR | stat.S_IRGRP | stat.S_IXGRP | stat.S_IROTH | stat.S_IXOTH)
	    except OSError:
		return "chmod error on record's directory."
	
	else:
		return "Error: path of record's file does not exist."	
	
	try:
	        res = es.index(index='test_metadata', doc_type='metadata', body=elasticsearch_record)
	except:
		#Move file back to preprod directory since complete publishing failed
		os.rename(prod_path, preprod_path)
		#Need to reset permissions on file too... TODO!!
		return "Elasticsearch posting error"


	#Create checksum for record's directory
	md5 = hashlib.md5()

	for root, dirs, files in os.walk(prod_path):
		for file in files:
			with open(os.path.join(prod_path, file), 'rb') as f:

			    #while (data = f.read(BUF_SIZE)) is not None:
			    for data in iter(lambda: f.read(BUF_SIZE), b''):
      		        	md5.update(data)

	checksum = md5.hexdigest()

	#Connect to checksum database and insert checksum
	config = get_config(config_file)

    	conn_param = dict(config.items('checksum'))
	time = datetime.now().strftime("%Y-%m-%dT%H:%M:%S") 

	#Take /datastore-pre or /datastore-prod out of path to allow for different mount points in path
	path_without_mount_dir = re.sub(r'^\/datastore-[a-zA-Z]*\/{1}', "", prod_path)

    	#Set up and execute the query
    	query = "INSERT INTO " + conn_param['database'] + "." + conn_param['table'] + " ([path], [md5], [isMetadata], [isCanonicalMetadata], [metadataStandard], [created], [published]) VALUES ('" + path_without_mount_dir  + "', '" + checksum + "', 'true', 'true', '" + schema_type + "', '" + time + "', '" + time + "');"

	try:
	    	with pymssql.connect(host=conn_param['host'], user=conn_param['user'], password=conn_param['password'], database=conn_param['database']) as conn:
			try:
        			with conn.cursor() as cursor:
            				cursor.execute(query)
					conn.commit()
			except:
				#Should move file back to preprod directory in case of failure too

                                return Response('Error: insertion in to checksum database error', status=500)
	except:
		#Should move file back to preprod directory in case of failure too
                return Response('Error: connection to checksum database error', status=500)

	return jsonify(res)

    else:
        return Response('Bad or missing session id.', status=401)

    
@api.route('/api/metadata/<string:_oid>/publish', methods=['POST'])
@cross_origin(origin='*', methods=['POST'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def publish_metadata_record(_oid):
    # update or create record in databas

    username = _authenticate_user_from_session(request)
    session_id = request.json['session_id']
    
    if username:
        try:
            record = Metadata.objects.get_or_404(pk=_oid)
            updater = Metadata.from_json(json.dumps(request.json['record']))
            for f in record._fields:
                if f != 'id':
                    record[f] = updater[f]

        except ValidationError:

            record = Metadata.from_json(json.dumps(request.json['record']))
            record.id = None
            record.placeholder = False

        record.md_pub_date = datetime.utcnow()
        record.save()

        if record.schema_type == 'Dataset (ISO)':
            
            # generate iso string
            str_id = str(record.id)
            iso = get_single_iso_metadata(str_id).data
            
            # print app.config
            save_dir = app.config['PREPROD_DIRECTORY']
            save_path = os.path.join(save_dir,
                                     str_id,
                                     'metadata.xml')

            if not os.path.exists(os.path.dirname(save_path)):
                os.mkdir(os.path.dirname(save_path))

            with open(save_path, 'w+') as f:
                f.write(iso)
            if app.config['PRODUCTION']:

                nkn_upload_url = app.config['SIMPLE_UPLOAD_URL']

                rep = requests.post(nkn_upload_url,{'uuid': str_id, 'session_id': session_id}, files={'uploadedfile': open(save_path, 'rb')})

            #Send email about new dataset 
            email_publishing_group(record.title, record.username, str(record.id))
            
            return jsonify(record=record)

        else:

            str_id = str(record.id)
            dc = get_single_dc_metadata(str_id).data

            # print app.config
            save_dir = app.config['PREPROD_DIRECTORY']

            save_path = os.path.join(save_dir, str_id, 'metadata.xml')

            if not os.path.exists(os.path.dirname(save_path)):
                os.mkdir(os.path.dirname(save_path))

            with open(save_path, 'w+') as f:
                f.write(dc)
                f.close()

            if app.config['PRODUCTION']:
                nkn_upload_url = app.config['SIMPLE_UPLOAD_URL']
                
                rep = requests.post(nkn_upload_url,
                                    {'uuid': str_id,
                                     'session_id': session_id},
                                    files={'uploadedfile': open(save_path, 'rb')})

	    #Save XML file of Dublin record to backend server's file system
#            if 'localhost' not in request.base_url:
#    		username = _authenticate_user_from_session(request)
#                gptInsert.gptInsertRecord(dc, record.title, str_id, username)

            return jsonify(record=record)

    else:
        return Response('Bad or missing session id.', status=401)

        
@api.route('/api/metadata/<string:_oid>/iso')
@cross_origin(origin="*", methods=['GET'])
def get_single_iso_metadata(_oid):
    """
    Produce the ISO 19115 representation of the metadata by
    using an XSLT transform operated on the generic xml found at /xml
    """
    xml_str = get_single_xml_metadata(_oid).data
    md_xml = ET.fromstring(xml_str)
    iso_xslt = ET.parse(os.path.join(os.path.dirname(__file__), '..', '..',
                        'xslt', 'XSLT_for_mdedit.xsl'))
    iso_transform = ET.XSLT(iso_xslt)
    iso_str = str(iso_transform(md_xml))

    return Response(iso_str, 200, mimetype='application/xml')


@api.route('/api/metadata/<string:_oid>/dc')
@cross_origin(origin="*", methods=['GET'])
def get_single_dc_metadata(_oid):
    """
    Produce the Dublin Core representation of the metadata by
    using an XSLT transform operated on the generic xml found at /xml
    """
    xml_str = get_single_xml_metadata(_oid).data
    md_xml = ET.fromstring(xml_str)
    dc_xslt = ET.parse(os.path.join(os.path.dirname(__file__), '..', '..',
                       'xslt', 'XSLT_for_mdedit_dublineCore.xsl'))
    dc_transform = ET.XSLT(dc_xslt)
    dc_str = str(dc_transform(md_xml))

    return Response(dc_str, 200, mimetype='application/xml')


@api.route('/api/metadata/<string:_oid>/esri')
@cross_origin(origin="*", methods=['GET'])
def get_single_esri_metadata(_oid):
    """
    Produce the ESRI combined with ISO representation of the metadata by
    using an XSLT transform operated on the generic xml found at /xml
    """
    xml_str = get_single_xml_metadata(_oid).data
    md_xml = ET.fromstring(xml_str)
    esri_xslt = ET.parse(os.path.join(os.path.dirname(__file__), '..', '..',
                         'xslt', 'XSLT_for_mdedit_ESRI.xsl'))
    esri_transform = ET.XSLT(esri_xslt)
    esri_str = str(esri_transform(md_xml))

    return Response(esri_str, 200, mimetype='application/xml')


@api.route('/api/geocode/<string:place>', methods=['GET'])
@cross_origin(origin='*', methods=['GET'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def get_bbox(place):
    g = geocoder.google(place)
    bbox_dict = dict(north=g.north, south=g.south, east=g.east, west=g.west)
    return jsonify(bbox_dict)


@api.route('/api/metadata/<string:_oid>/xml')
@cross_origin(origin='*', methods=['GET'])
def get_single_xml_metadata(_oid):
    """
    Get the common XML representation of the metadata record with
       given id.
    """
    record = Metadata.objects.get_or_404(pk=_oid)

    json_rec = json.loads(record.to_json())

    d_fmt = '%Y-%m-%d'

    d_fmt1 = '%Y-%m-%dT%H:%M:%SZ'

    try:
        #start/end date might not exist yet
        if record.start_date is not None:
            json_rec['start_date'] = record.start_date.isoformat() + '.000Z'
        if record.end_date is not None:
            json_rec['end_date'] = record.end_date.isoformat() + '.000Z'
        if record.first_pub_date is not None:
            json_rec['first_pub_date'] = record.first_pub_date.strftime(d_fmt)
        if record.md_pub_date is not None:
            json_rec['md_pub_date'] = record.md_pub_date.strftime(d_fmt1)

    except AttributeError:
        # if we get an attribute error, continue; any other error will still
        # cause the program to fail
        pass

    json_rec['last_mod_date'] = record.last_mod_date.strftime(d_fmt1)


    # for XSLT, need something inside of each <item> in this generic XML
    _enclose_word = lambda k: {'word': k}
    _enclose_words = lambda words: map(_enclose_word, words)

    json_rec['thematic_keywords'] = _enclose_words(
                                        json_rec['thematic_keywords'])

    json_rec['place_keywords'] = _enclose_words(json_rec['place_keywords'])

    json_rec['data_format'] = _enclose_words(json_rec['data_format'])

    json_rec['topic_category'] = _enclose_words(json_rec['topic_category'])

    _enclose_url = lambda url: {'url': url}

    json_rec['online'] = map(_enclose_url, json_rec['online'])

    if record.md_pub_date is not None:
        json_rec['download_url'] = \
            app.config['ATTACHMENT_DOWNLOAD_BASE_URL'] + str(record.id)

    xml_str = dicttoxml(dict(record=json_rec))  # , attr_type=False)

    return Response(xml_str, 200, mimetype='application/xml')

# create a new attachment on the record _oid with a POST or delete
# an attachment by its attachmentId on the record with id _oid using DELETE
@api.route('/api/metadata/<string:_oid>/attachments', methods=['POST'])
@api.route('/api/metadata/<string:_oid>/attachments/<attachmentId>',
           methods=['DELETE'])
@cross_origin(origin="*",  methods=['POST', 'DELETE'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def attach_file(_oid, attachmentId=None):
    """
    Add attachment URLs to a metadata record.
    """
    md = Metadata.objects.get_or_404(pk=_oid)
    attachment = ''

    username = _authenticate_user_from_session(request)

    if username:
    
        try:

            if request.method == 'POST':

                attachment = request.json['attachment']
                if 'localhost' in request.url_root:
                    attachment = attachment.replace(' ', '_')

                md.attachments.append(Attachment(url=attachment))

                md.save()

            elif request.method == 'DELETE':

                try:
                    md = Metadata.objects.get(id=_oid)

                    try:
                        # if developing locally we'll also want to remove file
                        url = filter(
                                lambda a: str(a.id) == attachmentId, md.attachments
                            ).pop().url

                        os.remove(
                            os.path.join(
                                app.config['UPLOADS_DEFAULT_DEST'],
                                os.path.basename(url)
                            )
                        )
                    except (OSError, IndexError):
                        pass

                    # don't need to save after this since we're updating existing
                    Metadata.objects(id=_oid).update_one(
                        pull__attachments__id=attachmentId
                    )


                    md = Metadata.objects.get(id=_oid)

                # we'll just go ahead and not care if it doesn't exist
                except ValueError:
                    pass

            else:
                return jsonify({'message': 'HTTP Method must be DELETE or POST'},
                               status=405)

        except KeyError:

            keys = request.json.keys()
            keys_str = ', '.join(keys)
            return jsonify(
                {
                    'message':
                        'Key(s) ' + keys_str + ' not recognized. ' +
                        'Must contain \'attachment\''
                },
                status=400
            )

        return jsonify(dict(message=attachment + ' successfully (at/de)tached!', record=md))
 
    else:
        return Response('Bad or missing session id.', status=401)


# Not actually used in mdedit production at NKN, only for testing.
# Return values mirror those returned by NKN simpleUpload server
@api.route('/api/upload', methods=['POST'])
@cross_origin(origin='*', methods=['POST'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def upload():

    if request.method == 'POST' and 'uploadedfile' in request.files:

        try:
            f = request.files['uploadedfile']
            uuid = request.form['uuid']
            uploadedfiles.save(f, folder=uuid)

            ret = {
                "message": "Upload successful",
                "source": f.filename,
                "url": 'http://localhost:4000/static/uploads/uploadedfiles/' +
                       uuid + '/' + f.filename
            }
            return jsonify(ret)

        except KeyError:
            return jsonify({'message': 'Error: file with css name ' +
                                       '\'uploadedfile\' not found'})


    else:
        return jsonify({'message': 'Error: must upload with POST'},
                       status=405)
 

@api.route('/api/metadata/authenticate-admin', methods=['POST'])
@cross_origin(origin='*', methods=['POST'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def authenticate_admin():
    """
    Checks if user is admin or not. If they are, then return 200,
    else return 401 (authentication error).
    
    """

    print request.json['session_id']
    username = _authenticate_admin_from_session(request)

    if username:
        if username == 'local_user':
            return Response("local_user", 200)
        else:
            return Response(status=200)

    else:
        return Response('Bad or missing session id.', status=401)

"""
Function that emails the NKN publishing group to notify of a new record
"""
def email_publishing_group(record_title, username, id):

    sender = "mdedit@northwestknowledge.net"
    recipient = "portal@northwestknowledge.net"

    msg = MIMEMultipart('alternative')
    msg['Subject'] = "New Dataset Submitted at NKN"
    msg['From'] = sender
    msg['To'] = recipient
                    
    text = "Hi, NKN data publishers.  A new dataset has been submitted for publication<br> in the metadata editor admin interface. Please take a look.\n Record Details:\n \tTitle: " + record_title + "\n\t Date: " + datetime.now().strftime("%Y-%m-%dT%H:%M:%S") + "\n\t User: " + username + "\n\t Doc ID: " + id + "\n\t https://northwestknowledge.net/metadata-editor" 
    html = "<html><head></head><body><p>Hi, NKN data publishers.  A new dataset has been submitted for publication<br> in the metadata editor admin interface.  Please take a look.<br> Record Details:<br><ul><li> Title: " + record_title + "</li><li> Date: " + datetime.now().strftime("%Y-%m-%dT%H:%M:%S") + "</li><li>User: " + username + "</li><li>Doc ID: " + id + "</li></ul><a href=\"https://northwestknowledge.net/metadata-editor\">https://northwestknowledge.net/metadata-editor</a></body></html>"

    part1 = MIMEText(text, 'plain')
    part2 = MIMEText(html, 'html')

    msg.attach(part1)
    msg.attach(part2)

    s = smtplib.SMTP('localhost')
    s.sendmail(sender, recipient, msg.as_string())
    s.quit()

def _authenticate_user_from_session(request):
    """
    Arguments:
        (flask.Request) Incoming API request
    Returns:
        (str): username
    """
    # TODO remove the default setting here. This is saying use a service.
    username_url = (os.getenv('GETUSER_URL') or
                    'https://nknportal-dev.nkn.uidaho.edu/getUsername/')
    try:
        session_id = request.json['session_id']
    except:
        session_id = 'local'

    if session_id == 'local':
        return 'local_user'

    else:
        data = {
            'session_id': session_id,
            'config_kw': 'nknportal'
        }

        res = requests.post(username_url, data=data)

        username = res.json()['username']

        if username:
            return username
        # username will be u'' if the session id was not valid; make explicit
        else:
            return None

def _authenticate_admin_from_session(request):
    """
    Arguments:
        (flask.Request) Incoming API request
    Returns:
        (str): username
    """

    # User is not admin by default. Only authenticated as admin after checking groups.
    is_admin = False

    # TODO remove the default setting here. This is saying use a service.
    
    username_url = (os.getenv('GETUSER_URL') or
                    'https://nknportal-dev.nkn.uidaho.edu/getUsername/')
    try:
        session_id = request.json['session_id']
    except:
        session_id = 'local'

    if session_id == 'local':
        return 'local_user'

    else:
        data = {
            'session_id': session_id,
            'config_kw': 'nknportal'
        }

        res = requests.post(username_url, data=data)

        username = res.json()['username']
        groups = res.json()['groups']
        
        if "cn=publisher,cn=nknportal,cn=nknWebsites,ou=groups,dc=nkn,dc=uidaho,dc=edu" in groups:
            is_admin = True

        if username and is_admin:
            return username
        # username will be u'' if the session id was not valid; make explicit
        else:
            return None


def get_config(config_file):
    """Provide user with a ConfigParser that has read the `config_file`
        Returns:
            (ConfigParser) Config parser with a section for each config
    """
    assert os.path.isfile(config_file), "Config file %s does not exist!" \
        % os.path.abspath(config_file)

    config = ConfigParser.ConfigParser()
    config.read(config_file)

    return config


