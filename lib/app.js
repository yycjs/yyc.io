import feathers from 'feathers';
import winston from 'winston';
import Q from 'q';
import compress from 'compression';
import bodyParser from 'body-parser';
import feathersHooks from 'feathers-hooks';
import feathersLogger from 'feathers-logger';
import mongodb from 'feathers-mongodb';

import config from './config';
import { crawl } from './crawler';

const app = feathers();

app.configure(feathers.rest())
  .use(function(req, res, next) {
    req.feathers = { external: true };
    next();
  })
  .configure(feathersLogger(winston))
  // Standard middleware
  .use(compress())
  .use(bodyParser.json())
  // Set up configuration (with the current NODE_ENV)
  .configure(config(app.settings.env))
  // Static files
  .use('/', feathers.static(app.get('frontend')))
  // Catalogue service
  .use('catalogue', mongodb({
    connectionString: app.get('mongodb'),
    collection: 'catalogue'
  }));

// Run the crawler
crawl(app.get('catalogue')).then(items => {
  // Get the catalogue service
  let service = app.service('catalogue');

  // Add each item
  return Q.all(items.map(item => {
    // Find the item based on its dataset_id
    return Q.ninvoke(service, 'find', { dataset_id: item.dataset_id }).then(items => {
      let databaseItem = items[0];

      if(!databaseItem) { // If not in database
        // Create a new one
        return Q.ninvoke(service, 'create', item, {});
      } else if(databaseItem.date === item.date) { // If not up to date
        // Replaces the entire item with the new one
        return Q.ninvoke(service, 'update', databaseItem._id.toString(), item, {});
      } else {
        app.info(`Dataset ${item.dataset_id} already in database and up to date`);
      }
    });
  }));
}).fail(error => console.error(error.stack));

export default app;
