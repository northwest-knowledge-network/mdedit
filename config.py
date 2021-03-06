"""
Configuration for Flask Application 'NKN Metadata Editor'
"""

import os
basedir = os.path.abspath(os.path.dirname(__file__))

PREPROD_DIRECTORY = (os.environ.get('MDEDIT_PREPROD_DIRECTORY') or
                         'local-preprod-directory')
#MAIL_SERVER = ""
#MAIL_PORT = ""
#MAIL_USE_TLS = False
#MAIL_USE_SSL = True
#MAIL_USERNAME = (os.environ.get('MAIL_USERNAME') or 'test@example.com')
#MAIL_PASSWORD = (os.environ.get('MAIL_PASSWORD') or 'password')

class Config:
    PRODUCTION = False
    DEVELOPMENT_SERVER = False
    LOCAL_DEVELOPMENT = False

    MONGODB_SETTINGS = {'db': 'mdedit'}

    PREPROD_DIRECTORY = (os.environ.get('MDEDIT_PREPROD_DIRECTORY') or
                         'local-preprod-directory')

    PROD_DIRECTORY = (os.environ.get('MDEDIT_PROD_DIRECTORY') or
                         'local-prod-directory')

    UPLOADS_DEFAULT_DEST = 'app/static/uploads'

    if not os.path.exists(PREPROD_DIRECTORY):
        os.makedirs(PREPROD_DIRECTORY)

    if not os.path.exists(PROD_DIRECTORY):
	os.makedirs(PROD_DIRECTORY)

    ATTACHMENT_DOWNLOAD_BASE_URL = 'http://example.com/downloads?uuid='

    SIMPLE_UPLOAD_URL = "http://localhost:4000/app/upload"
    
    @staticmethod
    def init_app(app):
        pass


class DevelopmentServerConfig(Config):
    DEBUG = True
    DEVELOPMENT_SERVER = True

    PREPROD_DIRECTORY = "/datastore-pre/uploads"
    PROD_DIRECTORY = "/datastore-pre/published"

    UPLOADS_DEFAULT_DEST = PREPROD_DIRECTORY + "/"

class DevelopmentConfig(Config):
    DEBUG = True
    LOCAL_DEVELOPMENT = True

    PREPROD_DIRECTORY = "/local-datastore/uploads"
    PROD_DIRECTORY = "/local-datastore/published"

    UPLOADS_DEFAULT_DEST = PREPROD_DIRECTORY  + "/"

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

    #PREPROD_DIRECTORY = "/local-datastore/uploads"
    #PROD_DIRECTORY = "/local-prod-datastore/published"
 
class ProductionConfig(Config):
    PRODUCTION = True

    ATTACHMENT_DOWNLOAD_BASE_URL = \
        'https://www.northwestknowledge.net/data/download.php?uuid='

    SIMPLE_UPLOAD_URL = "https://nknportal-prod.nkn.uidaho.edu/portal/simpleUpload/upload.php"
    PREPROD_DIRECTORY = "/datastore-prod/uploads"
    PROD_DIRECTORY = "/datastore-prod/published"
    UPLOADS_DEFAULT_DEST = PREPROD_DIRECTORY  + "/"
    
config = {
    'development': DevelopmentConfig,
    'development-server': DevelopmentServerConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
