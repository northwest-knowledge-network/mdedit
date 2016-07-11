quickstart
==========



Install
-------

This requires MongoDB, `pip, the PyPA recommended tool <https://pypi.python.org/pypi/pip>`_ 
for Python package management, and the 
`Node Package Manager (npm) <https://docs.npmjs.com/getting-started/installing-node>`_ and
`bower <https://bower.io/>`_ for managing javascript and CSS dependencies.

Please get in touch if you've tried and have hit a snag installing any of
these dependencies. Some notes are at the bottom of the page for 
installing dependencies.

First, we need to get the mdedit repository and change to the newly cloned
directory.

.. code-block:: sh

    git clone https://github.com/northwest-knowledge-network/mdedit &&\
    cd mdedit 

Next we need to install python and javascript/css dependencies. For Python,
virtual environments really are worth using, so we'll use them. 

.. code-block:: sh

    pip install virtualenv && \
    virtualenv -p /usr/bin/python2.7 venv && \  # create new py2.7 venv
    source venv/bin/activate && \  # activate new environment
    pip install -r requirements.txt  # install listed requirements

Now every time you want to run the Flask server in your environment, you will
have to type ``source venv/bin/activate``. This might sound a bit tedious, 
so you might want to add something like ``alias va='source venv/bin/activate``
to your ``~/.bashrc``.

Now on to Javascript/CSS dependencies, installed with

.. code-block:: sh

    npm install && bower install

If all that has succeeded, proceed to start the servers to work with a 
version of ``mdedit`` that runs and can be accessed from your personal computer.


Start up servers
----------------

To start the servers, we use a script that is included in the repository called
``startup.py``


.. code-block:: sh

    python startup.py run

Once you've done that, you can navigate to (click the link or type in browser) 
`localhost:8000 <http://localhost:8000>`_ and see the medata editor running on
your computer.


Run Tests
---------

There are three types of tests for the mdedit project: tests of the 
metadata Flask service backend, tests that certain internals to the front end
Angular app are behaving as expected ("spec" tests), and finally "end-to-end"
tests that interacts with ``mdedit`` through the browser as a robotic 
user to make sure the website behaves as expected, for instance, actually
saving and updating the page when a user saves a new record.

To run the backend tests for Python code,

.. code-block:: sh

    python startup.py pyTest


To run the angular specs

.. code-block:: sh

    python startup.py ngSpec
