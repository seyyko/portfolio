from flask import render_template, request, redirect, url_for, jsonify, Blueprint
import json, sys, os
import lz4.frame


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

# Fonction de compression avec LZ4 et optimisations
@quran_app.route('/compress', methods=['POST'])
def compress_data():
    data = request.json.get('data')
    
    if not data:
        return jsonify({"error": "Aucune donnée fournie"}), 400

    try:
        # Si les données ne sont pas déjà une chaîne, les sérialiser en JSON
        if not isinstance(data, str):
            data = json.dumps(data, separators=(',', ':'))  # Retirer les espaces inutiles

        compressed = lz4.frame.compress(data.encode('utf-8'), compression_level=4)
        compressed_base64 = compressed.hex()  # Utilisation du format Hex pour le stockage

        return jsonify({"result": compressed_base64})

    except Exception as e:
        return jsonify({"error": f"Erreur lors de la compression : {str(e)}"}), 500


# Route pour décompresser des données
@quran_app.route('/decompress', methods=['POST'])
def decompress_data():
    compressed_data = request.json.get('data')
    
    if not compressed_data:
        return jsonify({"error": "Aucune donnée fournie"}), 400

    try:
        # Conversion hex en bytes pour la décompression
        compressed_bytes = bytes.fromhex(compressed_data)
        decompressed = lz4.frame.decompress(compressed_bytes).decode('utf-8')
        try:
            result = json.loads(decompressed)
        except json.JSONDecodeError:
            result = decompressed  # Si ce n'était pas du JSON, retourner la chaîne brute

        return jsonify({"result": result})

    except Exception as e:
        return jsonify({"error": f"Erreur lors de la décompression : {str(e)}"}), 500


@quran_app.route('/submit-surahs', methods=['POST'])
def submit_surahs():
    data = request.get_json()
    selected_surahs = data.get('selected_surahs', [])
    for i, surah in enumerate(quran["sourates"]):
        for j, surah_name in enumerate(selected_surahs):
            if surah["nom_phonetique"] == surah_name:
                selected_surahs[j] = quran["sourates"][i]
    
    return jsonify({'message': 'Data received and saved successfully', 'selected_surahs': selected_surahs}), 200