"""API"""
from flask import request
# from flask_restful import Resource, reqparse
from flask_cors import cross_origin

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
        return Metadata.to_json()

    # create a new metadata record
    if request.method == 'POST':
        print "\n\n*****  IN POST *****\n\n"
        print request.form
        newmd = Metadata.from_json(request.form)

        db.session.add(newmd)
        db.session.commit()

        # return a JSON record of new metadata to load into the page
        return Metadata.to_json(newmd.id)

    if request.method == 'PUT':
        # TODO Is this where modifications should go?
        return Metadata.to_json()
