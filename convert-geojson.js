const fs = require('fs');

// Read the GeometryCollection file
const data = JSON.parse(fs.readFileSync('./public/KOTA_SURABAYA_KECAMATAN.json', 'utf8'));

// Convert to FeatureCollection
const featureCollection = {
    type: "FeatureCollection",
    features: data.geometries.map((geometry, index) => ({
        type: "Feature",
        properties: {
            // Since we don't have kecamatan names in the original file,
            // we'll add generic names. You'll need to update these manually
            // or from another data source
            nama_kecamatan: `Kecamatan ${index + 1}`
        },
        geometry: geometry
    }))
};

// Write the converted file
fs.writeFileSync('./public/KOTA_SURABAYA_FC.json', JSON.stringify(featureCollection, null, 2));

console.log(` Converted ${featureCollection.features.length} geometries to FeatureCollection format`);
