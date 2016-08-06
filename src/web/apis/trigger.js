var postgres = require('../db/postgres.js');
var untappd = require('../apis/untappd.js');
var bac = require('bac');
var async = require('async');
var moment = require('moment');

function buildCheckinValues(checkins) {
	var checkinValues = '';

	for (var i = 0; i < checkins.length; i++) {

		var userName = checkins[i].user.user_name;
		var checkinId = checkins[i].checkin_id;
		var createdAt = new Date(checkins[i].created_at).toISOString();
		var beerId = checkins[i].beer.bid;
		var beerAbv = checkins[i].beer.beer_abv;
		var beerName = checkins[i].beer.beer_name;
		beerName = beerName.replace("'", "''");

		var beerOunces = 16;
		var stomachFullness = 0;

		if (i > 0) {
			checkinValues += ',';
		}

		checkinValues += "(" + 
			checkinId + ", " + 
			checkinId + ", cast('" + 
			createdAt + "' as timestamp), cast('" +
			createdAt + "' as timestamp), " +  
			beerId + ", " + 
			beerAbv + ", '" +
			beerName + "', '" +
			userName + "', " +
			beerOunces + ", " +
			stomachFullness + ")";
	}

	return checkinValues;
}

function ArrNoDupe(a) {
    var temp = {};
    for (var i = 0; i < a.length; i++)
        temp[a[i]] = true;
    var r = [];
    for (var k in temp)
        r.push(k);
    return r;
}

module.exports = {

	insertNewCheckins: function (callback) {

		postgres.get_tokens(function(tokenResult) {

			async.each(tokenResult.rows, function(item, callback2){

				// var id = item.id;
				var accessToken = item.token;
				var userName = item.uid;

				untappd.checkins(userName, accessToken, function(checkins) {

					var checkinValues = buildCheckinValues(checkins);

					postgres.insert_bulkBeerCheckins(checkinValues, function(result){
						callback2();
					});
				});

			},
			function(err){
				callback();
			});
		});
	},
	processNewCheckins: function(callback) {


		postgres.get_unprocessedCheckins(function(unprocessedCheckins){

			var userCheckins = [];

			async.each(unprocessedCheckins.rows, function(item, callback2){

				var consumed_at = new Date(Date.parse(item.consumed_at__c + "+0000"));
				var now = new Date();
				var difference = Math.abs(now - consumed_at) / 36e5;

				var beer_id = item.bid__c;
				var beer_abv = item.beer_abv__c;
				var beer_ounces = item.beer_ounces__c;
				var user_name = item.user_name__c;

				// check to see if it's in the last 3.5 hours
				if (difference < 3.5)
				{
					// if it is, store username
					userCheckins.push(user_name)
				}

				//TODO: update record and mark as processed

				callback2();
			},
			function(err){

				// check collection of users with recent checkins
				// console.log(userCheckins);
				var noDupes = ArrNoDupe(userCheckins);

				// calculate their bac
				async.each(noDupes, function(userName, callback3){

					postgres.get_profile(userName, function(profile) {

						var toPhoneNumber = profile.rows[0].mobile_phone__c;
						var weight = profile.rows[0].weight__c;
						var isMale = profile.rows[0].male__c;

						//TODO: get this from profile;
						var metabolism = .012;
						var now = new Date();
						var since = new Date(now - 210 * 60000).toISOString();

						postgres.get_recentCheckins(userName, since, function(recentCheckins) {

							// check to see if the first drink was metabolized before the next drink
							var earliestDrinkAt = new Date(recentCheckins.rows[0].consumed_at__c);
							// var totalTimeInHours = new Date(earliestDrinkAt).diff(moment(), 'minutes') / 60;
							var totalTimeInHours = Math.abs(now - earliestDrinkAt) / 36e5;

							var count = recentCheckins.rowCount;
							var beers = [];

							// console.log(userName + ' started drinking ' + totalTimeInHours.toFixed(2) + ' hours ago and drank ' + count + ' beers.');

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

							// send text
							var twilio = require('./twilio.js');
							var accountSid = process.env.TWILIO_SID;
							var authToken = process.env.TWILIO_TOKEN;
							var fromPhoneNumber = process.env.TWILIO_PHONENUMBER;
							var message = 'You just checked in! Your bac is ' + bacAfterElapsedTime.toFixed(3) + '.';
							
							console.log(message);

						// 	console.log('  phone: ' + toPhoneNumber);

						// 	// twilio.sendTxt(accountSid, authToken, toPhoneNumber, fromPhoneNumber, message, function(result) {

						// 	// 	// assert.equal(result.to, toPhoneNumber);
						// 	// 	// assert.equal(result.from, fromPhoneNumber);
						// 	// 	// assert.equal(result.status, 'queued');
						// 	// 	// assert.equal(result.price, null);
						// 	// 	// assert.equal(result.error_message, null);

						// 	// 	console.log('  txt status: ' + result.status);
						// 	// });


							// send txt

							callback();
						});
					});

				},function(err2){
					callback();
				});
			});

		});

		


	}
};