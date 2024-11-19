from flask import Flask
from portfolio.app import portfolio_app
from QuranTraining.app import quran_app

app = Flask(__name__)

app.register_blueprint(portfolio_app, url_prefix='/')
app.register_blueprint(quran_app, url_prefix='/QuranTraining')

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=80, debug=False)