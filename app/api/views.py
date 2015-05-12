"""API"""
from copy import copy
from datetime import datetime
from dicttoxml import dicttoxml
from flask import request, jsonify, Response, render_template
from flask_cors import cross_origin
from mongoengine import ObjectIdField

import json

from . import api
from .. import db
from ..models import Metadata


@api.route('/api/metadata', methods=['GET', 'POST', 'PUT'])
@cross_origin(origin='*', methods=['GET', 'POST', 'PUT'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def metadata():
    """Handle get and push requests coming to metadata server"""

    if request.method == 'GET':

        recs = Metadata.objects()
        return jsonify(dict(results=recs))


    # create a new metadata record
    if request.method == 'POST':
        # if no id, it is a new post
        print request.form
        print "STRINGIFIED ******** \n"
        print str(request.form)

        new_md = Metadata.from_web_form(request.form)

        new_md.save()

        panels = new_md.to_web_form()

        # return a JSON record of new metadata to load into the page
        return jsonify(form=[p.to_json() for p in panels])

    # PUT request: edit of existing record
    if request.method == 'PUT':

        data = request.form

        # if there's no id for a PUT it'd be strange, but not impossible
        if data['id'] == '/':
            return render_template('<h1>422: Bad Data</h1><p>Incorrect data '
                                   'for request</p>'), 422

        else:

            return jsonify(data)


@api.route('/api/metadata/<string:_oid>', methods=['GET', 'PUT'])
@cross_origin(origin='*', methods=['GET', 'PUT'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def get_single_metadata(_oid):
    """Get the JSON representation of the metadata record with given id.
    """

    record = request.form

    if request.method == 'PUT':

        md = Metadata.objects.get_or_404(pk=_oid)

        for k, v in record.iteritems():
            if k != 'id':
                if k == 'date':
                    v = datetime.strptime(v, '%Y-%m-%d')

                setattr(md, k, v)

        db.session.add(md)

        db.session.commit()

        md = Metadata.objects.get_or_404(pk=_oid)

        record_dict = {k: v for k, v in md.__dict__.iteritems()
                       if k != '_sa_instance_state'}

        record_dict['date'] = record_dict['date'].strftime('%Y-%m-%d')

        return jsonify(id=id, form=_make_mdform(record_dict, id=id))

    else:

        # record = Metadata.objects.get_or_404(_oid)
        record = Metadata.objects.find_one()
        print record

        return jsonify(record=record)


@api.route('/api/metadata/xml')
@cross_origin(origin='*', methods=['GET'])
def get_xml_metadata():

    recs = Metadata.objects()

    xml_str = dicttoxml(dict(recs=json.loads(recs.to_json())))

    return Response(xml_str, 200, mimetype='application/xml')


@api.route('/api/metadata/<string:_oid>/xml')
@cross_origin(origin='*', methods=['GET'])
def get_single_xml_metadata(_oid):
    """Get the common XML representation of the metadata record with
       given id.
    """
    record = Metadata.objects.get_or_404(pk=_oid)

    xml_str = dicttoxml(dict(record=json.loads(record.to_json())))

    return Response(xml_str, 200, mimetype='application/xml')


@api.route('/api/metadata/form')
@cross_origin(origin='*', methods=['GET', 'POST', 'PUT'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def get_form():

    record = Metadata.objects[0]

    panels = record.to_web_form()

    return jsonify(form=[p.to_json() for p in panels])


@api.route('/api/metadata/<string:_oid>/form')
@cross_origin(origin='*', methods=['GET'])
def get_form_metadata(_oid):
    """Get form data for a given id for display on frontend"""

    record = Metadata.objects.get_or_404(pk=_oid)

    panels = record.to_web_form()

    return jsonify(form=[p.to_json() for p in panels])
