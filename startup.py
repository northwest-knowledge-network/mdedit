import argparse
import os
import shutil
import time

from subprocess import Popen


def _kill_servers():

    Popen('kill -9 `lsof -ti :8000` > /dev/null', shell=True, stderr=None)

    Popen('kill -9 `lsof -ti :4000` > /dev/null', shell=True, stderr=None)


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
        # remove any pre-existing data in the test "preprod" directory
        test_preprod_dir = 'mdedit_preprod_test'

        if os.path.exists(test_preprod_dir):
            shutil.rmtree('mdedit_preprod_test')

    print "\n*** starting metadata server at localhost:4000 ***\n"

    Popen("python manage.py runserver --port=4000 --threaded",
          shell=True, stdout=None, stderr=None,
          preexec_fn=os.setsid)

    print "\n*** starting front end server at localhost:8000 ***\n"

    Popen("python -m SimpleHTTPServer",
          shell=True, stdout=None, stderr=None, preexec_fn=os.setsid)

    if not test:

        print "\n--------------------------------------------------------------------------"
        print "Both servers have successfully started. Visit http://localhost:8000/frontend"
        print "to see the front end and to see some sample xml of default_form.json "
        print "that the server emits, visit http://localhost:4000/api/metadata/" +\
            str(id) + "/xml.  Remove '/xml' to see the original json."
        print "----------------------------------------------------------"

        while True:
            time.sleep(1)


if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    run_choices = ['e2e', 'ngSpec', 'pyTest', 'testAll', 'run']

    parser.add_argument(
        'type',
        choices=run_choices,
        help='You can run end-to-end tests (e2e), Angular Jasmine tests of ' +
        'the controllers and services (ngSpec), Python server tests ' +
        '(pyTest), or testAll will run all those tests. Can also run demo ' +
        'servers with a persistent local database using the run command.'
    )

    args = parser.parse_args()

    # if the servers were already running (could be zombie) kill them
    _kill_servers()

    runType = args.type

    if runType in ['testAll', 'e2e']:

        if runType == 'testAll':
            nt = Popen('nosetests -v', shell=True)

            nt.communicate()

        start_servers(test=True)

        pro_test = Popen('npm run protractor', shell=True)

        pro_test.communicate()[0]

        if runType == 'testAll':

            nt = Popen('npm test', shell=True)

            nt.communicate()

    if runType in ['run']:

        start_servers(test=False)

    if args.type in ['ngSpec']:

        nt = Popen('npm test', shell=True)

        nt.communicate()

    if args.type in ['pyTest']:

        os.environ['FLASKCONFIG'] = 'testing'

        nt = Popen('nosetests -v', shell=True)

        nt.communicate()
