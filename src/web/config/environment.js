var bodyParser = require('body-parser');
var path = require ('path');

module.exports = function(app, express){

	// parse application/x-www-form-urlencoded
	app.use(bodyParser.urlencoded({ extended: false }));

	// parse application/json
	app.use(bodyParser.json());

	app.set('port', (process.env.PORT || 5000));
	app.use(express.static(path.join(__dirname + '/../public')));
	app.set('views', path.join(__dirname + '/../views'));
	app.set('view engine', 'ejs');
};