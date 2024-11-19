from flask import render_template, request, redirect, url_for, jsonify, Blueprint
import json, sys

quran_app = Blueprint('quran_app', __name__, 
                      static_folder='../static/QuranTraining', 
                      template_folder='templates')

surahs = []

sys.stdout.reconfigure(encoding='utf-8')
file_path = 'QuranTraining/quran.json'

with open(file_path, 'r', encoding='utf-8') as file:
    data = json.load(file)
for surah in data["sourates"]:
    surahs.append(surah["nom_phonetique"])


@quran_app.route('/', methods=["GET", "POST"])
def home():
    if request.method == "POST":
        selected_surahs = request.form.getlist("surah")
        print("Selected Surahs:", selected_surahs)
        return redirect(url_for("home"))
    
    return render_template('home.html', title='Home', surahs=surahs)

@quran_app.route('/submit-surahs', methods=['POST'])
def submit_surahs():
    data = request.get_json()
    selected_surahs = data.get('selected_surahs', [])
    print("Selected Surahs via AJAX:", selected_surahs)
    
    return jsonify({'message': 'Data received successfully', 'selected_surahs': selected_surahs}), 200



@quran_app.route('/about')
def about():
    return render_template('about.html', title='About')