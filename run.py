from flask import Flask, request
from portfolio.app import portfolio_app
from QuranTraining.app import quran_app
import logging
from flask_babel import Babel, _

logging.basicConfig(level=logging.DEBUG)
app = Flask(__name__)

app.config['BABEL_DEFAULT_LOCALE'] = 'en'
app.config['BABEL_SUPPORTED_LOCALES'] = ['en', 'fr'] 
babel = Babel(app)

def get_locale():
    return request.accept_languages.best_match(['en', 'fr'])

babel.init_app(app, locale_selector=get_locale)


app.register_blueprint(portfolio_app, url_prefix='/')
app.register_blueprint(quran_app, url_prefix='/QuranTraining')

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=80, debug=False)
