import Q from 'q';
import mongodb from 'feathers-mongodb';
import _ from 'lodash';
import geolib from 'geolib';
import utils from './utils';

module.exports = function() {
  let app = this;
  let pointService = mongodb({
    connectionString: app.get('mongodb'),
    collection: 'points'
  }).extend({
    find(params) {
      let _super = this._super.bind(this);
      let query = params.query;
      let reservedProperties = ['location', 'polygon', 'radius'];

      params.query = _.transform(query, function(result, value, key) {
        if(reservedProperties.indexOf(key) === -1) {
          result[`properties.${key}`] = value;
        }
      });

      if(query.location || query.polygon) { // Special query
        delete params.options.limit;
        return Q.nfcall(_super, params).then(function(points) {
          // Search within a given radius
          if(query.location) {
            let radius = query.radius || 1000;
            let location = utils.getPoint(query.location);
            // Filter each point if it is within the given radius
            return points.filter(current =>
              geolib.isPointInCircle(utils.fromGeoJSON(current), location, radius));
          } else if(query.polygon) { // Search within a polygon
            let polygon = query.polygon.map(p => utils.getPoint(p));
            // Filter each point and check if it's within the polygon
            return points.filter(current =>
              geolib.isPointInside(utils.fromGeoJSON(current), polygon))
          } else {
            throw new Error('Invalid query');
          }
        }).then(utils.convert);
      }

      return Q.nfcall(_super, params).then(utils.convert);
    }
  });
  app.use('/points', pointService);
};
