var express = require('express');
var app = express();

require('./config/environment.js')(app, express);
require('./routes.js')(app);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});