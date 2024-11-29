from flask import render_template, request, redirect, url_for, jsonify, Blueprint
import json, sys, os


quran_app = Blueprint('quran_app', __name__, 
                      static_folder='../static/QuranTraining', 
                      template_folder='templates')

surahs = []

sys.stdout.reconfigure(encoding='utf-8')
file_path = os.path.join(os.path.dirname(__file__), 'quran.json')

with open(file_path, 'r', encoding='utf-8') as file:
    quran = json.load(file)
for surah in quran["sourates"]:
    surahs.append(surah["nom_phonetique"])


@quran_app.route('/', methods=["GET", "POST"])
def home():
    return render_template('home.html', surahs=surahs)

@quran_app.route('/submit-surahs', methods=['POST'])
def submit_surahs():
    data = request.get_json()
    selected_surahs = data.get('selected_surahs', [])
    for i, surah in enumerate(quran["sourates"]):
        for j, surah_name in enumerate(selected_surahs):
            if surah["nom_phonetique"] == surah_name:
                selected_surahs[j] = quran["sourates"][i]
    
    return jsonify({'message': 'Data received and saved successfully', 'selected_surahs': selected_surahs}), 200