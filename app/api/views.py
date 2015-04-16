"""API"""
from copy import copy
from datetime import datetime

from flask import request, jsonify, Response, render_template
# from flask_restful import Resource, reqparse
from flask_cors import cross_origin

from dicttoxml import dicttoxml

from mongoengine import ObjectIdField

import json

from . import api
from .. import db
from ..models import Metadata, _md_to_json


@api.route('/api/metadata', methods=['GET', 'POST', 'PUT'])
@cross_origin(origin='*', methods=['GET', 'POST', 'PUT'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def metadata():
    """Handle get and push requests coming to metadata server"""

    if request.method == 'GET':

        recs = Metadata.objects()
        return jsonify(dict(results=recs))


    # create a new metadata record
    if request.method == 'POST':
        # if no id, it is a new post
        print request.form
        print "STRINGIFIED ******** \n"
        print str(request.form)
        newmd = Metadata.from_json(json.dumps(request.form.__repr__))
        print newmd.__dict__
        cpy = newmd.to_json

        newmd.save()
        # db.session.add(newmd)
        # db.session.commit()

        # cpy = {k: v for k, v in cpy.__dict__.iteritems()
               # if k != '_sa_instance_state'}

        print cpy
        cpy['date'] = datetime.strftime(cpy['date'], '%Y-%m-%d')

        id = db.session.query(db.func.max(Metadata.id)).scalar()

        # return a JSON record of new metadata to load into the page
        return jsonify(id=id, form=_make_mdform(cpy))

    # PUT request: edit of existing record
    if request.method == 'PUT':

        data = request.form

        # if there's no id for a PUT it'd be strange, but not impossible
        if data['id'] == '/':
            return render_template('<h1>422: Bad Data</h1><p>Incorrect data '
                                   'for request</p>'), 422

        else:

            return jsonify(data)


@api.route('/api/metadata/<string:_oid>', methods=['GET', 'PUT'])
@cross_origin(origin='*', methods=['GET', 'PUT'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def get_single_metadata(_oid):
    """Get the JSON representation of the metadata record with given id.
    """

    record = request.form

    if request.method == 'PUT':

        md = Metadata.objects.get_or_404(pk=_oid)

        for k, v in record.iteritems():
            if k != 'id':
                if k == 'date':
                    v = datetime.strptime(v, '%Y-%m-%d')

                setattr(md, k, v)

        db.session.add(md)

        db.session.commit()

        md = Metadata.objects.get_or_404(pk=_oid)

        record_dict = {k: v for k, v in md.__dict__.iteritems()
                       if k != '_sa_instance_state'}

        record_dict['date'] = record_dict['date'].strftime('%Y-%m-%d')

        return jsonify(id=id, form=_make_mdform(record_dict, id=id))

    else:

        # record = Metadata.objects.get_or_404(_oid)
        record = Metadata.objects.find_one()
        print record

        return jsonify(record=record)


@api.route('/api/metadata/<string:_oid>/form')
@cross_origin(origin='*', methods=['GET'])
def get_form_metadata(_oid):
    """Get form data for a given id for display on frontend"""

    record = json.loads(Metadata.objects.get_or_404(pk=_oid).to_json)

    exclude_fields = ['_cls', '_id']
    form_dict = {k: v for k, v in record.iteritems()
                 if k not in exclude_fields}

    # date is wrong and form_dict is empty, probably because
    print form_dict
    form_dict['date'] = form_dict['date'].strftime('%Y-%m-%d')

    panels = _make_form_panels(form_dict)

    return jsonify(panels)

@api.route('/api/metadata/xml')
@cross_origin(origin='*', methods=['GET'])
def get_xml_metadata():
    recs = Metadata.objects()
    xml_str = dicttoxml(dict(recs=json.loads(recs.to_json())))
    return Response(xml_str, 200, mimetype='application/xml')

@api.route('/api/metadata/<string:_oid>/xml')
@cross_origin(origin='*', methods=['GET'])
def get_single_xml_metadata(_oid):
    """Get the common XML representation of the metadata record with
       given id.
    """
    record = Metadata.objects.get_or_404(pk=_oid)

    xml_str = dicttoxml(dict(record=json.loads(record.to_json())))

    return Response(xml_str,
                    200, mimetype='application/xml')


@api.route('/api/metadata/form')
@cross_origin(origin='*', methods=['GET', 'POST', 'PUT'],
              headers=['X-Requested-With', 'Content-Type', 'Origin'])
def get_form():
    record = Metadata.objects[0]
    panels = _make_form_panels(record)
    return jsonify(form=[p.to_json() for p in panels])


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
    metadata = json.loads(metadata.to_json())
    basic_fields = \
        [FormField('Title', 'title', 'text', metadata['title']),
         FormField('Date Published', 'first-published-date', 'date',
                   metadata['first_pub_date']['$date']),
         FormField('Date Last Modified', 'last-modified-date', 'date',
                   metadata['last_mod_date']['$date'])]

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
