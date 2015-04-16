from flask import jsonify

from . import db


class Contact(db.EmbeddedDocument):
    """Sub-document for use in list of citation and data access contacts"""
    name = db.StringField(max_length=255, required=True)
    org = db.StringField(max_length=255, required=True)
    address = db.StringField(max_length=255, required=True)
    city = db.StringField(max_length=255, required=True)
    state = db.StringField(max_length=255, required=True)
    country = db.StringField(max_length=255, required=True)
    zipcode = db.StringField(max_length=255, required=True)
    phone = db.StringField(max_length=255, required=True)


class Metadata(db.Document):
    """MongoDB Document representation of metadata"""
    title = db.StringField(max_length=255, required=True)
    summary = db.StringField(max_length=255, required=True)
    first_pub_date = db.DateTimeField(required=True)
    last_mod_date = db.DateTimeField(required=True)
    theme_keywords = db.StringField(max_length=255)
    place_keywords = db.StringField(max_length=255)

    citation = db.ListField(db.EmbeddedDocumentField('Contact'))
    access = db.ListField(db.EmbeddedDocumentField('Contact'))

    meta = {'allow_inheritance': True}


def _md_to_json(record):
    """Convert Metadata record to JSON according to desired rules.
    """
    return jsonify(dict(id=record.id, date=record.date.strftime('%Y-%m-%d'),
                        rname=record.rname, rinst=record.rinst,
                        title=record.title))
