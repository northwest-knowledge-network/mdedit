"""
API Blueprint
"""
# from flask import Blueprint
from flask_restful import Api
from .resources import MetadataResource

api = Api(prefix='/api/metadata')
api.add_resource(MetadataResource, '/')

from . import resources
