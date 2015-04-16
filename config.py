"""
Configuration for Flask Application 'Virtual Watershed Platform'
"""

import os
basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    SECRET_KEY = os.environ.get('VW_SECRET_KEY') or 'hard to guess string'
    MONGODB_SETTINGS = {'DB': "metadata"}
    MAIL_SERVER = 'smtp.googlemail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get('VW_MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('VW_MAIL_PASSWORD')

    VWPLATFORM_MAIL_SUBJECT_PREFIX = '[VWPLATFORM]'
    VWPLATFORM_MAIL_SENDER = 'Matthew Turner <maturner@uidaho.edu>'
    VWPLATFORM_ADMIN = os.environ.get('VWPLATFORM_ADMIN') or 'Admin'

    print MONGODB_SETTINGS

    @staticmethod
    def init_app(app):
        pass


class DevelopmentConfig(Config):
    print "YO YO YO!!!8****:"
    DEBUG = True


class TestingConfig(Config):
    TESTING = True


class ProductionConfig(Config):
    pass


config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
