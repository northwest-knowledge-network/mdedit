mdedit: Optimize the whole metadata workflow
================================================= 

This is a project to build a user-friendly metadata editor for use primarily by
scientists and data managers who create and share geospatial data. That is
because the editor is based on the ISO 19115 standard for metadata and is built
to emit, among other formats, ISO 19139 XML metadata (the XML implementation of
19115). Metadata submission and creation is a sticky subject which has purists
on one side saying "every field is important as the next, a partial record makes
no sense" and some on the other side of the spectrum who, even though they are
technically required to as a condition of grant funding, do not publish their
data publically with the metadata required for the public to find it. We are
aiming to be user- and developer-friendly while still delivering compliant
metadata in a variety of standards.



Run it Locally
--------------

The first step of course is to clone this repository:

.. code-block:: bash

    git clone https://github.com/northwest-knowledge-network/mdFullstack.git

Then you need to `install and start MongoDB 
<http://docs.mongodb.org/manual/installation/>`_. 
You also need `pip <https://pip.pypa.io/en/stable/installing.html>`_.

Next, create a new virualenv and install dependencies:

.. code-block:: bash
    
    $ pip install virtualenv
    $ virtualenv -p /usr/bin/python2.7 venv
    $ source venv/bin/activate
    $ pip install -r requirements.txt
     
This will initiate and activate a virtual environment and then install all
required dependencies stored in the file ``requirements.txt``. 

Finally, run ``startup.py``

.. code-block:: bash

    ./startup.py 

If all is well, you can go to http://localhost:8000 and see the colorful front end of the
metadata editor: 

.. image:: editor_thumbnail.png


There is no explicit connection between the front end and the
back end server. To see the back end emit metadata, try these routes:

- http://localhost:4000/api/metadata: list of all Mongo records
- http://localhost:4000/api/metadata/form: construct used to build front end web
  form
- ``http://localhost:4000/api/metadata/{_oid}/xml``: Emit a generic XML record to be
  used by developers as a base for running XSLTs. Get ``_oid`` by inspecting
  a record from http://localhost:4000/api/metadata

You can view an XML record for some metadata easily by clicking the ``XML`` link
above the currently ugly list items. Or, to do it manually, find the ``_oid`` of
interest by inspecting the list of JSON metadata at
http://localhost:4000/api/metadata, find a metadata record of interest, copy the
``_oid`` and insert it into the URL like so, and put the URL in your browser:
``http://localhost:4000/api/metadata/{_oid}/xml``.  The braces and any other
quotes should be dropped.


More info
---------

The back end is written in `Flask <http://flask.pocoo.org/>`_. The front end is
written in JQuery/javascript with `Handlebars templating <http://handlebarsjs.com/>`_. 
These two are totally separate, which is why they are hosted on two separate
servers. At NKN, we need this because we want to deploy our front end app to
many of our clients' content management systems with a single metadata server
handling requests from all of them.


TODO
----

This tool is getting shared in a state of transition as we move from a
relational database backend to MongoDB. Some things are rather broken if they
aren't altogether missing, including

- Basic authorization (set up basic auth routes and new account creation page)
- Other user functionality, like user view to edit, browse, socialize in a
  user-specific way
- Metadata API documentation
- Form submission
- Individual record editing
- Starting the web interface with all but one panel closed
- Create new/Edit existing record

This tool will explore the use of developer tools devleoped by the 
`Alaska Data Integration Working Group <http://www.adiwg.org>`_, especially:

- `mdTranslator <https://github.com/adiwg/mdTranslator>`_, what we can use for
  translating JSON metadata from web form to some different XML formats
- `mdTools <https://github.com/adiwg/mdTools>`_ has a schema viewer which could
  be used for creating editing forms that can handle arbitrary existing metadata
- `mdCodes <https://github.com/adiwg/mdCodes>`_, "CodeLists for ADIwg mdJSON"
