import feathers from 'feathers';
import compress from 'compression';
import winston from 'winston';
import feathersHooks from 'feathers-hooks';
import feathersLogger from 'feathers-logger';
import bodyParser from 'body-parser';
import config from './config';

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
  .use('/', feathers.static(app.get('frontend')));

export default app;
