// compressionWorker.js
importScripts('https://cdn.rawgit.com/pieroxy/lz-string/1.4.4/libs/lz-string.min.js');

self.onmessage = function (e) {
    const { action, key, data } = e.data;

    if (action === 'compress') {
        // Compresse les données et retourne le résultat
        const compressedData = LZString.compress(JSON.stringify(data));
        self.postMessage({ key, result: compressedData });
    } else if (action === 'decompress') {
        // Décompresse les données et retourne le résultat
        const decompressedData = JSON.parse(LZString.decompress(data) || 'null');
        self.postMessage({ key, result: decompressedData });
    } else {
        self.postMessage({ key, error: 'Action inconnue' });
    }
};
