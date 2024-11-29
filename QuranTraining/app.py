from flask import render_template, request, redirect, url_for, jsonify, Blueprint
import json, sys, os
import zstandard as zstd


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


@quran_app.route('/compress', methods=['POST'])
def compress_data():
    data = request.json.get('data')
    
    if not data:
        return jsonify({"error": "Aucune donnée fournie"}), 400

    try:
        # If the data is not already a string, serialize it to JSON
        if not isinstance(data, str):
            data = json.dumps(data, separators=(',', ':')) # Remove unnecessary spaces

        # Zstandard compression
        compressor = zstd.ZstdCompressor(level=4)  # Choose a fast compression level (level 4 is often a good compromise)
        compressed = compressor.compress(data.encode('utf-8'))
        compressed_base64 = compressed.hex()  # Hex format for storage

        return jsonify({"result": compressed_base64})

    except Exception as e:
        return jsonify({"error": f"Erreur lors de la compression : {str(e)}"}), 500


@quran_app.route('/decompress', methods=['POST'])
def decompress_data():
    compressed_data = request.json.get('data')
    
    if not compressed_data:
        return jsonify({"error": "Aucune donnée fournie"}), 400

    try:
        # Hex to byte conversion for decompression
        compressed_bytes = bytes.fromhex(compressed_data)

        # Decompression with Zstandard
        decompressor = zstd.ZstdDecompressor()
        decompressed = decompressor.decompress(compressed_bytes).decode('utf-8')

        try:
            result = json.loads(decompressed)
        except json.JSONDecodeError:
            result = decompressed

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