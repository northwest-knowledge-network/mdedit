"""API"""
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

        return jsonify({'records': [
            {k: v for k, v in m.__dict__.iteritems()
                if (k != '_sa_instance_state' and k != 'id')}
            for m in metadata]
            })

    # create a new metadata record
    if request.method == 'POST':
        print request.form
        newmd = Metadata.from_json(request.form)

        db.session.add(newmd)
        db.session.commit()

        # return a JSON record of new metadata to load into the page
        return Metadata.to_json()


@api.route('/api/metadata/<int:id>')
@cross_origin(origin='*', methods=['GET'])
def get_single_metadata(id):
    """Get the common XML representation of the metadata record with
       given id.
    """
    record = Metadata.query.get_or_404(id)

    return jsonify(record)


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


def _make_mdform(md_id=None):
    """Make metadata form for display on client.

        Args:
            md_id (int): integer id of particular metadata record

        Returns:
            (list) of metadata blocks for display in Bootstrap panels

    """
    # TODO query Metadata for that record and fill in info. If None, read
    # defaults from some default store.
    return [dict(blockTitle="Basic Information", blockLabel="basic-information",
            expanded="false",
            formElements=[

                dict(label='Title', type='text', order=1,
                     value='Title of my data', name='title',
                     longDescription="E.g., Data for June 2014 Journal of Hydrology Paper"),
                dict(label='Date', type='date', order=1, name='date',
                      value='2015-01-01',  # TODO strfmt now()
                      longDescription='Date data was last updated')]
         ),

        dict(blockTitle="Researcher Information", blockLabel="researcher-information",
         expanded="true",
         formElements=[

             dict(label='Researcher Name', type='text', order=1, name='rname',
                  value='Professor Herod Jones',
                  longDescription='Principal Investigator (may be one of many)'),

             dict(label='Researcher Institute', type='text', order=1,
                  name='rinst',
                  value='University of Idaho',  # TODO strfmt now()
                  longDescription='Home institute during data acquisition')]
         )]
