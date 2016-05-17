var postgres = require('../db/postgres.js');
var moment = require('moment');

module.exports = {
	get: function () {

		postgres.get_tokens(function(result) {

			for (var i = 0; i < result.rowCount; i++) {

				var id = result.rows[i].id;
				var accessToken = result.rows[i].token;
				var userName = result.rows[i].uid;


				var url = 'https://api.untappd.com/v4/user/checkins/{0}?access_token={1}'.format(userName, accessToken);

				var requestify = require('requestify');

				requestify.get(url).then(function(response) {

					var checkins = response.getBody().response.checkins.items;
					var checkinValues = '';

					for (var i = 0; i < checkins.length; i++) {

						var userName = checkins[i].user.user_name;
						var checkinId = checkins[i].checkin_id;
						var createdAt = moment(checkins[i].created_at).utc().format();
						console.log(  'created_at: ' + createdAt);
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

					postgres.insert_bulkBeerCheckins(
						checkinValues,
						function(result) {

							console.log('  inserted: ' + result.rowCount);

							if (result.rowCount > 0)
							{
								postgres.get_profile(userName, function(result) {

									var toPhoneNumber = result.rows[0].mobile_phone__c;
									var weight = result.rows[0].weight__c;
									var isMale = result.rows[0].male__c;
									//TODO: get this from profile;
									var metabolism = .012;

									// console.log('  txt to: ' + toPhoneNumber);

										// get bac
									var now = moment().subtract(3.5, 'hours').format();

									postgres.get_recentCheckins(
										userName,
										now,
										function(result) {

											// check to see if the first drink was metabolized before the next drink
											var earliestDrinkAt = moment(result.rows[0].consumed_at__c).utc().format();
											var totalTimeInHours = moment(earliestDrinkAt).diff(moment(), 'minutes') / 60;

											var count = result.rowCount;
											var beers = [];

											console.log('started at ' + earliestDrinkAt + ' and drank ' + count + ' beers.');

											for (var i = 0; i < count; i++) {
												beers.push({
													abv: result.rows[i].beer_abv__c,
													ounces: (result.rows[i].beer_ounces__c / 100)
												});

												// console.log(result.rows[i]);
											};

											var bac = require('./bac.js');

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
											console.log('  ' + message);

											twilio.sendTxt(accountSid, authToken, toPhoneNumber, fromPhoneNumber, message, function(result) {

												// assert.equal(result.to, toPhoneNumber);
												// assert.equal(result.from, fromPhoneNumber);
												// assert.equal(result.status, 'queued');
												// assert.equal(result.price, null);
												// assert.equal(result.error_message, null);

												console.log('  txt status: ' + result.status);
											});
										});
									});
							};
						});
				});
			}
		});
	}
};