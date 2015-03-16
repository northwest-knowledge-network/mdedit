from . import db

from flask import jsonify


# TODO
#: metadata form dictionary with aux info for building client-side form
MD_FORM = [
    dict(blockTitle="Basic Information", blockLabel="basic-information",
         expanded="true",
         formElements=[
             dict(label='Title', type='text', order=1,
                  value='Title of my data',
                  longDescription="E.g., Data for June 2014 Journal of Hydrology Paper"),
             dict(label='Date', type='date', order=1,
                  value='2015-01-01',  # TODO strfmt now()
                  longDescription='Date data was last updated')]
         ),
        dict(blockTitle="Researcher Information", blockLabel="researcher-information",
         expanded="true",
         formElements=[
             dict(label='Researcher Name', type='text', order=1,
                  value='Professor Herod Jones',
                  longDescription='Principal Investigator (may be one of many)'),
             dict(label='Researcher Institute', type='text', order=1,
                  value='University of Idaho',  # TODO strfmt now()
                  longDescription='Home institute during data acquisition')]
         )]


class Metadata(db.Model):  # Address, SpatialExtent, TemporalExtent, Address):
    """
    Metadata Model
    """

    id = db.Column(db.Integer, primary_key=True)

    ### Basic ###
    title = db.Column(db.String(200), index=True)
    date = db.Column(db.DateTime, index=True)

    ### Address ###

    ### Spatial Extent ###

    ### Temporal Extent ###

    ### Address 2 ###

    ### Resource Info ###

    @classmethod
    def to_json(self, id=None):
        """Iterate over non-id, non-function, non-property attributes and pack
           them in to a dict for use in API
        """
        # TODO use id to populate form for editing existing record

        # each part has the form field name, field type, choices if they exist

        # no need to convert to json; will be handled by flask-restful
        return jsonify(dict(form=MD_FORM))