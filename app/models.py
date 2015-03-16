from flask import jsonify
from datetime import datetime

from . import db



class Metadata(db.Model):  # Address, SpatialExtent, TemporalExtent, Address):
    """
    Metadata Model
    """

    id = db.Column(db.Integer, primary_key=True)

    ### Basic ###
    title = db.Column(db.String(200), index=True)
    date = db.Column(db.DateTime, index=True)

    ### Researcher ###
    rname = db.Column(db.String(100), index=True)
    rinst = db.Column(db.String(100), index=True)

    ### Spatial Extent ###

    ### Temporal Extent ###

    ### Address 2 ###

    ### Resource Info ###
    @classmethod
    def from_json(self, j):
        """create a new Metadata record from a properly-formed dictionary
        """
        # need to make date a datetime object; all others OK
        d = j.to_dict()

        d['date'] = datetime.strptime(j['date'], '%Y-%m-%d')

        return Metadata(**d)

    @classmethod
    def to_json(self, id=None):
        """Iterate over non-id, non-function, non-property attributes and pack
           them in to a dict for use in API
        """
        # TODO use id to populate form for editing existing record

        # each part has the form field name, field type, choices if they exist

        # no need to convert to json; will be handled by flask-restful
        return jsonify(dict(form=MD_FORM))


# TODO
#: metadata form dictionary with aux info for building client-side form
MD_FORM = [
    dict(blockTitle="Basic Information", blockLabel="basic-information",
         expanded="true",
         formElements=[

             dict(label='Title', type='text', order=1,
                  value='Title of my data', name='title',
                  longDescription="E.g., Data for June 2014 Journal of Hydrology Paper"),
             dict(label='Date', type='date', order=1, name='date',
                  value='2015-01-01',  # TODO strfmt now()
                  longDescription='Date data was last updated')]
         ),

        dict(blockTitle="Researcher Information", blockLabel="researcher-information",
         expanded="true",
         formElements=[

             dict(label='Researcher Name', type='text', order=1, name='rname',
                  value='Professor Herod Jones',
                  longDescription='Principal Investigator (may be one of many)'),

             dict(label='Researcher Institute', type='text', order=1,
                  name='rinst',
                  value='University of Idaho',  # TODO strfmt now()
                  longDescription='Home institute during data acquisition')]
         )]
