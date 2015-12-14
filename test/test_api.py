"""
Unit tests for server functions contained in app/api/views.py

Author: Matthew A. Turner
Date: 2015-12-12
"""
import json
import unittest
import os

from ..manage import app
from ..app.models import Metadata


class TestAPI(unittest.TestCase):
    """

    """
    def setUp(self):

        import ipdb; ipdb.set_trace()
        os.environ['FLASKCONFIG'] = 'testing'
        app.config['MONGODB_SETTINGS'] = {'db': 'mdedit_test'}
        TESTING = True
        app.config['TESTING'] = True
        app.config['DEBUG'] = False
        self.client = app.test_client()



        try:
            Metadata.drop_collection()
        except:
            pass

        # insert test data
        md1 = Metadata.from_json("""
                {"title": "Dabke on the Moon",
                 "summary": "Some good music",
                 "username": "local_user"}
            """)
        md1.save()
        import ipdb; ipdb.set_trace()
        self.md1_id = md1.id

        md2 = Metadata.from_json("""
                {"title": "Another one",
                 "thematic_keywords": ["limnology", "batholith"],
                 "place_keywords": ["Idaho", "Pacific Northwest"],
                 "username": "local_user"}
            """)
        md2.save()

        # # md2.id is type ObjectId
        self.md2_id = md2.id

        # assert False

    def tearDown(self):

        Metadata.drop_collection()

    def test_metadata(self):

        res = self.client.post('/api/metadata')

        res_json = json.loads(res.data)

        record_list = res_json['results']

        assert len(record_list) == 2

    def test_update_record(self):
        # see werkzeug.test.EnvironBuilder
        self.client.put(
            '/api/metadata/' + str(self.md1_id), data="""
            {
                "record": {
                    "title": "Dabke on the Moon",
                    "summary": "Some good music",
                    "place_keywords": ["California", "Delta"]
                }
            }
            """,
            content_type='application/json',
            headers={'Content-Type': '*', 'Origin': '*'}
        )

        print "self.md1_id"
        print self.md1_id
        md1 = Metadata.objects.get(pk=str(self.md1_id))

        print "md"
        print md1.place_keywords

        assert md1.place_keywords == ['California', 'Delta']

    # def test_retrieve_record(self):
    #     assert False

    # def test_get_user_contacts(self):
    #     assert False

    # def test_geocode(self):
    #     assert False

    # def test_publish_record(self):
    #     assert False

    # def test_generic_xml(self):
    #     assert False

    # def test_generate_iso(self):
    #     assert False

    # def test_generate_dublin_core(self):
    #     assert False

    # def test_generate_esri(self):
    #     assert False
