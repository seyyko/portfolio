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
    # Retrieve the data sent in the JSON request body
    data = request.json.get('data')
    
    if not data:
        # If no data is provided, return an error
        return jsonify({"error": "No data provided"}), 400

    try:
        # If the data is not already a string, serialize it to JSON
        if not isinstance(data, str):
            # Remove unnecessary spaces by using separators to compact the JSON
            data = json.dumps(data, separators=(',', ':'))  # Removing unnecessary spaces

        # Compress the data with LZ4 using the best compression level (9)
        compressed = lz4.frame.compress(data.encode('utf-8'), compression_level=9)  # Best compression level
        # Convert the compressed data to hexadecimal format for storage
        compressed_base64 = compressed.hex()  # Using hex format for storage

        # Return the compressed data in the response
        return jsonify({"result": compressed_base64})

    except Exception as e:
        # If an error occurs during compression, return the error message
        return jsonify({"error": f"Error during compression: {str(e)}"}), 500


# Route to decompress data
@quran_app.route('/decompress', methods=['POST'])
def decompress_data():
    # Retrieve the compressed data sent in the JSON request body
    compressed_data = request.json.get('data')
    
    if not compressed_data:
        # If no compressed data is provided, return an error
        return jsonify({"error": "No data provided"}), 400

    try:
        # Convert the hex string back into bytes for decompression
        compressed_bytes = bytes.fromhex(compressed_data)

        # Decompress the data using LZ4
        decompressed = lz4.frame.decompress(compressed_bytes).decode('utf-8')
        
        # Attempt to deserialize the decompressed data if it's in JSON format
        try:
            result = json.loads(decompressed)
        except json.JSONDecodeError:
            # If it's not valid JSON, return the decompressed string as is
            result = decompressed  # If it's not JSON, return the raw string

        # Return the decompressed data in the response
        return jsonify({"result": result})

    except Exception as e:
        # If an error occurs during decompression, return the error message
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