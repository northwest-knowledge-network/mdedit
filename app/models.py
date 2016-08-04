from bson.objectid import ObjectId
from datetime import datetime

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
    last_mod_date = db.DateTimeField(default=datetime.now)
    first_pub_date = db.DateTimeField()
    summary = db.StringField(max_length=3000)
    username = db.StringField(max_length=255, default="anonymous")

    #to capture type of metadata record - right now iso or dublin core
    schema_type = db.StringField(max_length=255)

    #for last published date for metadata record published to server
    md_pub_date = db.DateTimeField()

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
    use_restrictions = db.StringField()

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

    # request for DOI or ARK
    doi_ark_request = db.StringField(max_length=255)

    # request to be searchable on DataOne
    data_one_search = db.StringField(max_length=255)
    
    # files associated with the metadata record
    attachments = db.EmbeddedDocumentListField('Attachment')

    meta = {'allow_inheritance': True}

    def format_dates(self):
        """
        Our web form needs the date to be in YYYY-MM-DD (ISO 8601)
        """
        for el in [self.start_date, self.end_date, self.first_pub_date]:
            if type(el) is datetime:
                el = el.isoformat()

    def __str__(self):

        return \
            '\n'.join(["{}: {}".format(k, self[k])
                       for k in self._fields_ordered])


class Attachment(db.EmbeddedDocument):
    id = db.ObjectIdField(required=True, default=ObjectId)
    url = db.StringField(required=True)

    def __str__(self):

        return \
            '\n'.join(["{}: {}".format(k, self[k])
                       for k in self._fields_ordered])
