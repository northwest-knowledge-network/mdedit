"""Metadata server help page views"""
from flask import render_template

from . import main


@main.route('/')
def index():
    """Help page"""

    return render_template('index.html')
