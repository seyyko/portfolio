from flask import render_template, request, redirect, url_for, jsonify, Blueprint
import json, sys, os


sys.stdout.reconfigure(encoding='utf-8')
quran_app = Blueprint('quran_app', __name__, 
                      static_folder='../static/QuranTraining', 
                      template_folder='templates')
file_path = os.path.join(os.path.dirname(__file__), 'quran.json')


surahs = []
reciters = {
    'abdulbasitmurattal': 'Abdul Basit Murattal',
    'abdullahbasfar': 'Abdullah Basfar',
    'abdulsamad': 'Abdul Samad',
    'shaatree': 'Shaatree',
    'ahmedajamy': 'Ahmed Ajamy',
    'alafasy': 'Mishary Alafasy',
    'hanirifai': 'Hani Rifai',
    'husary': 'Husary',
    'husarymujawwad': 'Husary Mujawwad',
    'hudhaify': 'Hudhaify',
    'ibrahimakhbar': 'Ibrahim Akdar',
    'mahermuaiqly': 'Maher Al Muaiqly',
    'minshawi': 'Minshawi',
    'minshawimujawwad': 'Minshawi Mujawwad',
    'muhammadayyoub': 'Muhammad Ayyoub',
    'muhammadjibreel': 'Muhammad Jibreel',
    'saoodshuraym': 'Saood Shuraym',
}

with open(file_path, 'r', encoding='utf-8') as file:
    quran = json.load(file)
for surah in quran["sourates"]:
    surahs.append(surah["nom_phonetique"])


@quran_app.route('/', methods=["GET", "POST"])
def home():
    return render_template('home.html', surahs=surahs, reciters=reciters, lang=request.accept_languages.best_match(['en', 'fr']))

@quran_app.route('/submit-surahs', methods=['POST'])
def submit_surahs():
    data = request.get_json()
    selected_surahs = data.get('selected_surahs', [])
    for i, surah in enumerate(quran["sourates"]):
        for j, surah_name in enumerate(selected_surahs):
            if surah["nom_phonetique"] == surah_name:
                selected_surahs[j] = quran["sourates"][i]
    
    return jsonify({'message': 'Data received and saved successfully', 'selected_surahs': selected_surahs}), 200