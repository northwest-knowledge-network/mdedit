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
    resource_url = db.ListField(db.StringField(max_length=255))
    # online resource descriptions; these are objects describing the 
    # online resource in the same index location in the online array
    resource_url_description = db.ListField(db.EmbeddedDocumentField('OnlineDescription'))
    
class Identifier(db.EmbeddedDocument):
    """Class for Identifier, which holds DOI's, ARK's, and whatever other identifier you want"""
    type = db.StringField(max_length=255)
    id = db.StringField(max_length=255)

class OnlineDescription(db.EmbeddedDocument):
    """Class for information describing an online resource """
    type = db.StringField(max_length=255)
    description = db.StringField(max_length=255)
    file_size = db.StringField(max_length=255)
    size_unit = db.StringField(max_length= 255)

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

    #If record has been submitted for publication or not
    published = db.StringField(max_length=10)
    
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

    # online resource descriptions; these are objects describing the 
    # online resource in the same index location in the online array
    online_description = db.ListField(db.EmbeddedDocumentField('OnlineDescription'))

    # use restrictions
    use_restrictions = db.StringField()

    #If user defined use restriction has been used
    user_defined_use_restrictions = db.BooleanField();

    #If user defined use restriction has been used
    references_existing_data = db.BooleanField();

    #research methods
    research_methods = db.StringField()

    #reference system: what kind of coordinate system and datum.
    reference_system = db.StringField(max_length=255)
    
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

    #identifiers: ID, DOI, and ARK
    identifiers = db.ListField(db.EmbeddedDocumentField('Identifier'))
    
    # request for DOI or ARK
    doi_ark_request = db.StringField(max_length=255)

    # Assigned DOI or ARK
    assigned_doi_ark = db.StringField(max_length=255)

    # request to be searchable on DataOne
    data_one_search = db.StringField(max_length=255)
    
    # files associated with the metadata record
    attachments = db.EmbeddedDocumentListField('Attachment')

    #Statistics on known file size of the uploaded file input by the user
    uploaded_file_size = db.StringField(max_length=255)
    uploaded_file_size_unit = db.StringField(max_length=255)
    uploaded_file_description = db.StringField(max_length=255)

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


class Metadata_Subset(db.Document):
    """MongoDB Document representation of subset of metadata for Elasticsearch. """
    # basic info
    title = db.StringField(max_length=255)
    abstract = db.StringField(max_length=3000)

    # contacts
    contacts = db.ListField(db.EmbeddedDocumentField('Contact'))

    # extents
    sbeast = db.FloatField()
    sbnorth = db.FloatField()
    sbsouth = db.FloatField()
    sbwest = db.FloatField()

    #Keywords
    keywords = db.ListField(db.StringField(max_length=512))
    
    #Path on file system to XML file
    mdXmlPath = db.StringField(max_length=256)
    
    #identifiers: ID, DOI, and ARK
    #identifiers = db.ListField(db.EmbeddedDocumentField('Identifier'))
    identifiers = db.ListField(db.StringField(max_length=255))


    uid = db.StringField(max_length=256)

    #Source of the record: metadata editor or harvest?
    record_source = db.StringField(max_length=255)

    meta = {'allow_inheritance': True}

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
