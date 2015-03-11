"""
Main blueprint: Provides documentation on the API
"""
from flask import Blueprint

main = Blueprint('main', __name__)

from . import views
