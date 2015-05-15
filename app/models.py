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
    title = db.StringField(max_length=255, required=True)
    last_mod_date = db.DateTimeField(required=True)
    first_pub_date = db.DateTimeField(required=True)


    summary = db.StringField(max_length=255, required=True)
    topic_category = db.StringField(max_length=255, required=True)
    theme_keywords = db.ListField(db.StringField(max_length=255))
    place_keywords = db.ListField(db.StringField(max_length=255))
    status = db.StringField(max_length=255, required=True)

    citation = db.ListField(db.EmbeddedDocumentField('Contact'))
    access = db.ListField(db.EmbeddedDocumentField('Contact'))

    meta = {'allow_inheritance': True}

    @classmethod
    def from_web_form(cls, form_data):
        """
        Take a Werkzeug ImmutableMultiDict with numbered contact fields for
        citation and data access and convert it to a Metadata entry.

        Expect it to have the following structure

        {
            'summary': '...',
            'place-keywords': '...',
            'access-name-1': '...',
            'access-email-1': '...',
            'access-name-2': '...',
            'access-email-2': '...',
            ...
        }

        with the same structure for the citation contact information. So we
        have a totally flat dictionary. This will become

        {
            'summary': '...',
            'place-keywords': '...',
            'access': [
                {
                    'name': 'larry',
                    'email': 'bird@birdspot.org'
                },
                {
                    'name': 'ringo',
                    'email': 'mostgenius@beatles.net'
                }
            ],
            'citation': [
                {
                    'name': 'Dusty',
                    'email': 'RhodesCollar@durp.edu'
                },...]
            ...
        }

        and we can use db.Document.
        """
        assert type(form_data) is ImmutableMultiDict, \
            "form_data should be an ImmutableMultiDict"

        if not IsValidFormData(form_data):
            pass  # TODO raise 400-ish

        assert form_data['status'] in STATUS_OPTIONS, "Invalid status!"

        assert form_data['topic_category'] in TOPIC_CATEGORY_OPTIONS, \
            "Invalid Topic Category!"


        # these are the lengths of the contact lists passed from the server
        access_len = _get_contact_len('access', form_data)
        citation_len = _get_contact_len('citation', form_data)

        # create a dictionary of the non-contact fields
        formatted_dict = {k: form_data[k] for k in form_data.keys()
                          if k.split('-')[0] not in ['citation', 'access']}

        # make a list out of comma-separated keywords
        listify = lambda s: s.replace(' ', '').split(',')

        formatted_dict['place_keywords'] = \
            listify(formatted_dict['place_keywords'])

        formatted_dict['theme_keywords'] = \
            listify(formatted_dict['theme_keywords'])

        # by adding this info, the dictionary can be loaded to mongo
        formatted_dict['access'] = [{} for i in range(access_len)]
        formatted_dict['citation'] = [{} for i in range(citation_len)]

        # iterate through the keys and find the access/citation contacts;
        # add these to (the properly) formatted_dict
        for k in form_data.keys():
            kspl = k.split('-')
            if kspl[0] in ['citation', 'access']:
                # import ipdb; ipdb.set_trace()
                formatted_dict[kspl[0]][int(kspl[2])][kspl[1]] = form_data[k]

        formatted_dict['last_mod_date'] = date.today().strftime('%Y-%m-%d')

        return Metadata.from_json(json.dumps(formatted_dict))

    def to_web_form(self):
        """
        Using the layout_doc, create the web form.
        """
        if type(self.last_mod_date) is datetime.date:
            self.last_mod_date = \
                datetime.strftime(self.last_mod_date, '%Y-%m-%d')

        if type(self.last_mod_date) is datetime.date:
            self.first_pub_date = \
                datetime.strftime(self.first_pub_date, '%Y-%m-%d')

        return _web_form_layout(self)


def _get_contact_len(access_or_citation, form_data):
    "Get the length of the contact list for access or citation contacts"
    # need to add +1 because numbering starts at zero
    return max([int(k.split('-')[-1]) for k in form_data.keys()
                if k.split('-')[0] == access_or_citation]) + 1


def IsValidFormData(form_data):
    """
    Checks that all expected values are present in the form data. Effectively
    enforces our current schema on incoming data.
    """


