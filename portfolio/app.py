from flask import Blueprint, render_template

portfolio_app = Blueprint('portfolio_app', __name__, 
                          static_folder='../static/portfolio', 
                          template_folder='templates')

@portfolio_app.route('/')
def index():
    return render_template('index.html')

@portfolio_app.route('/aboutme')
def aboutme():
    return render_template('aboutme.html')