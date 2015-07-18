from datetime import datetime, date
from flask import jsonify
from werkzeug import ImmutableMultiDict

from collections import OrderedDict

import json

from . import db


class Contact(db.EmbeddedDocument):
    """Sub-document for use in list of citation and data access contacts"""
    name = db.StringField(max_length=255, required=True)
    # TODO make this a mongoengine.fields.EmailField
    email = db.StringField(max_length=255, required=True)
    org = db.StringField(max_length=255, required=True)
    address = db.StringField(max_length=255, required=True)
    city = db.StringField(max_length=255, required=True)
    state = db.StringField(max_length=255, required=True)
    country = db.StringField(max_length=255, required=True)
    zipcode = db.StringField(max_length=255, required=True)
    phone = db.StringField(max_length=255, required=True)


class Metadata(db.Document):
    """MongoDB Document representation of metadata"""
    # basic info
    title = db.StringField(max_length=255, required=True)
    last_mod_date = db.DateTimeField(required=True)
    first_pub_date = db.DateTimeField(required=True)
    summary = db.StringField(max_length=255, required=True)

    # detailed info
    topic_category = db.ListField(db.StringField(max_length=255,
                                                 required=True))
    thematic_keywords = db.ListField(db.StringField(max_length=255))
    place_keywords = db.ListField(db.StringField(max_length=255))
    update_frequency = db.StringField(max_length=255, required=True)
    status = db.StringField(max_length=255, required=True)
    spatial_dtype = db.StringField(max_length=100)
    hierarchy_level = db.StringField(max_length=100)

    # data format details
    data_format = db.ListField(db.StringField(max_length=255), required=True)
    compression_technique = db.StringField(max_length=255)

    # online resources; these are URLs, but opting to be more permissive
    online = db.ListField(db.StringField(max_length=255))

    # contacts
    citation = db.ListField(db.EmbeddedDocumentField('Contact'))
    access = db.ListField(db.EmbeddedDocumentField('Contact'))

    # extents
    vertical_max = db.FloatField(required=False)
    vertical_min = db.FloatField(required=False)
    west_lon = db.FloatField(required=True)
    east_lon = db.FloatField(required=True)
    south_lat = db.FloatField(required=True)
    north_lat = db.FloatField(required=True)
    start_date = db.DateTimeField(required=True)
    end_date = db.DateTimeField(required=True)

    placeholder = db.BooleanField(default=False, required=False)

    meta = {'allow_inheritance': True}

    def format_dates(self):
        """
        Our web form needs the date to be in YYYY-MM-DD (ISO 8601)
        """
        for el in [self.start_date, self.end_date, self.first_pub_date]:
            el = el.isoformat()
