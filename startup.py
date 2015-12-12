#!venv/bin/python
import argparse
import atexit
import getopt
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


def _kill_servers():

    Popen('kill -9 `lsof -ti :8000`', shell=True, stderr=None)

    Popen('kill -9 `lsof -ti :4000`', shell=True, stderr=None)


def start_servers(test):
    """
    Start the backend and client side servers. If test is True, set up
    the backend for end-to-end testing.

    Arguments:
        test (bool) whether or not to use test database by setting FLASKCONFIG
         environment variable.
    Returns:
        None
    """

    print test

    if test:
        print "setting testing..."
        print test
        os.environ['FLASKCONFIG'] = 'testing'


    print "\n*** starting metadata server at localhost:4000 ***\n"
    server_process = Popen("python manage.py runserver --port=4000",
                           shell=True, stdout=None, stderr=None,
                           preexec_fn=os.setsid)

    print "\n*** starting front end server at localhost:8000 ***\n"
    # client_process = Popen("python -m SimpleHTTPServer",
                           # shell=True, stdout=PIPE,
                           # preexec_fn=os.setsid)
    Popen("python -m SimpleHTTPServer",
          shell=True, stdout=None, stderr=None, preexec_fn=os.setsid)

    print "\n----------------------------------------------------------------------"
    print "Both servers have successfully started. Visit http://localhost:8000/frontend"
    print "to see the front end and to see some sample xml of default_form.json "
    print "that the server emits, visit http://localhost:4000/api/metadata/" +\
        str(id) + "/xml.  Remove '/xml' to see the original json."
    print "----------------------------------------------------------------------"


if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    run_choices = ['e2e', 'ngSpec', 'pyTest', 'testAll', 'run']

    parser.add_argument('type', choices=run_choices,
        help='One of "e2e", "ngSpec", "pyTest", or "run"')

    args = parser.parse_args()

    # if the servers were already running (could be zombie) kill them
    _kill_servers()

    test = False

    runType = args.type

    if runType in ['testAll', 'e2e']:

        start_servers(test=True)

        proTest = Popen('npm run protractor', shell=True)

        proTest.communicate()[0]

        if runType == 'testAll':

            nt = Popen('npm test', shell=True)

            nt.communicate()


    if runType in ['run']:

        start_servers(test=False)


    if args.type in ['ngSpec']:

        nt = Popen('npm test', shell=True)

        nt.communicate()


    if args.type in ['testPy']:

        nt = Popen('nosetests -v', shell=True)

        nt.communicate()
