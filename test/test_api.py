"""
Unit tests for server functions contained in app/api/views.py

Author: Matthew A. Turner
Date: 2015-12-12
"""
import unittest

from ..manage import app


class TestAPI(unittest.TestCase):
    """

    """
    def setUp(self):

        app.config['TESTING'] = True
        self.client = app.test_client()

    def test_metadata(self):
        md = self.client.get('/')

        assert md == 'Yo'

    def test_update_record(self):
        assert False

    def test_retrieve_record(self):
        assert False

    def test_get_user_contacts(self):
        assert False

    def test_geocode(self):
        assert False

    def test_publish_record(self):
        assert False

    def test_generic_xml(self):
        assert False

    def test_generate_iso(self):
        assert False

    def test_generate_dublin_core(self):
        assert False

    def test_generate_esri(self):
        assert False