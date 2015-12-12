#!venv/bin/python
import atexit
import os
import signal
import sys
import time

from subprocess import Popen, PIPE

from app import create_app
from flask_mongoengine import MongoEngine
from app.models import Metadata

app = create_app('default')

db = MongoEngine()
db.init_app(app)




# @atexit.register
# def stop_servers():
    # # output = p2.communicate()[0]


    # # stop server processes
    # try:
        # os.killpg(int(os.getenv('server_pid')), signal.SIGTERM)
        # os.killpg(int(os.getenv('client_pid')), signal.SIGTERM)

    # except:
        # pass

    # print "yeeh"


def init_db():
    # get possibly new collection 'metadata' in the 'metadata' database
    md_objs = Metadata.objects

    if not md_objs.count():

        md = Metadata.from_json(open('default_metadata.json', 'r').read())
        md.save()
        id = md.pk
        md = Metadata.from_json(open('project_defaults/MILES_default_metadata.json','r').read())
        md.save()

    else:

        id = md_objs.first().pk

    return id


def start_servers(test=False):
    """
    Start the backend and client side servers. If test is True, set up
    the backend for end-to-end testing.

    Arguments:
        test (bool) whether or not to use test database by setting FLASKCONFIG
         environment variable.
    Returns:
        None
    """

    if test:
       os.environ['FLASKCONFIG'] = 'testing'


    print "\n*** starting metadata server at localhost:4000 ***\n"
    server_process = Popen("python manage.py runserver --port=4000",
                           shell=True, # stdout=PIPE,
                           preexec_fn=os.setsid)

    # print "\n SERVER COMMUNICATE \n"
    # server_process.communicate()

    print "\n SERVER PROCESS ID: \n"
    print server_process.returncode


    if server_process.returncode:

        print "\nError in starting server.\n"
        sys.exit()



    print "\n*** starting front end server at localhost:8000 ***\n"
    client_process = Popen("python -m SimpleHTTPServer",
                           shell=True, stdout=PIPE,
                           preexec_fn=os.setsid)

    client_process.communicate()



    if client_process.returncode:

        client_process.kill()

        print "\nError in starting server.\n"
        sys.exit()


    print "\n----------------------------------------------------------------------"
    print "Both servers have successfully started. Visit http://localhost:8000/frontend"
    print "to see the front end and to see some sample xml of default_form.json "
    print "that the server emits, visit http://localhost:4000/api/metadata/" +\
        str(id) + "/xml.  Remove '/xml' to see the original json."
    print "----------------------------------------------------------------------"

    # export process ids as environment variables for @atexit
    os.environ['server_pid'] = str(server_process.pid)
    os.environ['client_pid'] = str(client_process.pid)

    while True:

        time.sleep(1)


if __name__ == '__main__':

    # p4000 = Popen(['lsof', '-a', '-p4000', '-i4'])
    # p8000 = Popen(['lsof', '-a', '-p8000', '-i4'])

    Popen('kill -9 `lsof -ti :8000`', shell=True, stderr=None)

    Popen('kill -9 `lsof -ti :4000`', shell=True, stderr=None)

    print "\n\n YO ***** \n\n"

    # print p4000.communicate()[0]

    start_servers(test=True)
