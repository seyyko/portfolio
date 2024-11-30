from flask import Flask, request, Response
from flask_babel import Babel, _
from flask_sitemap import Sitemap

from portfolio.app import portfolio_app
from QuranTraining.app import quran_app

import logging


logging.basicConfig(level=logging.DEBUG)
app = Flask(__name__)

app.config['BABEL_DEFAULT_LOCALE'] = 'en'
app.config['BABEL_SUPPORTED_LOCALES'] = ['en', 'fr'] 
babel = Babel(app)

app.config['SITEMAP_INCLUDE_RULES_WITHOUT_PARAMS'] = True
sitemap_ext = Sitemap(app)

app.register_blueprint(portfolio_app, url_prefix='/')
app.register_blueprint(quran_app, url_prefix='/QuranTraining')

def get_locale():
    return request.accept_languages.best_match(['en', 'fr'])

@app.route('/sitemap.xml', methods=['GET'])
def generate_sitemap():
    sitemap_xml = sitemap_ext.generate()
    response = Response(sitemap_xml, content_type='application/xml')
    return response

babel.init_app(app, locale_selector=get_locale)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=80, debug=False)
