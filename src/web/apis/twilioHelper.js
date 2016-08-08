var twilio = require('twilio');
var postgres = require('../db/postgres.js');
var bac = require('bac');

module.exports = {
	sendTxt: function (accountSid, authToken, toPhoneNumber, fromPhoneNumber, message, result) {

		var client = new twilio.RestClient(accountSid, authToken);
		 
		client.messages.create({
		    body: message,
		    to: toPhoneNumber,
		    from: fromPhoneNumber
		}, function(err, message) {
			if (err) {
		        console.log(err.message);
		    };

		    result(message);
		});
	},

	getBac: function (userName, dateTime, result) {

		postgres.get_profile(userName, function(profile) {

			var toPhoneNumber = profile.rows[0].mobile_phone__c;
			var weight = profile.rows[0].weight__c;
			var isMale = profile.rows[0].male__c;

			//TODO: get this from profile;
			var metabolism = .012;
			// var now = new Date();
			// last 6 hours; 60 minutes
			var since = new Date(dateTime - 360 * 60000).toISOString();

			postgres.get_recentCheckins(userName, since, function(recentCheckins) {
||				if (recentCheckins.rowCount > 0)
				{
					var earliestDrinkAt = new Date(recentCheckins.rows[0].consumed_at__c);
					var totalTimeInHours = Math.abs(dateTime - earliestDrinkAt) / 36e5;

					var count = recentCheckins.rowCount;
					var beers = [];

					//TODO: async?
					for (var i = 0; i < count; i++) {
						beers.push({
							abv: recentCheckins.rows[i].beer_abv__c,
							ounces: (recentCheckins.rows[i].beer_ounces__c / 100)
						});
					};
					var weightInKgs = bac.poundsToKgs(weight);
					var waterPercentage = bac.waterPercentage(isMale);
					var totalBodyWaterPercentage = bac.totalBodyWaterPercentage(weightInKgs, waterPercentage);
					var bacTotalTheoreticalPeak = bac.theoreticalBacPeak(totalBodyWaterPercentage, beers);
					var bacAfterElapsedTime = bac.bacAfterElapsedTime(bacTotalTheoreticalPeak, totalTimeInHours, metabolism);

					message = 'You started drinking ' + totalTimeInHours.toFixed(2) + ' hours ago and drank ' + count + ' beers. Your bac is ' + bacAfterElapsedTime.toFixed(3) + '. Send "COOL" for commands.';
					result(message);
				} else {
					result('No checkins.');
				}
			});
		});
	}
}