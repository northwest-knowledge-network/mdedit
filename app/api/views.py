"""API"""
from copy import copy
from datetime import datetime

from flask import request, jsonify, Response, render_template
# from flask_restful import Resource, reqparse
from flask_cors import cross_origin

from dicttoxml import dicttoxml

from . import api
from .. import db
from ..models import Metadata, _md_to_json


@api.route('/api/metadata', methods=['GET', 'POST', 'PUT'])
@cross_origin(origin='*', methods=['GET', 'POST', 'PUT'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def metadata():
    """Handle get and push requests coming to metadata server"""

    if request.method == 'GET':
        # creates 'jsonify'd Response; default code is 200, correct for this
        metadata = Metadata.query.all()

        # TODO is this the right way to do to_dict() in Metadata?
        recs = {'records': [
            {k: v for k, v in m.__dict__.iteritems()
                if (k != '_sa_instance_state' and k != 'id')}
            for m in metadata]
            }

        for rec in recs['records']:
            rec['date'] = rec['date'].strftime('%Y-%m-%d %H:%m:%S')

        return jsonify(recs)

    # create a new metadata record
    if request.method == 'POST':
        # if no id, it is a new post
        print request.form
        newmd = Metadata.from_json(request.form)
        print newmd.__dict__
        cpy = copy(newmd)

        db.session.add(newmd)
        db.session.commit()

        cpy = {k: v for k, v in cpy.__dict__.iteritems()
               if k != '_sa_instance_state'}

        print cpy
        cpy['date'] = datetime.strftime(cpy['date'], '%Y-%m-%d')

        id = db.session.query(db.func.max(Metadata.id)).scalar()

        # return a JSON record of new metadata to load into the page
        return jsonify(id=id, form=_make_mdform(cpy, id=id))

    # PUT request: edit of existing record
    if request.method == 'PUT':

        data = request.form

        # if there's no id for a PUT it'd be strange, but not impossible
        if data['id'] == '/':
            return render_template('<h1>422: Bad Data</h1><p>Incorrect data '
                                   'for request</p>'), 422

        else:

            return jsonify(data)


@api.route('/api/metadata/<int:id>', methods=['GET', 'PUT'])
@cross_origin(origin='*', methods=['GET', 'PUT'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def get_single_metadata(id):
    """Get the JSON representation of the metadata record with given id.
    """

    record = request.form
    print request.method

    if request.method == 'PUT':

        md = Metadata.query.get_or_404(id)

        for k, v in record.iteritems():
            if k != 'id':
                if k == 'date':
                    v = datetime.strptime(v, '%Y-%m-%d')

                setattr(md, k, v)

        db.session.add(md)

        db.session.commit()

        md = Metadata.query.get_or_404(id)

        record_dict = {k: v for k, v in md.__dict__.iteritems()
                       if k != '_sa_instance_state'}

        record_dict['date'] = record_dict['date'].strftime('%Y-%m-%d')

        return jsonify(id=id, form=_make_mdform(record_dict, id=id))

    else:

        record = Metadata.query.get_or_404(id)

        return _md_to_json(record)


@api.route('/api/metadata/<int:id>/form')
@cross_origin(origin='*', methods=['GET'])
def get_form_metadata(id):
    """Get form data for a given id for display on frontend"""
    record = Metadata.query.get_or_404(id)
    form_dict = {k: v for k, v in record.__dict__.iteritems()
                 if (k != '_sa_instance_state' and k != 'id')}

    form_dict['date'] = form_dict['date'].strftime('%Y-%m-%d')

    form = _make_mdform(form_dict, id=id)

    return jsonify(id=id, form=form)


@api.route('/api/metadata/<int:id>/xml')
@cross_origin(origin='*', methods=['GET'])
def get_xml_metadata(id):
    """Get the common XML representation of the metadata record with
       given id.
    """
    record = Metadata.query.get_or_404(id)

    return Response(dicttoxml({k: v for k, v in record.__dict__.iteritems()
                               if (k != '_sa_instance_state' and k != 'id')}),
                    200, mimetype='application/xml')


@api.route('/api/metadata/form')
@cross_origin(origin='*', methods=['GET', 'POST', 'PUT'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def get_form():
    return jsonify(form=_make_mdform())


def _make_mdform(val_dict=None, id=None):
    """Make metadata form for display on client.

        Args:
            md_id (int): integer id of particular metadata record

        Returns:
            (list) of metadata blocks for display in Bootstrap panels

    """
    topic_categories = \
        ['Biota', 'Boundaries', 'Climatology/Meterology/Atmosphere',
         'Economy', 'Elevation', 'Environment', 'Farming',
         'Geoscientific Information', 'Health',
         'Imagery/Base Maps/Earth Cover', 'Inland Waters', 'Location',
         'Military Intelligence', 'Oceans', 'Planning/Cadastre', 'Society',
         'Structure', 'Transportation', 'Utilities/Communication']

    if not val_dict:
        today = datetime.today()
        today = datetime.strftime(today, '%Y-%m-%d')

        val_dict = {'title': 'Title of my data',
                    'first-published-date': '2015-01-01',
                    'last-modified-date': today,
                    'citation-name': 'Professor Jimmy Jones',
                    'citation-org': 'University of Idaho',
                    'citation-address': '',
                    'citation-city': '',
                    'citation-state': '',
                    'citation-zipcode': '',
                    'citation-country': 'USA',
                    'citation-phone': '',
                    'citation-summary': '',
                    'topic-category': topic_categories,
                    'theme-keywords': 'water, drought',
                    'place-keywords': 'Great Basin, High Plateau',
                    'status': ['completed', 'continually updated',
                               'in progress', 'planned'],
                    'access-org': 'Northwest Knowledge Network',
                    'access-name': 'Dr. Luke Sheneman',
                    'access-address': '875 Perimeter Drive MS 2358',
                    'access-city': 'Moscow',
                    'access-state': 'ID',
                    'access-country': 'USA',
                    'access-phone': '(208) 885-2080',
                    'access-email': 'info@northwestknowledge.net',
                    'access-online': 'www.northwestknowledge.net',
                    'access-zipcode': '83843'
                    }

    return [
        dict(blockTitle="Basic Information",
             blockLabel="basic-information",
             expanded="false",
             formElements=[
             dict(label='Title', type='text', order=1,
                  value=val_dict['title'], name='title',
                  longDescription="E.g., Data for June 2014 Journal of Hydrology Paper"),

             dict(label='Date Published', type='date', order=1, name='first-published-date',
                  value=val_dict['first-published-date'],
                  longDescription='Date data was first published'),

             dict(label='Date Last Modified', type='date', order=1, name='last-modified-date',
                  value=val_dict['last-modified-date'],
                  longDescription='Date data or metadata was last updated'),

            dict(type='hidden', id='hidden-form-id', value=id)
            ]
         ),

        dict(blockTitle="Data Summary",
             blockLabel="data-information",
             expanded="false",
             formElements=[

             dict(label='Summary', type='text', name='summary',
                  value=val_dict['citation-summary'],
                  longDescription='Summary of the data'),

             dict(label='Thematic Keywords', type='text', name='thematic-keywords',
                 value=val_dict['theme-keywords'],
                 longDescription='Comma-separated list of keywords that do not' +\
                                 ' describe location'),

             dict(label='Place Keywords', type='text', name='place-keywords',
                 value=val_dict['place-keywords'],
                 longDescription='Comma-separated list of keywords that' +\
                                 ' describe location')
             ]
        ),

        dict(blockTitle="Citation Information",
             blockLabel="citation-information",
             expanded="true",
             formElements=[

             dict(label='Name', type='text', order=1, name='citation-name',
                  value=val_dict['citation-name'],
                  longDescription='Principal Investigator (may be one of many)'),

             dict(label='Organization/Affiliation', type='text', order=1,
                  name='citation-org',
                  value=val_dict['citation-org'],  # TODO strfmt now()
                  longDescription='Home institute during data acquisition'),

             dict(label='Address', type='text', name='citation-address',
                  value=val_dict['citation-address'],
                  longDescription='Organization\'s address'),

             dict(label='City', type='text', name='citation-city',
                  value=val_dict['citation-city'],
                  longDescription='Organization City'),

             dict(label='State', type='text', name='citation-state',
                  value=val_dict['citation-state'],
                  longDescription='Organization State'),

             dict(label='Country', type='text', name='citation-country',
                  value=val_dict['citation-country'],
                  longDescription='Organization Country'),

             dict(label='Zip Code', type='text', name='citation-zipcode',
                  value=val_dict['citation-zipcode'],
                  longDescription='Organization Zipcode'),

             dict(label='Phone Number', type='text', name='citation-phone',
                  value=val_dict['citation-phone'],
                  longDescription='Organization Phone Number')
             ]
         ),

        dict(blockTitle="Data Access Information",
             blockLabel="access-information",
             expanded="true",
             formElements=[

             dict(label='Name', type='text', order=1, name='access-name',
                  value=val_dict['access-name'],
                  longDescription='Point of contact for data storage'),

             dict(label='Organization/Affiliation', type='text', order=1,
                  name='access-org',
                  value=val_dict['access-org'],  # TODO strfmt now()
                  longDescription='Organization that is storing the data'),

             dict(label='Address', type='text', name='access-address',
                  value=val_dict['access-address'],
                  longDescription='Data storage organization\'s address'),

             dict(label='City', type='text', name='access-city',
                  value=val_dict['access-city'],
                  longDescription='Data storage organization\'s city'),

             dict(label='State', type='text', name='access-state',
                  value=val_dict['access-state'],
                  longDescription='Data storage organization state'),

             dict(label='Country', type='text', name='access-country',
                  value=val_dict['access-country'],
                  longDescription='Data storage organization country'),

             dict(label='Zip Code', type='text', name='access-zipcode',
                  value=val_dict['access-zipcode'],
                  longDescription='Data storage organization zipcode'),

             dict(label='Phone Number', type='text', name='access-phone',
                  value=val_dict['access-phone'],
                  longDescription='Data storage organization phone number')
             ]
         )


        ]
