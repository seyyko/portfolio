// compressionWorker.js
importScripts('https://cdn.rawgit.com/pieroxy/lz-string/1.4.4/libs/lz-string.min.js');

self.onmessage = function (e) {
    const { action, key, data } = e.data;

    if (action === 'compress') {
        try {
            // Compress data, avoid JSON.stringify if the data is already a string
            const compressedData = LZString.compress(typeof data === 'string' ? data : JSON.stringify(data));
            self.postMessage({ key, result: compressedData });
        } catch (error) {
            self.postMessage({ key, error: 'Compression échouée : ' + error.message });
        }
    } else if (action === 'decompress') {
        try {
            // Decompress and safely handle potential null result
            const decompressedData = LZString.decompress(data);
            const result = decompressedData ? JSON.parse(decompressedData) : null;
            self.postMessage({ key, result });
        } catch (error) {
            self.postMessage({ key, error: 'Décompression échouée : ' + error.message });
        }
    } else {
        self.postMessage({ key, error: 'Action inconnue' });
    }
};
