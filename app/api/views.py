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

        recs = Metadata.objects(placeholder=False)
        return jsonify(dict(results=recs))

    if request.method == 'POST':

        new_md = Metadata.from_json(request.data)

        new_md.id = None
        new_md.placeholder = False


        new_md.save()

        # import ipdb; ipdb.set_trace()

        # return a JSON record of new metadata to load into the page
        return jsonify(record=new_md)


@api.route('/api/metadata/placeholder', methods=['GET'])
@cross_origin(origin='*', methods=['GET'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def placeholder_metadata():

    record = Metadata.objects.get(placeholder=True)

    return jsonify(record=record)


@api.route('/api/metadata/<string:_oid>', methods=['GET', 'PUT'])
@cross_origin(origin='*', methods=['GET', 'PUT'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def get_single_metadata(_oid):
    """Get the JSON representation of the metadata record with given id.
    """

    if request.method == 'PUT':

        existing_record = Metadata.objects.get_or_404(pk=_oid)

        for f in existing_record._fields:
            existing_record[f] = Metadata.from_json(request.data)[f]

        existing_record.save()

        return jsonify(record=existing_record)

    else:

        record = Metadata.objects.get_or_404(pk=_oid)

        record.format_dates()

        return jsonify(record=record)


@api.route('/api/metadata/<string:_oid>/xml')
@cross_origin(origin='*', methods=['GET'])
def get_single_xml_metadata(_oid):
    """Get the common XML representation of the metadata record with
       given id.
    """
    record = Metadata.objects.get_or_404(pk=_oid)

    json_rec = json.loads(record.to_json())

    d_fmt = '%Y-%m-%d'

    json_rec['start_date'] = record.start_date.isoformat() + '.000Z'
    json_rec['end_date'] = record.end_date.isoformat() + '.000Z'
    json_rec['last_mod_date'] = record.last_mod_date.strftime(d_fmt)
    json_rec['first_pub_date'] = record.first_pub_date.strftime(d_fmt)

    # for XSLT, need something inside of each <item> in this generic XML
    _enclose_word = lambda k: {'word': k}
    _enclose_words = lambda words: map(_enclose_word, words)

    json_rec['thematic_keywords'] = _enclose_words(
                                        json_rec['thematic_keywords'])

    json_rec['place_keywords'] = _enclose_words(json_rec['place_keywords'])

    json_rec['data_format'] = _enclose_words(json_rec['data_format'])

    _enclose_url = lambda url: {'url': url}

    json_rec['online'] = map(_enclose_url, json_rec['online'])

    xml_str = dicttoxml(dict(record=json_rec))  # , attr_type=False)

    return Response(xml_str, 200, mimetype='application/xml')
