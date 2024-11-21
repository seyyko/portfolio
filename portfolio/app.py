from flask import Blueprint, render_template
import sys, json, os

portfolio_app = Blueprint('portfolio_app', __name__, 
                          static_folder='../static/portfolio', 
                          template_folder='templates')

sys.stdout.reconfigure(encoding='utf-8')
file_path = os.path.join(os.path.dirname(__file__), 'projects.json')

with open(file_path, 'r', encoding='utf-8') as file:
    data = json.load(file)

@portfolio_app.route('/')
def index():
    return render_template('index.html', projects=data['projects'])

@portfolio_app.route('/aboutme')
def aboutme():
    return render_template('aboutme.html')