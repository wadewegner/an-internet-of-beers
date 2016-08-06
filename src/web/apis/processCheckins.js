var postgres = require('../db/postgres.js');
var untappd = require('../apis/untappd.js');
var moment = require('moment');
var bac = require('bac');

module.exports = {

	get: function() {

		// if (bulkBeerCheckins.rowCount > 0)
		// {
		// 	postgres.get_profile(userName, function(profile) {

		// 		var toPhoneNumber = profile.rows[0].mobile_phone__c;
		// 		var weight = profile.rows[0].weight__c;
		// 		var isMale = profile.rows[0].male__c;

		// 		//TODO: get this from profile;
		// 		var metabolism = .012;
		// 		var now = moment().subtract(3.5, 'hours').format();

		// 		postgres.get_recentCheckins(userName, now, function(recentCheckins) {

		// 			// check to see if the first drink was metabolized before the next drink
		// 			var earliestDrinkAt = moment(recentCheckins.rows[0].consumed_at__c).utc().format();
		// 			var totalTimeInHours = moment(earliestDrinkAt).diff(moment(), 'minutes') / 60;

		// 			var count = recentCheckins.rowCount;
		// 			var beers = [];

		// 			console.log('started at ' + earliestDrinkAt + ' and drank ' + count + ' beers.');

		// 			for (var i = 0; i < count; i++) {
		// 				beers.push({
		// 					abv: recentCheckins.rows[i].beer_abv__c,
		// 					ounces: (recentCheckins.rows[i].beer_ounces__c / 100)
		// 				});

		// 				// console.log(result.rows[i]);
		// 			};



		// 			var weightInKgs = bac.poundsToKgs(weight);
		// 			var waterPercentage = bac.waterPercentage(isMale);
		// 			var totalBodyWaterPercentage = bac.totalBodyWaterPercentage(weightInKgs, waterPercentage);

		// 			var bacTotalTheoreticalPeak = bac.theoreticalBacPeak(totalBodyWaterPercentage, beers);
		// 			var bacAfterElapsedTime = bac.bacAfterElapsedTime(bacTotalTheoreticalPeak, totalTimeInHours, metabolism);

		// 			// send text
		// 			var twilio = require('./twilio.js');
		// 			var accountSid = process.env.TWILIO_SID;
		// 			var authToken = process.env.TWILIO_TOKEN;
		// 			var fromPhoneNumber = process.env.TWILIO_PHONENUMBER;
		// 			var message = 'You just checked in! Your bac is ' + bacAfterElapsedTime.toFixed(3) + '.';
		// 			console.log('  ' + message);

		// 			console.log('  phone: ' + toPhoneNumber);

		// 			// twilio.sendTxt(accountSid, authToken, toPhoneNumber, fromPhoneNumber, message, function(result) {

		// 			// 	// assert.equal(result.to, toPhoneNumber);
		// 			// 	// assert.equal(result.from, fromPhoneNumber);
		// 			// 	// assert.equal(result.status, 'queued');
		// 			// 	// assert.equal(result.price, null);
		// 			// 	// assert.equal(result.error_message, null);

		// 			// 	console.log('  txt status: ' + result.status);
		// 			// });
		// 		});
		// 	});
		// };


	}
};