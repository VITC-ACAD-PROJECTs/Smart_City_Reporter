const fs = require('fs');
const path = require('path');
const turf = require('@turf/turf');

const divisionsPath = path.join(__dirname, '..', 'data', 'gcc-divisions-latest.geojson');
const geojson = JSON.parse(fs.readFileSync(divisionsPath, 'utf8'));
const features = geojson.features || [];

// Change this to match the actual file name and path
const wardZones = require('../data/ward-zones.json'); // This should be an array

function locateWard(lat, lng) {
  const point = turf.point([lng, lat]);
  for (const feature of features) {
    if (turf.booleanPointInPolygon(point, feature)) {
      // Get ward number, trimming whitespace/newline
      const wardNum = parseInt(feature.properties.Name, 10);
      // Map ward number to correct array index
      const wardName = wardZones[wardNum - 1] || null;
      return {
        wardNumber: wardNum,
        wardName: wardName,
        ...feature.properties
      };
    }
  }
  return null;
}

module.exports = { locateWard };

