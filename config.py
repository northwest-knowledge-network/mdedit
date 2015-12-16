"""
Configuration for Flask Application 'NKN Metadata Editor'
"""

import os
basedir = os.path.abspath(os.path.dirname(__file__))


class Config:

    MONGODB_SETTINGS = {'db': 'mdedit'}

    PREPROD_DIRECTORY = (os.environ.get('MDEDIT_PREPROD_DIRECTORY') or
                         'local-preprod-directory')

    if not os.path.exists(PREPROD_DIRECTORY):
        os.makedirs(PREPROD_DIRECTORY)

    @staticmethod
    def init_app(app):
        pass


class DevelopmentConfig(Config):
    DEBUG = True


class TestingConfig(Config):
    TESTING = True

    MONGODB_SETTINGS = {'db': 'mdedit_test'}


class ProductionConfig(Config):
    pass


config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
