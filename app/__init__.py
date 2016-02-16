"""
VW Platform Application Package Constructor
"""
from flask import Flask
from flask_moment import Moment
from flask_mongoengine import MongoEngine
from flask_cors import CORS
from flask_uploads import UploadSet, ALL, configure_uploads

# if there is an exception, we are running tests
try:
    from config import config
except ImportError:
    from ..config import config


moment = Moment()
db = MongoEngine()
cors = CORS(resources={r'/app/metadata': {"origins": '*'}})

uploadedfiles = UploadSet('uploadedfiles', ALL)


def create_app(config_name):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    app.config['CORS_HEADERS'] = 'Content-Type'
    config[config_name].init_app(app)

    configure_uploads(app, uploadedfiles)

    moment.init_app(app)
    db.init_app(app)
    cors.init_app(app)

    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    from .api import api as api_blueprint
    app.register_blueprint(api_blueprint)

    return app
