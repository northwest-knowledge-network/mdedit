"""API"""
from flask_restful import Resource

from ..models import Metadata


class MetadataResource(Resource):
    """API resource for delivering Metadata model
    """
    def get(self):
        return Metadata.to_dict()
