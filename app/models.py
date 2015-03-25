from flask import jsonify
from datetime import datetime

from . import db



class Metadata(db.Model):
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
        d = j.to_dict()

        # need to make date a datetime object; all others OK
        d['date'] = datetime.strptime(j['date'], '%Y-%m-%d')

        return Metadata(**d)


def _md_to_json(record):
    """Convert Metadata record to JSON according to desired rules.
    """
    return jsonify(dict(id=record.id, date=record.date.strftime('%Y-%m-%d'),
                        rname=record.rname, rinst=record.rinst,
                        title=record.title))
