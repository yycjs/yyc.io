// Converts a list of points to a GeoJSON FeatureCollection
exports.convert = function convert(points) {
  return {
    "type": "FeatureCollection",
    "features": points
  };
};

// Parse a point string (from query parameters)
exports.getPoint = function getPoint(point) {
  let split = point.split(',');
  return {
    longitude: parseFloat(split[0]),
    latitude: parseFloat(split[1])
  }
};

// Turn a GeoJSON entry into a point
exports.fromGeoJSON = function fromGeoJSON(current) {
  return {
    latitude: current.geometry.coordinates[0],
    longitude: current.geometry.coordinates[1]
  }
};

exports.toPointList = function toPointList(polygon) {
  let coords = polygon.geometry.coordinates[0];
  return coords.map(coord => {
    return {
      longitude: coord[0],
      latitude: coord[1]
    }
  });
};
