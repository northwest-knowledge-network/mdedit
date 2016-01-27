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

        res = self.client.post(
            '/api/metadata', data='{"session_id": "local"}',
            content_type='application/json'
        )

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
                    "_id": "{}"
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

    def test_delete(self):
        """
        Delete existing record successfully
        """
        md_to_delete = Metadata.from_json(
            """
                {"title": "Another one",
                 "thematic_keywords": ["limnology", "batholith"],
                 "place_keywords": ["Idaho", "Pacific Northwest"],
                 "username": "local_user"}
            """
        )
        md_to_delete.save()

        md_id = str(md_to_delete.id)

        assert md_id is not None

        docList = Metadata.objects(__raw__={'_id': md_to_delete.id})

        assert len(docList) == 1

        self.client.post('/api/metadata/' + md_id + '/delete')

        docList = Metadata.objects(__raw__={'_id': md_to_delete.id})

        assert len(docList) == 0

    def test_publish_and_attach(self):
        """
        Publish should enable attaching files that have been uploaded as well as deleting existing attachments
        """
        data =\
            """
                {"title": "Another one",
                 "thematic_keywords": ["limnology", "batholith"],
                 "place_keywords": ["Idaho", "Pacific Northwest"],
                 "username": "local_user"}
            """
        md_to_publish = Metadata.from_json(data)

        md_to_publish.save()

        md_id = str(md_to_publish.id)

        assert md_id is not None

        docList = Metadata.objects(__raw__={'_id': md_to_publish.id})

        assert len(docList) == 1

        self.client.post('/api/metadata/' + md_id + '/publish', data=data)

        updated_md = Metadata.objects.get(pk=md_id)
        assert updated_md.md_pub_date is not None

        fake_data_url = 'http://example.com/x5534ffaf/fakeFile.txt'

        self.client.post(
            '/api/metadata/' + md_id + '/attachments',
            data=json.dumps(dict(attachment=fake_data_url)),
            content_type='application/json'
        )

        updated_md = Metadata.objects.get(pk=md_id)
        # assert updated_md.attachments == [fake_data_url]
        assert updated_md.attachments[0] == fake_data_url

        self.client.delete('/api/metadata/' + md_id + '/attachments',
                           data=json.dumps(dict(attachment=fake_data_url)),
                           content_type='application/json')

        updated_md = Metadata.objects.get(pk=md_id)
        assert len(updated_md.attachments) == 0
