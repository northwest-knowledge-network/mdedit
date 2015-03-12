"""API"""
from datetime import date
from flask import jsonify

from . import api


@api.route('/')
def api():

    todaystr = date.today().isoformat()

    # use jsonify to create a json from an implicit dictionary
    j = jsonify(version="0.1", date=todaystr)

    # return type is application/json
    return j

    # this will return 'JSON' but the type will not be application/json,
    # it will be text/html
    #return '{"version": "0.1", "date"="' + todaystr + '"}'


@api.route('/metadata/submit')
