"""
Unit tests for server functions contained in app/api/views.py

Author: Matthew A. Turner
Date: 2015-12-12
"""
import json
import unittest

from ..manage import app
from ..app.models import Metadata


class TestAPI(unittest.TestCase):
    """

    """
    def setUp(self):

        self.client = app.test_client()

        try:
            Metadata.drop_collection()
        except:
            pass

        md1 = Metadata.from_json("""
                {"title": "Dabke on the Moon",
                 "summary": "Some good music",
                 "username": "local_user"}
            """)
        md1.save()

        self.md1_id = md1.id

        md2 = Metadata.from_json("""
                {"title": "Another one",
                 "thematic_keywords": ["limnology", "batholith"],
                 "place_keywords": ["Idaho", "Pacific Northwest"],
                 "username": "local_user"}
            """)
        md2.save()

        self.md2_id = md2.id

    def tearDown(self):

        Metadata.drop_collection()

    def test_metadata(self):

        res = self.client.post('/api/metadata')

        res_json = json.loads(res.data)

        record_list = res_json['results']

        assert len(record_list) == 2

    def test_savedraft_update(self):

        # see werkzeug.test.EnvironBuilder
        data = """
            {{
                "record": {{
                    "title": "Dabke on the Moon",
                    "summary": "Some good music",
                    "place_keywords": ["California", "Delta"],
                    "username": "local_user",
                    "id": "{}"
                }}
            }}
            """

        res = self.client.put(
            '/api/metadata/' + str(self.md1_id), data=data.format(self.md1_id),
            content_type='application/json',
            headers={'Content-Type': '*', 'Origin': '*'}
        )

        md1 = Metadata.objects.get(pk=str(self.md1_id))

        assert md1.place_keywords == ['California', 'Delta']

    def test_savedraft_update_noid_400(self):
        """
        Attempts to save updated draft w/o id will result in bad request error
        """

        data = """
            {
                "record": {
                    "title": "Dabke on the Moon",
                    "summary": "Some good music",
                    "place_keywords": ["California", "Delta"],
                    "username": "local_user"
                }
            }
            """

        res = self.client.put('/api/metadata/' + str(self.md1_id), data=data,
                              content_type='application/json',
                              headers={'Content-Type': '*', 'Origin': '*'})

        assert res.status_code == 400

        assert res.data == 'Bad or missing id'

    def test_retrieve_record(self):

        res = self.client.post(
            '/api/metadata/' + str(self.md1_id),
            data={'username': 'local_user'},
            content_type='application/json',
            headers={'Content-Type': '*', 'Origin': '*'}
        )

        data = json.loads(res.data)['record']

        assert data['title'] == 'Dabke on the Moon'
        assert data['summary'] == 'Some good music'

        res = self.client.post(
            '/api/metadata/' + str(self.md2_id),
            data={'username': 'local_user'},
            content_type='application/json',
            headers={'Content-Type': '*', 'Origin': '*'}
        )

        data = json.loads(res.data)['record']

        assert data['title'] == 'Another one'
        assert data['place_keywords'] == ['Idaho', 'Pacific Northwest']
        assert data['thematic_keywords'] == ['limnology', 'batholith']


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
