import Q from 'q';
import tj from 'togeojson';
import { jsdom } from 'jsdom';
import unzip from 'unzip';
import request from 'request';
import path from 'path';
import _ from 'lodash';

function getContent(stream, cb) {
  var result = '';

  stream.on('data', function(data) {
    result += data.toString();
  });

  stream.on('end', function() {
    cb(null, result);
  });
}

module.exports = function() {
  let app = this;
  let points = app.service('points');
  let polygons = app.service('polygons');
  let lines = app.service('lines');

  // When a new catalogue entry is created
  app.service('catalogue').on('created', function(item) {
    let kmz = item.formats.kml;
    if(kmz) {
      // Get the KMZ (zipped KML file) and pipe it through unzip
      let stream = request(kmz).pipe(unzip.Parse());

      stream.on('error', function(error) {
        app.error(`${error.message || error} loading KML for ${item.title}`);
      });

      // When there is a file entry
      stream.on('entry', function (entry) {
        // Check if this unzipped file is what we want
        if(entry.type === 'File' && path.extname(entry.path) === '.kml') {
          // Grabt the content
          getContent(entry, function(err, kml) {
            // Parse into an XML DOM
            let dom = jsdom(kml);
            // Throw into the GeoJSON converter
            let converted = tj.kml(dom);

            app.info(`Adding data for ${item.title}`);
            converted.features.forEach(feature => {
              let type = feature.geometry.type;

              feature.properties = _.transform(feature.properties,
                function(result, value, key) {
                  result[key] = value.toLowerCase();
                });
              feature.properties.dataset_title = item.title;
              feature.properties.dataset_id = item._id.toString();

              switch(type) {
                case 'Point':
                  Q.ninvoke(points, 'create', feature, {});
                  break;
                case 'Polygon':
                  Q.ninvoke(polygons, 'create', feature, {});
                  break;
                default:
                  // TODO handle other formats
                  // app.error(`Can not handle feature type ${type}`);
              }
            })
          });
        }
      });
    }
  });
};
