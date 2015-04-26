import _ from 'lodash';

const preventExternal = exports.preventExternal = function(hook, next) {
  if(hook.params.external) {
    return next(new Error('Not allowed'))
  }

  return next();
};

const addFilterOptions = exports.addFilterOptions = function addFilterOptions(hook, next) {
  let limit = hook.params.external ? 100 : undefined;
  let query = hook.params.query || {};
  let options = {
    sort: query.__sort ? { [query.__sort]: query.__order || 1 } : undefined,
    limit: query.__limit || limit,
    skip: query.__skip
  };

  hook.params.query = _.omit(query, '__sort', '__limit', '__skip');
  hook.params.options = options;

  next();
};

exports.setup = function setup() {
  let app = this;
  let hooks = {
    // Adds filter options
    find: addFilterOptions,
    // Our API is read-only externally
    create: preventExternal,
    update: preventExternal,
    patch: preventExternal,
    delete: preventExternal
  };

  app.service('catalogue').before(hooks);
  app.service('points').before(hooks);
  app.service('polygons').before(hooks);
};