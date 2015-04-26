import Q from 'q';
import mongodb from 'feathers-mongodb';
import _ from 'lodash';
import geolib from 'geolib';

function convert(points) {
  return {
    "type": "FeatureCollection",
    "features": points
  };
}

module.exports = function() {
  let app = this;
  let pointService = mongodb({
    connectionString: app.get('mongodb'),
    collection: 'points'
  }).extend({
    find(params, callback) {
      let _super = this._super.bind(this);
      let query = params.query;

      if(query.latitude && query.longitude) {
        let radius = query.radius || 1000;
        return Q.nfcall(_super, {}).then(function(points) {
          // Filter each point if it is within the given radius
          return points.filter(point => geolib.isPointInCircle({
            latitude: point.geometry.coordinates[0],
            longitude: point.geometry.coordinates[1]
          }, {
            latitude: parseFloat(query.latitude),
            longitude:  parseFloat(query.longitude)
          }, radius));
        }).then(convert);
      }

      return Q.nfcall(_super, params).then(convert);
    }
  });
  app.use('points', pointService);
};
