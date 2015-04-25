import feathers from 'feathers';
import compress from 'compression';
import config from './config';
import feathersHooks from 'feathers-hooks';

const app = feathers();

app.configure(feathers.rest())
  .use(function(req, res, next) {
    req.feathers = { external: true };
    next();
  })
  // Standard middleware
  .use(compress())
  .use(bodyParser.json())
  // Set up configuration (with the current NODE_ENV)
  .configure(config(app.settings.env))
  // Static files
  .use('/', feathers.static(app.get('frontend')));

export default app;
