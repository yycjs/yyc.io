import Q from 'q';
import _ from 'lodash';
import mongodb from 'feathers-mongodb';
import geolib from 'geolib';
import utils from './utils';

module.exports = function() {
  let app = this;
  let polygonService = mongodb({
    connectionString: app.get('mongodb'),
    collection: 'polygons'
  }).extend({
    find(params) {
      let _super = this._super.bind(this);
      let query = params.query;

      params.query = _.transform(query, function(result, value, key) {
        if(key !== 'location') {
          result[`properties.${key}`] = value;
        }
      });

      return Q.nfcall(_super, params).then(utils.convert);
    }
  });
  app.use('/polygons', polygonService);
};
