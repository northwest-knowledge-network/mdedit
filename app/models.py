from datetime import datetime, date
from flask import jsonify
from werkzeug import ImmutableMultiDict

from collections import OrderedDict

import json

from . import db


class Contact(db.EmbeddedDocument):
    """Sub-document for use in list of citation and data access contacts"""
    name = db.StringField(max_length=255, required=False)
    # TODO make this a mongoengine.fields.EmailField
    email = db.StringField(max_length=255, required=False)
    org = db.StringField(max_length=255, required=False)
    address = db.StringField(max_length=255, required=False)
    city = db.StringField(max_length=255, required=False)
    state = db.StringField(max_length=255, required=False)
    country = db.StringField(max_length=255, required=False)
    zipcode = db.StringField(max_length=255, required=False)
    phone = db.StringField(max_length=255, required=False)


class Metadata(db.Document):
    """MongoDB Document representation of metadata"""
    # basic info
    title = db.StringField(max_length=255, required=False)
    last_mod_date = db.DateTimeField(required=False)
    first_pub_date = db.DateTimeField(required=False)
    summary = db.StringField(max_length=3000, required=False)

    # detailed info
    topic_category = db.ListField(db.StringField(max_length=255,
                                                 required=False))
    thematic_keywords = db.ListField(db.StringField(max_length=255))
    place_keywords = db.ListField(db.StringField(max_length=255))
    update_frequency = db.StringField(max_length=255, required=False)
    status = db.StringField(max_length=255, required=False)
    spatial_dtype = db.StringField(max_length=100)
    hierarchy_level = db.StringField(max_length=100)

    # data format details
    data_format = db.ListField(db.StringField(max_length=255), required=False)
    compression_technique = db.StringField(max_length=255)

    # online resources; these are URLs, but opting to be more permissive
    online = db.ListField(db.StringField(max_length=255))

    # use restrictions
    use_restrictions = db.StringField()

    # contacts
    citation = db.ListField(db.EmbeddedDocumentField('Contact'))
    access = db.ListField(db.EmbeddedDocumentField('Contact'))

    # extents
    vertical_max = db.FloatField(required=False)
    vertical_min = db.FloatField(required=False)
    west_lon = db.FloatField(required=False)
    east_lon = db.FloatField(required=False)
    south_lat = db.FloatField(required=False)
    north_lat = db.FloatField(required=False)
    start_date = db.DateTimeField(required=False)
    end_date = db.DateTimeField(required=False)

    placeholder = db.BooleanField(default=False, required=False)
    defaultMILES = db.BooleanField(default=False, required=False)

    meta = {'allow_inheritance': True}

    def format_dates(self):
        """
        Our web form needs the date to be in YYYY-MM-DD (ISO 8601)
        """
        for el in [self.start_date, self.end_date, self.first_pub_date]:
            el = el.isoformat()
