<<<<<<< HEAD
from flask import Flask, request
from portfolio.app import portfolio_app
from QuranTraining.app import quran_app
import logging
from flask_babel import Babel, _
=======
from flask import Flask
from portfolio.app import portfolio_app
from QuranTraining.app import quran_app
import logging
>>>>>>> 789f2bc3c997aa3cc67363ab08a3d6aa11b2f02d

logging.basicConfig(level=logging.DEBUG)
app = Flask(__name__)

<<<<<<< HEAD
app.config['BABEL_DEFAULT_LOCALE'] = 'en'
app.config['BABEL_SUPPORTED_LOCALES'] = ['en', 'fr'] 
babel = Babel(app)

def get_locale():
    return request.accept_languages.best_match(['en', 'fr'])

babel.init_app(app, locale_selector=get_locale)


=======
>>>>>>> 789f2bc3c997aa3cc67363ab08a3d6aa11b2f02d
app.register_blueprint(portfolio_app, url_prefix='/')
app.register_blueprint(quran_app, url_prefix='/QuranTraining')

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=80, debug=False)
