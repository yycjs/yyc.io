import mongodb from 'feathers-mongodb';

module.exports = function() {
  let app = this;
  let polygonService = mongodb({
    connectionString: app.get('mongodb'),
    collection: 'polygons'
  }).extend({});
  app.use('polygons', polygonService);
};
