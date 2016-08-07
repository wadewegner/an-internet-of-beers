var config = require('./config/config.js');
var request = require('request');
var twilio = require('twilio');
var bac = require('bac')

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
			trigger.processNewCheckins(function(result2) {
				response.send('ok');
			});
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
	app.post('/twilio', twilio.webhook(), function(request, response) {

		var fromZip = request.body.FromZip;
		var fromState = request.body.FromState;
		var fromCity = request.body.FromCity;
		var body = request.body.Body;
		var fromCountry = request.body.FromCountry;
		var fromPhone = request.body.From;

		var postgres = require('./db/postgres.js');
		var twilioHelper = require('./apis/twilioHelper.js');

		postgres.insert_sms(fromState, fromCity, fromZip, fromCountry, fromPhone, body, function(result) {

			postgres.get_userfromphone(fromPhone, function(result2){

				var userName = result2.rows[0].user_name__c;

				var twiml = new twilio.TwimlResponse();
				var message = '';

				if (body.toLowerCase().indexOf('cool') !== -1)
				{
					message = 'To get your current BAC, send "bac". To add a drink w/o Untapped send "new {oz} {abv}". To change # of oz, send "last {oz}". To understand the impact of a beer, send "impact {oz} {abv}".';
					twiml.message(message);
					response.send(twiml);	

				} else if (body.toLowerCase().indexOf('bac') !== -1) {

					twilioHelper.getCurrentBac(userName, function(result) {
						twiml.message(result);
						response.send(twiml);
					});

				} else if (body.toLowerCase().indexOf('new') !== -1) {

					var array = body.split(' ', 3);

					var ounces = array[1];
					var abv = array[2];

					postgres.insert_beerCheckin(abv, userName, ounces, new Date().toISOString(), function(result){

						message = "Received your additional drink! You'll receive an updated BAC shortly.";
						twiml.message(message);
						response.send(twiml);	

					});

				} else if (body.toLowerCase().indexOf('last') !== -1) {

					var array = body.split(' ', 2);
					var ounces = array[1];

					postgres.get_lastCheckin(userName, function(result){
						var id = result.rows[0].id;

						postgres.update_checkin(id, ounces, function(result){

							twiml.message("We've updated your last checkin to " + ounces + " ounces!");
							response.send(twiml);	

						});
					});

				} else if (body.toLowerCase().indexOf('impact') !== -1) {

					twiml.message("Still implementing the impact functionality.");
					response.send(twiml);	

				} else {
					message = 'We did not understand. Send "COOL" for commands.';
					twiml.message(message);
					response.send(twiml);	
				}
			})
		});
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