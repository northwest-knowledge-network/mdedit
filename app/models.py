from datetime import datetime
from flask import jsonify
from werkzeug import ImmutableMultiDict

import json

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

        # these are the lengths of the contact lists passed from the server
        access_len = _get_contact_len('access', form_data)
        citation_len = _get_contact_len('citation', form_data)

        # create a dictionary of the non-contact fields
        formatted_dict = {k: form_data[k] for k in form_data.keys()
                          if k.split('-')[0] not in ['citation', 'access']}

        # by adding this info, the dictionary can be loaded to mongo
        formatted_dict['access'] = [{} for i in range(access_len)]
        formatted_dict['citation'] = [{} for i in range(citation_len)]

        # iterate through the keys and find the access/citation contacts;
        # add these to (the properly) formatted_dict
        for k in form_data.keys():
            kspl = k.split('-')
            if kspl[0] in ['citation', 'access']:
                formatted_dict[kspl[0]][int(kspl[2])-1][kspl[1]] = form_data[k]

        return Metadata.from_json(json.dumps(formatted_dict))

    def to_web_panels(self, layout_doc='standard_form_layout.json'):
        """
        Using the layout_doc, create the web form.
        """
        self.last_mod_date = \
            datetime.strftime(self.last_mod_date, '%Y-%m-%d')

        self.first_pub_date = \
            datetime.strftime(self.first_pub_date, '%Y-%m-%d')

        return _make_form_panels(self)


def _get_contact_len(access_or_citation, form_data):
    "Get the length of the contact list for access or citation contacts"
    return max([int(k.split('-')[-1]) for k in form_data.keys()
                if k.split('-')[0] == access_or_citation])


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
                 label='default-panel-title', expanded='false',
                 form_fields=None):

        self.title = title
        self.label = label
        self.expanded = expanded

        if form_fields:

            if type(form_fields[0]) is FormField:
                self.form_fields = form_fields

            # TODO currently this transforms the dates? anyway contat info is
            # missing
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
                 longDescription='a new metadata entry!'):
        self.label = label
        self.name = name
        self.type = type_
        self.value = value


def _make_form_panels(metadata):
    """Make panels used in building the form via templates/api/form.json.
       Expects a Metadata object (app.models)
    """
    basic_fields = \
        [FormField('Title', 'title', 'text', metadata['title']),
         FormField('Date Published', 'first-published-date', 'date',
                   metadata['first_pub_date']),
         FormField('Date Last Modified', 'last-modified-date', 'date',
                   metadata['last_mod_date'])]

    data_fields = \
        [FormField('Summary', 'summary', 'text', metadata['summary']),
         FormField('Thematic Keywords', 'thematic-keywords', 'text',
                   metadata['theme_keywords']),
         FormField('Place Keywords', 'place-keywords', 'text',
                   metadata['place_keywords'])]

    n_citations = len(metadata['citation'])
    citation_fields = \
        [(FormField('Name '+str(i+1),
                    'citation-name-'+str(i+1), 'text',
                    metadata['citation'][i]['name']),
          FormField('Organization/Affiliation '+str(i+1), 'citation-org-'+str(i+1),
                    'text', metadata['citation'][i]['org']),
          FormField('Address '+str(i+1), 'citation-address-'+str(i+1),
                    'text', metadata['citation'][i]['address']),
          FormField('City '+str(i+1), 'citation-city-'+str(i+1),
                    'text', metadata['citation'][i]['city']),
          FormField('State '+str(i+1), 'citation-state-'+str(i+1),
                    'text', metadata['citation'][i]['state']),
          FormField('Country '+str(i+1), 'citation-country-'+str(i+1),
                    'text', metadata['citation'][i]['country']),
          FormField('Zip Code '+str(i+1), 'citation-zipcode-'+str(i+1),
                    'text', metadata['citation'][i]['zipcode']),
          FormField('Phone Number '+str(i+1), 'citation-phone-'+str(i+1),
                    'text', metadata['citation'][i]['phone']))

         for i in range(n_citations)]

    n_access = len(metadata['access'])
    access_fields = \
        [(FormField('Name '+str(i+1), 'access-name-'+str(i+1),
                    'text', metadata['access'][i]['name']),
          FormField('Organization/Affiliation '+str(i+1), 'access-org-'+str(i+1),
                    'text', metadata['access'][i]['org']),
          FormField('Address '+str(i+1), 'access-address-'+str(i+1),
                    'text', metadata['access'][i]['address']),
          FormField('City '+str(i+1), 'access-city-'+str(i+1),
                    'text', metadata['access'][i]['city']),
          FormField('State '+str(i+1), 'access-state-'+str(i+1),
                    'text', metadata['access'][i]['state']),
          FormField('Country '+str(i+1), 'access-country-'+str(i+1),
                    'text', metadata['access'][i]['country']),
          FormField('Zip Code '+str(i+1), 'access-zipcode-'+str(i+1),
                    'text', metadata['access'][i]['zipcode']),
          FormField('Phone Number '+str(i+1), 'access-phone-'+str(i+1),
                    'text', metadata['access'][i]['phone']))

         for i in range(n_access)]

    panels = [Panel('Basic Information', 'basic-information', 'true',
                    form_fields=basic_fields),
              Panel('Data Information', 'data-information', 'false',
                    form_fields=data_fields),
              Panel('Citation Contact Info', 'citation-contact', 'false',
                    form_fields=citation_fields),
              Panel('Data Access Contact Info', 'access-contact', 'false',
                    form_fields=access_fields)]

    return panels
