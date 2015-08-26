"""API"""
import json
import os
import lxml.etree as ET

from config import config
from dicttoxml import dicttoxml
from flask import request, jsonify, Response
from flask_cors import cross_origin
from mongoengine import ValidationError

from . import api
from ..models import Metadata


@api.route('/api/metadata', methods=['GET', 'POST', 'PUT'])
@cross_origin(origin='*', methods=['GET', 'POST', 'PUT'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def metadata():
    """Handle get and push requests coming to metadata server"""

    if request.method == 'GET':

        recs = Metadata.objects(
                __raw__={'placeholder': False, 'default': None}
                # '$or': [{'placeholder': 'false'}, {']
                # }
            )

        return jsonify(dict(results=recs))

    if request.method == 'POST':

        new_md = Metadata.from_json(request.data)

        new_md.id = None
        new_md.placeholder = False
        new_md.default = None

        new_md.save()

        # return a JSON record of new metadata to load into the page
        return jsonify(record=new_md)


@api.route('/api/metadata/placeholder', methods=['GET'])
@cross_origin(origin='*', methods=['GET'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def placeholder_metadata():

    record = Metadata.objects.get(placeholder=True)

    return jsonify(record=record)


@api.route('/api/metadata/defaultMILES', methods=['GET'])
@cross_origin(origin='*', methods=['GET'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def defaultMILES_metadata():

    record = Metadata.objects.get(default='miles')

    return jsonify(record=record)


@api.route('/api/metadata/<string:_oid>', methods=['GET', 'PUT'])
@cross_origin(origin='*', methods=['GET', 'PUT'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def get_single_metadata(_oid):
    """Get the JSON representation of the metadata record with given id.
    """

    if request.method == 'PUT':

        existing_record = Metadata.objects.get_or_404(pk=_oid)
        updater = Metadata.from_json(request.data)

        for f in existing_record._fields:
            existing_record[f] = updater[f]

        existing_record.save()

        return jsonify(record=existing_record)

    else:

        record = Metadata.objects.get_or_404(pk=_oid)

        record.format_dates()

        return jsonify(record=record)


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

    # generate iso string
    str_id = str(record.id)
    iso = get_single_iso_metadata(str_id).data

    # save iso string to {_oid}/{_oid}.xml
    save_path = os.path.join(config['default'].PREPROD_DIRECTORY,
                             str_id,
                             str_id + '.xml')

    if not os.path.exists(os.path.dirname(save_path)):
        os.mkdir(os.path.dirname(save_path))

    with open(save_path, 'w+') as f:
        f.write(iso)

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
    #iso_str = '<record>' + str(iso_str) + '</record>'

    return Response(iso_str, 200, mimetype='application/xml')


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

    json_rec['topic_category'] = _enclose_words(json_rec['topic_category'])

    _enclose_url = lambda url: {'url': url}

    json_rec['online'] = map(_enclose_url, json_rec['online'])

    xml_str = dicttoxml(dict(record=json_rec))  # , attr_type=False)

    return Response(xml_str, 200, mimetype='application/xml')
