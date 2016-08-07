var config = require('./config/config.js');
var request = require('request');
var twilio = require('twilio');

function parseCookies (request) {
	var list = {},
	rc = request.headers.cookie;

	rc && rc.split(';').forEach(function( cookie ) {
		var parts = cookie.split('=');
		list[parts.shift().trim()] = decodeURI(parts.join('='));
	});

	return list;
}

var token = process.env.FACEBOOK_PAGE_TOKEN;

function sendTextMessage(sender, text) {
	messageData = {
		text:text
	}

	request({
			url: 'https://graph.facebook.com/v2.6/me/messages',
			qs: {access_token:token},
			method: 'POST',
			json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
	if (error) {
		console.log('Error sending message: ', error);
	} else if (response.body.error) {
	console.log('Error: ', response.body.error);
	}
	});
}

module.exports = function(app) {

	// First, checks if it isn't implemented yet.
	if (!String.prototype.format) {
		String.prototype.format = function() {
			var args = arguments;
			return this.replace(/{(\d+)}/g, function(match, number) { 
				return typeof args[number] != 'undefined'
				? args[number]
				: match
				;
			});
		};
	}

	app.locals.signinUrl = config.untappd.signin_url.format(process.env.CLIENT_ID, process.env.REDIRECT_URL);

	app.use(function (request, response, next) {
		console.log('Page: ' + request.originalUrl)

		var cookies = parseCookies(request);
		var accessToken = cookies.accessToken;
		var firstName = cookies.firstName;
		var lastName = cookies.lastName;
		var userName = cookies.userName;

		response.locals.accessToken = accessToken;
		response.locals.firstName = firstName;
		response.locals.lastName = lastName;
		response.locals.userName = userName;

		next();
	})

	// index.ejs
	app.get('/', function(request, response) {

		response.render('pages/index', {});
	});

	// profile.ejs
	app.get('/profile', function(request, response) {

		var profile = require('./apis/profile');
		profile.get(request, response);

	});

	app.post('/profile', function(request, response) {

		var profile = require('./apis/profile');
		profile.post(request, response);

	});

	// privacy.ejs
	app.get('/privacy', function(request, response) {

		response.render('pages/privacy', {});
	});

	// trigger new checkins
	app.get('/trigger', function(request, response) {

		var trigger = require('./apis/trigger');

		trigger.insertNewCheckins(function(result) {
			response.send('ok');
		});
	});

	// trigger new checkins
	app.get('/trigger2', function(request, response) {

		var trigger = require('./apis/trigger');

		trigger.processNewCheckins(function(result2) {
			response.send('ok');
		});
	});

	app.get('/webhook', function(request, response) {

		if (request.query['hub.verify_token'] === 'myverifytoken') {
		    response.send(request.query['hub.challenge']);
		}
		
		response.send('Error, wrong validation token');
	});

	app.post('/webhook', function (request, response) {
		messaging_events = request.body.entry[0].messaging;

		for (i = 0; i < messaging_events.length; i++) {
			
			event = request.body.entry[0].messaging[i];
			sender = event.sender.id;

			if (event.message && event.message.text) {
				text = event.message.text;
				// Handle a text message from this sender

				console.log('  from FB: ' + text);

				sendTextMessage(sender, "Text received, echo: "+ text.substring(0, 200));
			}
		}
		response.sendStatus(200);
	});

	// oauth callback
	app.get('/callback', function(request, response) {

		var callback = require('./apis/callback');
		callback.get(request, response);

	});

	// oauth callback
	app.post('/twilio', function(request, response) {

		var accountSid = process.env.TWILIO_SID;
		var authToken = process.env.TWILIO_TOKEN;
		var fromPhoneNumber = process.env.TWILIO_PHONENUMBER;

	    if (twilio.validateExpressRequest(request, authToken)) {

// 2016-08-07T17:17:20.083398+00:00 app[web.1]: Page: /twilio
// 2016-08-07T17:17:20.100309+00:00 app[web.1]: { ToCountry: 'US',
// 2016-08-07T17:17:20.100311+00:00 app[web.1]:   ToState: 'IL',
// 2016-08-07T17:17:20.100313+00:00 app[web.1]:   SmsMessageSid: 'SMa04221f73bc2b3b9eaadb941fa7b507d',
// 2016-08-07T17:17:20.100314+00:00 app[web.1]:   NumMedia: '0',
// 2016-08-07T17:17:20.100315+00:00 app[web.1]:   ToCity: 'WHEELING',
// 2016-08-07T17:17:20.100315+00:00 app[web.1]:   FromZip: '80918',
// 2016-08-07T17:17:20.100316+00:00 app[web.1]:   SmsSid: 'SMa04221f73bc2b3b9eaadb941fa7b507d',
// 2016-08-07T17:17:20.100317+00:00 app[web.1]:   FromState: 'CO',
// 2016-08-07T17:17:20.100317+00:00 app[web.1]:   SmsStatus: 'received',
// 2016-08-07T17:17:20.100318+00:00 app[web.1]:   FromCity: 'COLORADO SPRINGS',
// 2016-08-07T17:17:20.100318+00:00 app[web.1]:   Body: 'Test8',
// 2016-08-07T17:17:20.100319+00:00 app[web.1]:   FromCountry: 'US',
// 2016-08-07T17:17:20.100320+00:00 app[web.1]:   To: '+12245883104',
// 2016-08-07T17:17:20.100320+00:00 app[web.1]:   ToZip: '60090',
// 2016-08-07T17:17:20.100321+00:00 app[web.1]:   NumSegments: '1',
// 2016-08-07T17:17:20.100321+00:00 app[web.1]:   MessageSid: 'SMa04221f73bc2b3b9eaadb941fa7b507d',
// 2016-08-07T17:17:20.100322+00:00 app[web.1]:   AccountSid: 'AC4a8be98fbae816067e0c0517858f56fd',
// 2016-08-07T17:17:20.100322+00:00 app[web.1]:   From: '+17196610040',
// 2016-08-07T17:17:20.100323+00:00 app[web.1]:   ApiVersion: '2010-04-01' }

			var fromZip = request.body.FromZip;
			var fromState = request.body.FromState;
			var fromCity = request.body.FromCity;
			var body = request.body.Body;
			var fromCountry = request.body.FromCountry;
			var fromPhone = request.body.From;

			console.log(fromPhone);

			// var twiml = new twilio.TwimlResponse();
		    // twiml.message('Thanks ' + fromPhone);
		    console.log('testing');
		    var message = 'testing from ' + fromPhone;
		    // response.send(twiml);

	    	// console.log(request.body);
	        // response.sendStatus(200);
	        response.send(message);
	    }
	    else {
	        response.status(403).send('you are not twilio. Buzz off.');
	    }

	});

	// logout
	app.get('/logout', function(request, response) {

		response.clearCookie('accessToken');
		response.clearCookie('firstName');
		response.clearCookie('lastName');
		response.clearCookie('userName');

		response.locals.accessToken = '';
		response.locals.firstName = '';
		response.locals.lastName = '';
		response.locals.userName = '';

		response.redirect('/');
	});
};