class Panel(object):
    """Container for the metadata form page's `panels
       <http://getbootstrap.com/components/#panels>`_
    """
    def __init__(self, title='Default Panel Title',
                 label='default-panel-title', form_fields=None):

        self.title = title
        self.label = label
        self.form_fields = []

        if form_fields:

            if (type(form_fields[0]) is FormField
                or type(form_fields[0]) is SelectField):

                self.form_fields = form_fields

            elif type(form_fields[0]) is tuple:
                self.form_fields = [field
                                    for fields in form_fields
                                    for field in fields]

        else:
            self.form_fields = [FormField()]

        # the form_fields should always be output as a list
        assert type(self.form_fields) is list, \
            "Check Input: Output form_fields is not a list!"

    def __repr__(self):
        sd = self.__dict__.copy()
        sd['form_fields'] = [f.__dict__ for f in sd['form_fields']]
        return str(sd)

    def to_json(self):
        sd = self.__dict__.copy()
        sd['form_fields'] = [f.__dict__ for f in sd['form_fields']]
        return sd


class FormField(object):
    """Container for an element that populates a single form field"""
    def __init__(self, label='default-label', name='default name',
                 type_='text', value='default-val',
                 long_description='a new metadata entry!'):
        self.label = label
        self.name = name
        self.type = type_
        self.value = value

class SelectField(object):
    """
    Represents a <select><option ..>Option 1</option></select> field
    """
    def __init__(self, label='default-label', name='default name',
                 value='default-val', options=["option-1", "option-2"],
                 selected_option="option-1"):

        self.label = label
        self.name = name

        assert selected_option in options, "Default option not in given options"

        self.options = [{"value": op} for op in options]

        self.selected_option = selected_option

        # use this for explicit check on front end that this is in fact <select>
        self.select = True


STATUS_OPTIONS = ["Completed", "Continually Updated", "In Process",
                  "Planned", "Needs to be Generated or Updated",
                  "Stored in an Online Facility", "No Longer Valid"]


TOPIC_CATEGORY_OPTIONS = \
    ["Biota", "Boundaries", "Climatology/Meterology/Atmosphere",
     "Economy", "Elevation", "Environment", "Farming",
     "Geoscientific Information", "Health", "Imagery/Base Maps/Earth Cover",
     "Inland Waters", "Location", "Military Intelligence", "Oceans", "Planning/Cadastre",
     "Society", "Structure", "Transportation", "Utilities/Communication"]


def _web_form_layout(mongo_record):
    """
    Build a dict representing the web form to be serialized to JSON in
    Metadata.to_web_form

    Arguments:
        (mongoengine.Document) Metadata instance to be represented by web form

    Returns:
        (dict) Representation of Metadata instance as a web form
    """
    # this is our metadata form Python model. feels like it should be elsewhere
    metadata_form_layout = OrderedDict([
        ('Basic Information', [
            FormField(label='Title', name='title',
                      type_='text', value=mongo_record['title']),
            FormField(label='First Published', name='first_pub_date',
                      type_='date', value=mongo_record['first_pub_date']),
            # this is a hidden field
            FormField(label='id', name='id', type_='hidden', value=str(mongo_record.id))
            ]),
        ('Data Information', [
            SelectField(label='Topic Category', name='topic_category',
                        options=TOPIC_CATEGORY_OPTIONS,
                        selected_option=mongo_record['topic_category']),
            FormField(label='Summary', name='summary',
                      type_='text', value=mongo_record['summary']),
            FormField(label='Thematic Keywords', name='theme_keywords',
                      type_='text', value=mongo_record['theme_keywords']),
            FormField(label='Place Keywords', name='place_keywords',
                      type_='text', value=mongo_record['place_keywords']),
            SelectField(label='Status', name='status',
                        options=STATUS_OPTIONS,
                        selected_option=mongo_record['status'])
            ]),

        ('Citation Contact', [FormField(label=f.capitalize(),
                                        name='citation-{}-{}'.format(f, i),
                                        type_='text',
                                        value=mongo_record['citation'][i][f])

                              for f in Contact.__dict__['_fields'].keys()
                             for i in range(len(mongo_record['citation']))]),

        ('Access Contact', [FormField(label=f.capitalize(),
                                     name='access-{}-{}'.format(f, i),
                                     type_='text',
                                     value=mongo_record['access'][i][f])

                             for f in Contact.__dict__['_fields'].keys()
                            for i in range(len(mongo_record['access']))])
        ])


    metadata_form_layout['Basic Information'][-1].is_id = True

    panels = [Panel(k, k.lower(), form_fields=v) for
              k, v in metadata_form_layout.iteritems()]

    return panels
