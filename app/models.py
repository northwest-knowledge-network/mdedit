from datetime import datetime, date
from flask import jsonify
from werkzeug import ImmutableMultiDict

from collections import OrderedDict

import json

from . import db


class Contact(db.EmbeddedDocument):
    """Sub-document for use in list of citation and data access contacts"""
    name = db.StringField(max_length=255)
    # TODO make this a mongoengine.fields.EmailField
    email = db.StringField(max_length=255)
    org = db.StringField(max_length=255)
    address = db.StringField(max_length=255)
    city = db.StringField(max_length=255)
    state = db.StringField(max_length=255)
    country = db.StringField(max_length=255)
    zipcode = db.StringField(max_length=255)
    phone = db.StringField(max_length=255)


class Metadata(db.Document):
    """MongoDB Document representation of metadata"""
    # basic info
    title = db.StringField(max_length=255)
    last_mod_date = db.DateTimeField()
    first_pub_date = db.DateTimeField()
    summary = db.StringField(max_length=3000)

    ## detailed info
    # detailed info lists
    topic_category = db.ListField(db.StringField(max_length=255))
    thematic_keywords = db.ListField(db.StringField(max_length=255))
    place_keywords = db.ListField(db.StringField(max_length=255))
    # detailed info strings
    update_frequency = db.StringField(max_length=255)
    status = db.StringField(max_length=255)
    spatial_dtype = db.StringField(max_length=100)
    hierarchy_level = db.StringField(max_length=100)

    # data format details
    data_format = db.ListField(db.StringField(max_length=255))
    compression_technique = db.StringField(max_length=255)

    # online resources; these are URLs, but opting to be more permissive
    online = db.ListField(db.StringField(max_length=255))

    # use restrictions
    use_restrictions = db.StringField(max_length=1000)

    # contacts
    citation = db.ListField(db.EmbeddedDocumentField('Contact'))
    access = db.ListField(db.EmbeddedDocumentField('Contact'))

    # extents
    vertical_max = db.FloatField()
    vertical_min = db.FloatField()
    west_lon = db.FloatField()
    east_lon = db.FloatField()
    south_lat = db.FloatField()
    north_lat = db.FloatField()
    start_date = db.DateTimeField()
    end_date = db.DateTimeField()

    placeholder = db.BooleanField(default=False)

    meta = {'allow_inheritance': True}

    def format_dates(self):
        """
        Our web form needs the date to be in YYYY-MM-DD (ISO 8601)
        """
        for el in [self.start_date, self.end_date, self.first_pub_date]:
            el = el.isoformat()
