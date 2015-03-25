"""API"""
from copy import copy
from datetime import datetime

from flask import request, jsonify, Response
# from flask_restful import Resource, reqparse
from flask_cors import cross_origin

from dicttoxml import dicttoxml

from . import api
from .. import db
from ..models import Metadata


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
        return jsonify(id=id, form=_make_mdform(cpy))


@api.route('/api/metadata/<int:id>')
@cross_origin(origin='*', methods=['GET'])
def get_single_metadata(id):
    """Get the common XML representation of the metadata record with
       given id.
    """
    return _md_to_json(Metadata.query.get_or_404(id))


def _md_to_json(record):
    """Convert Metadata record to JSON according to desired rules.
    """
    return jsonify(dict(id=record.id, date=record.date.strftime('%Y-%m-%d'),
                        rname=record.rname, rinst=record.rinst,
                        title=record.title))



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


def _make_mdform(val_dict=None):
    """Make metadata form for display on client.

        Args:
            md_id (int): integer id of particular metadata record

        Returns:
            (list) of metadata blocks for display in Bootstrap panels

    """
    if not val_dict:
        val_dict = {'title': 'Title of my data',
                    'date': '2015-01-01',
                    'rname': 'Professor Herod Jones',
                    'rinst': 'University of Idaho'}

    return [dict(blockTitle="Basic Information",
            blockLabel="basic-information",
            expanded="false",
            formElements=[

                dict(label='Title', type='text', order=1,
                     value=val_dict['title'], name='title',
                     longDescription="E.g., Data for June 2014 Journal of Hydrology Paper"),
                dict(label='Date', type='date', order=1, name='date',
                     value=val_dict['date'],  # TODO strfmt now()
                     longDescription='Date data was last updated')]
         ),

        dict(blockTitle="Researcher Information", blockLabel="researcher-information",
         expanded="true",
         formElements=[

             dict(label='Researcher Name', type='text', order=1, name='rname',
                  value=val_dict['rname'],
                  longDescription='Principal Investigator (may be one of many)'),

             dict(label='Researcher Institute', type='text', order=1,
                  name='rinst',
                  value=val_dict['rinst'],  # TODO strfmt now()
                  longDescription='Home institute during data acquisition')]
         )]
