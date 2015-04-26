import polygon from './polygon';
import point from './point';

module.exports = function() {
  let app = this;

  app.configure(polygon);
  app.configure(point);
};
