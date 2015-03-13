"""API"""
from flask_restful import Resource, reqparse

from ..models import Metadata, MD_FORM_DICT


METADATA = {}

parser = reqparse.RequestParser()
for k, v in MD_FORM_DICT.iteritems():
    parser.add_argument(k, type=type(v['value']))


class MetadataResource(Resource):
    """API resource for delivering Metadata model
    """
    def get(self):
        # get metadata dictionary
        return Metadata.to_dict()

    def post(self):
        print "yo"
        print METADATA
        print MD_FORM_DICT
        print parser
        args = parser.parse_args()
        print args
        # resource_id = len(METADATA.keys())
        # print args
        # METADATA.update(args, id=resource_id)
        # print METADATA

        # return METADATA[resource_id], 201
