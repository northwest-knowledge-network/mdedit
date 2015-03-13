from . import db

from flask import jsonify


# TODO
#: metadata form dictionary with aux info for building client-side form
MD_FORM_DICT = dict(
    title=dict(label='Title', tag='input', type='text', order=1, value=''),
    date=dict(label='Date', tag='input', type='date', order=2, value='')
    # researcher_name=dict(
    )


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
    def to_dict(self, id=None):
        """Iterate over non-id, non-function, non-property attributes and pack
           them in to a dict for use in API
        """
        # TODO use id to populate form for editing existing record

        # each part has the form field name, field type, choices if they exist

        # no need to convert to json; will be handled by flask-restful
        return jsonify(MD_FORM_DICT)
