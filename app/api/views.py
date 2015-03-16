"""API"""
from flask import request, jsonify
# from flask_restful import Resource, reqparse
from flask_cors import cross_origin

import json

from . import api
from ..models import Metadata


METADATA = {}


@api.route('/api/metadata', methods=['GET', 'POST'])
@cross_origin(origin='*', methods=['GET', 'POST', 'OPTIONS'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def metadata():
    """Handle get and push requests coming to metadata server"""
    print request.form
    print request.method

    if request.method == 'GET':
        # creates 'jsonify'd Response; default code is 200, correct for this
        return Metadata.to_json()

    if request.method == 'POST':

        print request.form
        print type(request.form)

        # print ret

        # with (date.now().strfmt(
        # return jsonify(request.form)
        return Metadata.to_json()
