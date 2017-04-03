"""
Configuration for Flask Application 'NKN Metadata Editor'
"""

import os
basedir = os.path.abspath(os.path.dirname(__file__))

PREPROD_DIRECTORY = (os.environ.get('MDEDIT_PREPROD_DIRECTORY') or
                         'local-preprod-directory')

class Config:
    PRODUCTION = False

    MONGODB_SETTINGS = {'db': 'mdedit'}

    PREPROD_DIRECTORY = (os.environ.get('MDEDIT_PREPROD_DIRECTORY') or
                         'local-preprod-directory')

    UPLOADS_DEFAULT_DEST = 'app/static/uploads'

    if not os.path.exists(PREPROD_DIRECTORY):
        os.makedirs(PREPROD_DIRECTORY)

    ATTACHMENT_DOWNLOAD_BASE_URL = 'http://example.com/downloads?uuid='

    #SIMPLE_UPLOAD_URL = "https://nknportal-dev.nkn.uidaho.edu/portal/simpleUpload/upload.php"
    SIMPLE_UPLOAD_URL = "http://localhost:4000/app/upload"
    
    @staticmethod
    def init_app(app):
        pass


class DevelopmentConfig(Config):
    DEBUG = True


class TestingConfig(Config):
    TESTING = True

    MONGODB_SETTINGS = {'db': 'mdedit_test'}
    PREPROD_DIRECTORY = '/tmp/mdedit_preprod_test'

    UPLOADS_DEFAULT_DEST = 'app/static/test-uploads'

    ATTACHMENT_DOWNLOAD_BASE_URL = \
        'http://example.com//data/download.php?uuid='

    SIMPLE_UPLOAD_URL = "http://localhost:4000/app/upload"

    if not os.path.exists(PREPROD_DIRECTORY):
        os.makedirs(PREPROD_DIRECTORY)


class ProductionConfig(Config):
    PRODUCTION = True

    ATTACHMENT_DOWNLOAD_BASE_URL = \
        'https://www.northwestknowledge.net/data/download.php?uuid='

    SIMPLE_UPLOAD_URL = "https://nknportal-prod.nkn.uidaho.edu/portal/simpleUpload/upload.php"
    
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
