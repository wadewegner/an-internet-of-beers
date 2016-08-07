var postgres = require('../db/postgres.js');
var phone = require('phone');

module.exports = {
	get: function (request, response) {

		postgres.get_profile(response.locals.userName, function(result) {

			var weight = result.rows[0].weight__c;
			var isMale = result.rows[0].male__c;
			var mobilePhone = result.rows[0].mobile_phone__c;

			console.log('  weight: ' + weight);
			console.log('  isMale: ' + isMale);
			console.log('  mobilePhone: ' + phone(mobilePhone)[0]);

			var updated = false;
			response.render('pages/profile', {weight, isMale, mobilePhone, updated});
		});

	},
	post: function (request, response) {
		var mobilePhone = request.body.phone;
		var weight = request.body.weight;
		var gender = request.body.gender;

		isMale = false;
		if (gender == "Male") { isMale = true; }

		var processedPhone = phone(mobilePhone)[0];

		postgres.update_profile(response.locals.userName, weight, isMale, processedPhone, function(result) {

			var updated = true;

			// send text
			var twilio = require('./twilioHelper.js');
			var accountSid = process.env.TWILIO_SID;
			var authToken = process.env.TWILIO_TOKEN;
			var fromPhoneNumber = process.env.TWILIO_PHONENUMBER;
			var sendTxt = process.env.SEND_TXT;
			var message = 'Thanks for signing up! Send "COOL" for commands.';

				twilio.sendTxt(accountSid, authToken, processedPhone, fromPhoneNumber, message, function(result2) {

					postgres.get_userfromphone(processedPhone, function(result3){

						var userName = result3.rows[0].user_name__c;

						postgres.insert_sentMessage(userName, message, function(result3){
							response.render('pages/profile', {weight, isMale, mobilePhone, updated});
						});

					});
				});
		});
	}
};