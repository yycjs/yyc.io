require('babel/register');

var app = require('./app');

app.listen(app.get('port'));
app.info('Application started on port ' + app.get('port'));
