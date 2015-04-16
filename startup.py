#!venv/bin/python
import time
from subprocess import Popen

from app import create_app
from flask_mongoengine import MongoEngine
from app.models import Metadata

app = create_app('default')

db = MongoEngine()
db.init_app(app)

# get possibly new collection 'metadata' in the 'metadata' database
md_objs = Metadata.objects

if not md_objs.count():

    md = Metadata.from_json(open('default_metadata.json', 'r').read())
    md.save()
    id = md.pk

else:

    id = md_objs.first().pk

print "\n*** starting metadata server at localhost:4000 ***\n"
md_p = Popen("python manage.py runserver --port=4000",  # > /dev/null 2>&1",
             shell=True)

print "\n*** starting front end server at localhost:8000 ***\n"
md_p = Popen("cd frontend && python -m SimpleHTTPServer",  # > /dev/null 2>&1",
             shell=True)

print "\n\n\nBoth servers have successfully started. Visit http://localhost:8000"
print "to see the front end and to see some sample xml of default_form.json "
print "that the server emits, visit http://localhost:4000/api/metadata/" +\
    str(id) + "/xml.  Remove '/xml' to see the original json.\n\n\n"

while True:
    time.sleep(10)
