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

# Compression function with LZ4 and optimizations
@quran_app.route('/compress', methods=['POST'])
def compress_data():
    data = request.json.get('data')
    
    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        # If the data is not already a string, serialize it to JSON
        if not isinstance(data, str):
            data = json.dumps(data, separators=(',', ':'))

        compressed = lz4.frame.compress(data.encode('utf-8'), compression_level=9) # Best compression level
        compressed_base64 = compressed.hex()

        return jsonify({"result": compressed_base64})

    except Exception as e:
        return jsonify({"error": f"Error during compression: {str(e)}"}), 500


# Route to decompress data
@quran_app.route('/decompress', methods=['POST'])
def decompress_data():
    compressed_data = request.json.get('data')
    
    if not compressed_data:
        return jsonify({"error": "No data provided"}), 400

    try:
        # Convert the hex string back into bytes for decompression
        compressed_bytes = bytes.fromhex(compressed_data)
        # Decompress the data using LZ4
        decompressed = lz4.frame.decompress(compressed_bytes).decode('utf-8')
        try:
            result = json.loads(decompressed)
        except json.JSONDecodeError:
            result = decompressed

        return jsonify({"result": result})

    except Exception as e:
        return jsonify({"error": f"Error during decompression: {str(e)}"}), 500


@quran_app.route('/submit-surahs', methods=['POST'])
def submit_surahs():
    data = request.get_json()
    selected_surahs = data.get('selected_surahs', [])
    for i, surah in enumerate(quran["sourates"]):
        for j, surah_name in enumerate(selected_surahs):
            if surah["nom_phonetique"] == surah_name:
                selected_surahs[j] = quran["sourates"][i]
    
    return jsonify({'message': 'Data received and saved successfully', 'selected_surahs': selected_surahs}), 200