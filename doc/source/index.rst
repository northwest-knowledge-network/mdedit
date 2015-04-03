.. mdedit documentation master file, created by
   sphinx-quickstart on Fri Mar 27 13:02:33 2015.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.
mdedit
======

A data-driven metadata editor with fully separate Flask API backend and 
Javascript front end.

Front end
---------

No matter what back end (meta)data server we use, the front end was designed to
be mostly independent from it. All that needs to change is the URL where the
front end pulls data from, as long as the backend fulfills the contract,
currently implicit in the views in the frontend, but should be enumerated
explicitly.

Back end
--------

The back end exposes a metadata API, powered by Flask. It's still rough and could
probably use some cleaning up, maybe using 
`flask-restful <https://flask-restful.readthedocs.org/en/0.3.2/>`_ or
`flask-restless <https://flask-restless.readthedocs.org/en/latest/>`_. 

Future work and larger purpose
------------------------------

I'm also really excited about `CouchDB <http://couchdb.apache.org/>`_ and am
thinking about just using CouchDB as the document server. After obsessively
pouring over the freely-available O'Reilly publication written by major CouchDB
contributors and inventors, `CouchDB: The Definitive Guide <http://guide.couchdb.org/>`_,
I couldn't stop thinking it is the ultimate database for distributing and
collecting scientific metadata. 

Yes, there are metadata standards, and at least
in geosciences this metadata is standardized around XML. But if we are to follow
the lead of some of the great scientific philosophers of our time like 
Gregory Bateson and his `Steps to an Ecology of Mind <http://www.edtechpost.ca/readings/Gregory%20Bateson%20-%20Ecology%20of%20Mind.pdf>`_ and Nobel Laureate Biologist E.O. Wilson's `Consilience <http://wtf.tw/ref/wilson.pdf>`_, mixed together with the HTTP and REST standards, ludidly and 
enthrallingly described in `Fielding's PhD dissertation <https://www.ics.uci.edu/~fielding/pubs/dissertation/fielding_dissertation.pdf>`_, 
we need to be thinking beyond geosciences and beyond standards for standards
sake. Fielding describes the development of the REST architecture as a
*derivation*. Like deriving a simpler, more inclusive set of equations from more
complex, specialized set of equations, Fielding *derived* REST. We can learn
from his approach. The method he used for deriving rest is the one where

.. pull-quote::

    a designer starts with the system needs as a whole, without constraints,
    and then incrementally identifies and applies constraints to elements of the
    system in order to differentiate the design space and allow the forces that
    influence that system behavior to flow naturally, in harmony with the
    system. (This) emphasizes restraint and understanding of the system context. 
    

So hopefully this is not just the data hipster in me that wants to use a hot 
new `key-value store <https://nolanwlawson.files.wordpress.com/2013/11/fault-tolerance.png>`_,
but actually the tool that fits the goal and the constraints, including 
fitting in with the rest of the web.

I like Couch because of its scalability and handling of versioning, replication,
and concurrency, and its API is HTTP! I found the following quote at `this nice
blog post "CouchDB doesn't want to be your database. It wants to be your web
rite." <http://nolanlawson.com/2013/11/15/couchdb-doesnt-want-to-be-your-database-it-wants-to-be-your-web-site/>`_. 
It sums up my feeling after I wrote a bunch of routes to GET/PUT/POST 
metadata records that the front end was going to display/edit/create. It comes
from one of the authors of *CouchDB: The Definitive Guide*, J. Chris Anderson

.. epigraph::

    Because CouchDB is a web server, you can serve applications directly [to] the 
    browser without any middle tier. When I’m feeling punchy, I like to call 
    the traditional application server stack “extra code to make CouchDB uglier and slower.

Being a good programmer I am lazy. So I'm comforted by the database that tells
me to `"Relax" <http://guide.couchdb.org/draft/why.html#relax>`_ and takes care
of the heavy lifting for me, allowing me to focus on user experience, which
ultimately results in a more complete, *consilient* library of scientific data,
with science being very large in scope.

