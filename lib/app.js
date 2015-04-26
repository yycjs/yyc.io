import feathers from 'feathers';
import winston from 'winston';
import Q from 'q';
import compress from 'compression';
import bodyParser from 'body-parser';
import hooks from 'feathers-hooks';
import logger from 'feathers-logger';
import mongodb from 'feathers-mongodb';
import request from 'request';

import config from './config';
import services from './services/index';
import crawler from './crawler/index';
import serviceHooks from './hooks';

const app = feathers();

app.configure(feathers.rest())
  .use(function(req, res, next) {
    req.feathers = { external: true };
    next();
  })
  .configure(logger(winston))
  .configure(hooks())
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
  }))
  .configure(services)
  // Initializes the crawler
  .configure(crawler())
  // Set up service hooks
  .configure(serviceHooks.setup);

export default app;
