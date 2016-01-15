"""
Metadata API

Workflow proceeds as follows:
    * All interactions with metadata records, aside from exporting particular
    records in a particular format (dublin core, iso, etc) are done with PUT,
    POST, or DELETE. POST is used so that user credentials can be sent along
    with request to, say, view all metadata records. If the user is an admin
    they will be able to see all records in the database. If not, the user
    will only be able to see their own records.

    * To submit a new record, the user makes a PUT request to `api/metadata`;
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

from .. import config
from dicttoxml import dicttoxml
from flask import request, jsonify, Response
from flask import current_app as app
from flask_cors import cross_origin
from mongoengine import ValidationError
from datetime import datetime

from . import api
from ..models import Metadata

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

    if username:
        if request.method == 'POST':

            # execute raw MongoDB query and return all of the user's records
            recs = Metadata.objects(
                __raw__={'placeholder': False,
                         'default': None,
                         'username': username}
            )

            return jsonify(dict(results=recs))

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
        return Response('Bad or missing session id.', 401)


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
    # import ipdb; ipdb.set_trace();
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


@api.route('/api/metadata/<string:_oid>/publish', methods=['POST'])
@cross_origin(origin='*', methods=['POST'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def publish_metadata_record(_oid):
    # update or create record in database
    try:
        record = Metadata.objects.get_or_404(pk=_oid)
        updater = Metadata.from_json(request.data)
        for f in record._fields:
            record[f] = updater[f]

    except ValidationError:
        record = Metadata.from_json(request.data)
        record.id = None
        record.placeholder = False
        record.save()

    if record.schema_type == 'Dataset (ISO)':

        # generate iso string
        str_id = str(record.id)
        iso = get_single_iso_metadata(str_id).data

        # print app.config
        save_dir = app.config['PREPROD_DIRECTORY']

        save_path = os.path.join(save_dir,
                             str_id,
                             str_id + '.xml')

        if not os.path.exists(os.path.dirname(save_path)):
            os.mkdir(os.path.dirname(save_path))

        with open(save_path, 'w+') as f:
            f.write(iso)

        if 'localhost' not in request.base_url:
            gptInsert.gptInsertRecord(iso, record.title)

        return jsonify(record=record)

    else:

        str_id = str(record.id)
        dc = get_single_dc_metadata(str_id).data

        # print app.config
        save_dir = app.config['PREPROD_DIRECTORY']

        save_path = os.path.join(save_dir,
                             str_id,
                             str_id + '.xml')

        if not os.path.exists(os.path.dirname(save_path)):
            os.mkdir(os.path.dirname(save_path))

        with open(save_path, 'w+') as f:
            f.write(dc)

        if 'localhost' not in request.base_url:
            gptInsert.gptInsertRecord(dc, record.title)

        return jsonify(record=record)

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

    d_fmt1 = '%Y-%m-%d %I:%M %p GMT'

    try:
        #start/end date might not exist yet
        json_rec['start_date'] = record.start_date.isoformat() + '.000Z'
        json_rec['end_date'] = record.end_date.isoformat() + '.000Z'
        json_rec['first_pub_date'] = record.first_pub_date.strftime(d_fmt)
        json_rec['md_pub_date'] = record.md_pub_date.strftime(d_fmt1)
    except AttributeError:
        # if we get an attribute error, continue; any other error will still 
        #cause the program to fail
        pass

    json_rec['last_mod_date'] = record.last_mod_date.strftime(d_fmt1)


    # for XSLT, need something inside of each <item> in this generic XML
    _enclose_word = lambda k: {'word': k}
    _enclose_words = lambda words: map(_enclose_word, words)

    # def _enclose_word(word):
    #         return {'word': word}

    # def _enclose_words(words):
    #     return [_enclose_word(word) for word in words]

    json_rec['thematic_keywords'] = _enclose_words(
                                        json_rec['thematic_keywords'])

    json_rec['place_keywords'] = _enclose_words(json_rec['place_keywords'])

    json_rec['data_format'] = _enclose_words(json_rec['data_format'])

    json_rec['topic_category'] = _enclose_words(json_rec['topic_category'])

    _enclose_url = lambda url: {'url': url}

    json_rec['online'] = map(_enclose_url, json_rec['online'])

    xml_str = dicttoxml(dict(record=json_rec))  # , attr_type=False)

    return Response(xml_str, 200, mimetype='application/xml')


@api.route('/api/contacts/<string:type_>')
@cross_origin(origin="*", methods=['POST'])
def get_citation_contacts(type_):
    """
    Return contacts that have previously been used for Citation contacts
    by the user.
    """
    username = _authenticate_user_from_session(request)

    if username is None:
        return Response(status=401)

    if type_ not in ('citation', 'access'):

        return Response(response='Type {} not recognized'
                                 ' <img src="https://http.cat/404"/>'.format(
                                     type_
                                 ),
                        status=404)

    user_recs = Metadata.objects(username=username)

    citation_contacts = reduce(
        lambda a, b: a + b, [rec[type_] for rec in user_recs]
    )

    # filter out totally empty contacts
    nonempty_contacts = [
        c for c in citation_contacts
        if not all(
            (val == "" for val in json.loads(c.to_json()).values())
        )
    ]

    return jsonify(dict({'citation_contacts': nonempty_contacts}))


def _authenticate_user_from_session(request):
    """
    Arguments:
        (flask.Request) Incoming API request
    Returns:
        (str): username
    """
    # TODO remove the default setting here. This is saying use a service.
    username_url = (os.getenv('GETUSER_URL') or
                    'https://nkn-dev.nkn.uidaho.edu/getUsername/')

    try:
        session_id = request.json['session_id']
    except:
        session_id = 'local'

    if session_id == 'local':
        return 'local_user'

    else:
        data = {
            'session_id': session_id,
            'config_kw': 'nkn-dev'
        }

        res = requests.post(username_url, data=data)

        username = res.json()['username']
        if username:
            return username
        # username will be u'' if the session id was not valid; make explicit
        else:
            return None
