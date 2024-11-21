import sys, json, requests, time

sys.stdout.reconfigure(encoding='utf-8')

def getData(url: str):
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json().get("data", {})
    except requests.exceptions.RequestException as e:
        print(f"Erreur lors de la requête : {e}")
    except Exception as e:
        print(f"Erreur : {e}")
    return {}

file_path = 'quran.json'
with open(file_path, 'r', encoding='utf-8') as file:
    data = json.load(file)

for surah_data in data["sourates"]:
    surah = surah_data['position'] 
    verse = 1

    URL_hafs = f"https://api.alquran.cloud/v1/ayah/{surah}:{verse}/ar.alafasy"
    URL_warsh = f"https://api.alquran.cloud/v1/ayah/{surah}:{verse}/warsh"
    URL_en = f"https://api.alquran.cloud/v1/ayah/{surah}:{verse}/en.sahih"
    
    surah_data["englishNameTranslation"] = getData(URL_hafs)['surah']['englishNameTranslation']
    print(f"Progress : {surah*100 / 6236} %".ljust(20), end="\r")
    for verse_data in surah_data["versets"]:
        verse = verse_data['position_ds_sourate']

        URL_hafs = f"https://api.alquran.cloud/v1/ayah/{surah}:{verse}/ar.alafasy"
        URL_warsh = f"https://api.alquran.cloud/v1/ayah/{surah}:{verse}/warsh"
        URL_en = f"https://api.alquran.cloud/v1/ayah/{surah}:{verse}/en.sahih"

        text_hafs = getData(URL_hafs).get('text', '')
        text_warsh = getData(URL_warsh).get('text', '')
        text_en = getData(URL_en).get('text', '')

        verse_data.pop("text_arabe", None)
        verse_data["text_hafs"] = text_hafs
        verse_data["text_warsh"] = text_warsh
        verse_data["text_en"] = text_en

with open('quran_updated.json', 'w', encoding='utf-8') as file:
    json.dump(data, file, ensure_ascii=False, indent=4)
