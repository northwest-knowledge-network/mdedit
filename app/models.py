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
    date = db.Column(db.DateTime, index=True, default=datetime.utcnow)

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
    def to_json(self):
        """Iterate over non-id, non-function, non-property attributes and pack
           them in to a dict for use in API
        """
        # print "\n\n***** TO JSON *****\n\n"
        # print self.id

        return {
                'id': self.id,
                'title': self.title,
                # TODO T_FMT = '%Y-%m-%d'
                # 'date': self.date.strftime('%Y-%m-%d'),
                # 'date': self.date,
                'rname': self.rname,
                'rinst': self.rinst
               }


