var assert = require('chai').assert;
var config = require('../src/web/config/config.js');
var moment = require('moment');

require('dotenv').load();

function checkString(value, description) {

	assert.isNotNull(value, description);
	assert.isDefined(value, description);
	assert.isString(value, description);
	assert.isAtLeast(value.length, 1, description);

}

describe('Database', function() {

	this.timeout(15000);

	before(function(done) {
		done();
	});

	var postgres = require('../src/web/db/postgres.js');
	var uid = 'user_name';
	var accessToken = 'access_token';
	var weight = 180;
	var isMale = true;
	var metabolism = .012;
	var mobilePhone = '1-555-867-5309';
	var date1 = moment().subtract(2, 'hours').format();
	var date2 = moment().subtract(1, 'hours').format();

	describe('Connect', function() {
		it('should connect to the Postgres database defined in the .env file', function(done) {

			var pg = require('pg');
			pg.defaults.ssl = true;

			pg.connect(process.env.DATABASE_URL, function(err, client, done2) {

				checkString(client.user, '');
				checkString(client.password, '');
				checkString(client.database, '');
				checkString(client.host, '');

				assert.isNumber(client.port);

				done2();
				done();
			});
		});

		it('should create a new test user', function(done) {

			var id = 'id';
			var user_name = 'user_name';
			var first_name = 'first_name';
			var last_name = 'last_name';
			var user_avatar = 'user_avatar';
			var user_avatar_hd = 'user_avatar_hd';
			var user_cover_photo = 'user_cover_photo';
			var user_cover_photo_offset = 'user_cover_photo_offset';
			var location = 'location';
			var bio = 'bio';
			var url = 'url';
			var untappd_url = 'untappd_url'
			var twitter = 'twitter';
			var foursquare = 'foursquare';
			var facebook = 'facebook';
			var email_address = 'email@address.com';

			var postgres = require('../src/web/db/postgres.js');
			postgres.insert_uptappduser(
				uid,
				user_name,
				facebook,
				bio,
				location,
				email_address,
				user_avatar_hd,
				user_avatar,
				first_name,
				foursquare,
				untappd_url,
				last_name,
				twitter,
				url,
				user_cover_photo,
				id,
				function(result) {

					assert.equal(result.command, 'INSERT');
					assert.equal(result.rowCount, 1);
					done();

				});
		});

		it('should update the test users profile information', function(done) {

			postgres.update_profile(
				uid,
				weight,
				isMale,
				mobilePhone,
				function(result) {

					assert.equal(result.command, 'UPDATE');
					assert.equal(result.rowCount, 1);
					done();

				});
		});

		it('should get the updated profile information for the test user', function (done) {

			postgres.get_profile(
				uid,
				function(result) {

					assert.isDefined(result.rows);
					assert.isDefined(result.rows[0]);

					assert.equal(result.rows[0].weight__c, weight);
					assert.equal(result.rows[0].male__c, isMale);
					assert.equal(result.rows[0].mobile_phone__c, mobilePhone);

					assert.equal(result.command, 'SELECT');
					assert.equal(result.rowCount, 1);
					done();

				});
		});

		it('should create a new access token for the test user', function(done) {

			postgres.insert_accessToken(
				accessToken,
				uid,
				function(result) {

					assert.equal(result.command, 'INSERT');
					assert.equal(result.rowCount, 1);
					done();

				});
		});

		it('should get all access tokens in the db', function(done) {

			postgres.get_tokens(
				function(result) {

					assert.equal(result.command, 'SELECT');
					assert.isAtLeast(result.rowCount, 2);
					done();

				});
		});

		it('should not update the database with beer checkins due to unique constraints', function(done) {

			var checkinValues = "(306806381, 306806381, cast('Tue, 03 May 2016 00:36:40 +0000' as timestamp), cast('Tue, 03 May 2016 00:36:40 +0000' as timestamp), 8812, 7, 'Lucille', 'wadewegner', 16, 0)," +
				"(306803460, 306803460, cast('Tue, 03 May 2016 00:29:22 +0000' as timestamp), cast('Tue, 03 May 2016 00:29:22 +0000' as timestamp), 8812, 7, 'Lucille', 'wadewegner', 16, 0)," +
				"(306458962, 306458962, cast('Sun, 01 May 2016 20:56:09 +0000' as timestamp), cast('Sun, 01 May 2016 20:56:09 +0000' as timestamp), 8812, 7, 'Lucille', 'wadewegner', 16, 0)," +
				"(303792894, 303792894, cast('Sun, 24 Apr 2016 20:32:19 +0000' as timestamp), cast('Sun, 24 Apr 2016 20:32:19 +0000' as timestamp), 275218, 6.5, 'Dark Persuasion German Chocolate Ale', 'wadewegner', 16, 0)," +
				"(303788194, 303788194, cast('Sun, 24 Apr 2016 20:24:13 +0000' as timestamp), cast('Sun, 24 Apr 2016 20:24:13 +0000' as timestamp), 54207, 6.5, 'Bootjack IPA', 'wadewegner', 16, 0)," +
				"(303785304, 303785304, cast('Sun, 24 Apr 2016 20:18:47 +0000' as timestamp), cast('Sun, 24 Apr 2016 20:18:47 +0000' as timestamp), 180955, 5, 'Dirtyface Amber Lager', 'wadewegner', 16, 0)," +
				"(303782621, 303782621, cast('Sun, 24 Apr 2016 20:14:18 +0000' as timestamp), cast('Sun, 24 Apr 2016 20:14:18 +0000' as timestamp), 700349, 5, 'Crosscut Pilsner', 'wadewegner', 16, 0)," +
				"(300452847, 300452847, cast('Sat, 16 Apr 2016 19:46:07 +0000' as timestamp), cast('Sat, 16 Apr 2016 19:46:07 +0000' as timestamp), 1447344, 5, 'Hazelnut Coffee Porter', 'wadewegner', 16, 0)," +
				"(299624767, 299624767, cast('Fri, 15 Apr 2016 01:04:08 +0000' as timestamp), cast('Fri, 15 Apr 2016 01:04:08 +0000' as timestamp), 1477984, 5.8, 'Dragon Slayer IPA', 'wadewegner', 16, 0)," +
				"(297955955, 297955955, cast('Sat, 09 Apr 2016 21:49:47 +0000' as timestamp), cast('Sat, 09 Apr 2016 21:49:47 +0000' as timestamp), 725636, 6.5, 'Fist Pump', 'wadewegner', 16, 0)," +
				"(297931608, 297931608, cast('Sat, 09 Apr 2016 21:25:31 +0000' as timestamp), cast('Sat, 09 Apr 2016 21:25:31 +0000' as timestamp), 1471589, 7.1, 'Good Day IPA', 'wadewegner', 16, 0)," +
				"(297908415, 297908415, cast('Sat, 09 Apr 2016 21:02:01 +0000' as timestamp), cast('Sat, 09 Apr 2016 21:02:01 +0000' as timestamp), 785863, 6, 'Belgian Dubbel', 'wadewegner', 16, 0)," +
				"(296570686, 296570686, cast('Thu, 07 Apr 2016 00:33:15 +0000' as timestamp), cast('Thu, 07 Apr 2016 00:33:15 +0000' as timestamp), 961509, 6.9, 'Tropical Snow Dance', 'wadewegner', 16, 0)," +
				"(296570160, 296570160, cast('Thu, 07 Apr 2016 00:32:18 +0000' as timestamp), cast('Thu, 07 Apr 2016 00:32:18 +0000' as timestamp), 27160, 4.5, 'Bacchus', 'wadewegner', 16, 0)," +
				"(295665445, 295665445, cast('Sun, 03 Apr 2016 18:21:22 +0000' as timestamp), cast('Sun, 03 Apr 2016 18:21:22 +0000' as timestamp), 1346087, 5.1, 'Deez Nuts', 'wadewegner', 16, 0)," +
				"(295662092, 295662092, cast('Sun, 03 Apr 2016 18:14:02 +0000' as timestamp), cast('Sun, 03 Apr 2016 18:14:02 +0000' as timestamp), 1330390, 4.9, 'Berliner Weisse', 'wadewegner', 16, 0)," +
				"(294949496, 294949496, cast('Sat, 02 Apr 2016 17:23:14 +0000' as timestamp), cast('Sat, 02 Apr 2016 17:23:14 +0000' as timestamp), 46444, 5, 'UniBräu', 'wadewegner', 16, 0)," +
				"(290120847, 290120847, cast('Sun, 20 Mar 2016 02:34:44 +0000' as timestamp), cast('Sun, 20 Mar 2016 02:34:44 +0000' as timestamp), 928, 6.2, 'Dick''s IPA', 'wadewegner', 16, 0)," +
				"(283010830, 283010830, cast('Tue, 01 Mar 2016 01:54:49 +0000' as timestamp), cast('Tue, 01 Mar 2016 01:54:49 +0000' as timestamp), 1413845, 5.8, 'Pale Noir', 'wadewegner', 16, 0)," +
				"(280290272, 280290272, cast('Mon, 22 Feb 2016 02:26:20 +0000' as timestamp), cast('Mon, 22 Feb 2016 02:26:20 +0000' as timestamp), 593409, 4.8, '329 Lager', 'wadewegner', 16, 0)," +
				"(280149634, 280149634, cast('Sun, 21 Feb 2016 21:44:30 +0000' as timestamp), cast('Sun, 21 Feb 2016 21:44:30 +0000' as timestamp), 6962, 4.9, 'Roger''s Pilsner', 'wadewegner', 16, 0)," +
				"(278525039, 278525039, cast('Thu, 18 Feb 2016 04:55:09 +0000' as timestamp), cast('Thu, 18 Feb 2016 04:55:09 +0000' as timestamp), 3883, 4.74, 'Pabst Blue Ribbon', 'wadewegner', 16, 0)," +
				"(277829565, 277829565, cast('Mon, 15 Feb 2016 02:59:42 +0000' as timestamp), cast('Mon, 15 Feb 2016 02:59:42 +0000' as timestamp), 1436844, 6.3, 'The Oneness No. 5 Single Hop #07270', 'wadewegner', 16, 0)," +
				"(277825804, 277825804, cast('Mon, 15 Feb 2016 02:49:51 +0000' as timestamp), cast('Mon, 15 Feb 2016 02:49:51 +0000' as timestamp), 22090, 6.7, 'Alphadelic IPA', 'wadewegner', 16, 0)," +
				"(277823149, 277823149, cast('Mon, 15 Feb 2016 02:43:24 +0000' as timestamp), cast('Mon, 15 Feb 2016 02:43:24 +0000' as timestamp), 301381, 6.5, 'Citrus Mistress IPA', 'wadewegner', 16, 0)";

			postgres.insert_bulkBeerCheckins(
				checkinValues,
				function(result) {

					assert.equal(result.command, 'INSERT');
					assert.equal(result.rowCount, 0);
					done();

				});
		});

		it('should update the database with two test beer checkins', function(done) {

			var checkinValues = "(306806381, 306806381, cast('Tue, 03 May 2016 00:36:40 +0000' as timestamp), cast('Tue, 03 May 2016 00:36:40 +0000' as timestamp), 8812, 7, 'Lucille', 'wadewegner', 16, 0)," +
				"(234, 306803460, cast('Tue, 03 May 2016 00:29:22 +0000' as timestamp), cast('Tue, 03 May 2016 00:29:22 +0000' as timestamp), 8812, 7, 'Lucille', 'wadewegner', 16, 0)," +
				"(235, 306458962, cast('Sun, 01 May 2016 20:56:09 +0000' as timestamp), cast('Sun, 01 May 2016 20:56:09 +0000' as timestamp), 8812, 7, 'Lucille', 'wadewegner', 16, 0)"; 

			postgres.insert_bulkBeerCheckins(
				checkinValues,
				function(result) {

					assert.equal(result.command, 'INSERT');
					assert.equal(result.rowCount, 2);
					done();

				});
		});

		it('should create two checkins within the last six hours', function(done) {

			var checkinValues = "(236, 236, cast('" + date1 + "' as timestamp), cast('" + date1 + "' as timestamp), 8812, 7, 'Lucille', '" + uid + "', 16, 0)," +
				"(237, 237, cast('" + date2 + "' as timestamp), cast('" + date2 + "' as timestamp), 8812, 7, 'Lucille', '" + uid + "', 16, 0)"; 

			postgres.insert_bulkBeerCheckins(
				checkinValues,
				function(result) {

					assert.equal(result.command, 'INSERT');
					assert.equal(result.rowCount, 2);

					var now = moment().subtract(2, 'hours').subtract(1, 'minute').format();

					postgres.get_recentCheckins(
						uid,
						now,
						function(result) {

							assert.equal(result.command, 'SELECT');
							assert.equal(result.rowCount, 2);

							done();
						});
				});
		});

		it('should get all checkins from the last six hours and calculate the correct bac', function(done) {

			var now = moment().subtract(6, 'hours').format();

			postgres.get_recentCheckins(
				uid,
				now,
				function(result) {
					assert.equal(result.command, 'SELECT');
					assert.equal(result.rowCount, 2);

					// calculate the earliest drink
					assert.isDefined(result.rows);
					assert.isDefined(result.rows[0]);
					assert.isDefined(result.rows[1]);

					assert.equal(moment(result.rows[0].consumed_at__c).format(), date1);
					assert.equal(moment(result.rows[1].consumed_at__c).format(), date2);

					// check to see if the first drink was metabolized before the next drink
					var earliestDrinkAt = moment(result.rows[0].consumed_at__c).format();
					assert.equal(earliestDrinkAt, date1);

					var totalTimeInHours = moment().diff(earliestDrinkAt, 'hours');
					assert.equal(totalTimeInHours, 2);

					var count = result.rowCount;
					var beers = [];

					for (var i = 0; i < count; i++) {
						beers.push({
							abv: result.rows[i].beer_abv__c,
							ounces: (result.rows[i].beer_ounces__c / 100)
						});
					};

					var bac = require('bac');

					var weightInKgs = bac.poundsToKgs(weight);
					var waterPercentage = bac.waterPercentage(isMale);
					var totalBodyWaterPercentage = bac.totalBodyWaterPercentage(weightInKgs, waterPercentage);

					var bacTotalTheoreticalPeak = bac.theoreticalBacPeak(totalBodyWaterPercentage, beers);
					assert.equal(bacTotalTheoreticalPeak, 0.08906051517302685);

					var bacAfterElapsedTime = bac.bacAfterElapsedTime(bacTotalTheoreticalPeak, totalTimeInHours, metabolism);
					assert.equal(bacAfterElapsedTime, 0.06506051517302686);

					done();
				});
		});

		// it('should correctly calculate Wade\'s bac from a particular example', function(done) {

		// 	var thenDate = moment('2016-05-07T18:17:50-07:00').utc().format();
		// 	var queryDate = moment(thenDate).subtract(3.5, 'hours').utc().format();
		// 	var uid = 'wadewegner';

		// 	console.log(thenDate);
		// 	console.log(queryDate);

		// 	postgres.get_profile(
		// 		uid,
		// 		function(result) {
					
		// 			var weight = result.rows[0].weight__c;
		// 			var isMale = result.rows[0].male__c;

		// 			console.log('test');

		// 			postgres.get_recentCheckins(
		// 				uid,
		// 				queryDate,
		// 				function(result) {
		// 					assert.equal(result.command, 'SELECT');
		// 					// assert.equal(result.rowCount, 2);

		// 					// calculate the earliest drink
		// 					assert.isDefined(result.rows);
		// 					// assert.isDefined(result.rows[0]);
		// 					// assert.isDefined(result.rows[1]);

		// 					// check to see if the first drink was metabolized before the next drink
		// 					var earliestDrinkAt = moment(result.rows[0].consumed_at__c).utc().format();

		// 					console.log('earliestDrinkAt: ' + earliestDrinkAt);
		// 					console.log('thenDate: ' + thenDate);

		// 					var totalTimeInHours = moment(earliestDrinkAt).diff(moment(thenDate), 'minutes') / 60;
		// 					console.log(totalTimeInHours);

		// 					var count = result.rowCount;
		// 					var beers = [];

		// 					for (var i = 0; i < count; i++) {
		// 						beers.push({
		// 							abv: result.rows[i].beer_abv__c,
		// 							ounces: (result.rows[i].beer_ounces__c / 100)
		// 						});
		// 					};

		// 					var bac = require('bac.js');

		// 					var weightInKgs = bac.poundsToKgs(weight);
		// 					var waterPercentage = bac.waterPercentage(isMale);
		// 					var totalBodyWaterPercentage = bac.totalBodyWaterPercentage(weightInKgs, waterPercentage);

		// 					var bacTotalTheoreticalPeak = bac.theoreticalBacPeak(totalBodyWaterPercentage, beers);
		// 					console.log(bacTotalTheoreticalPeak);

		// 					var bacAfterElapsedTime = bac.bacAfterElapsedTime(bacTotalTheoreticalPeak, totalTimeInHours, metabolism);
		// 					console.log(bacAfterElapsedTime);

		// 					done();
		// 				});
		// 		});
		// });

		it('should delete the four test beer checkins', function(done) {

			postgres.delete_beerCheckin(
				234,
				function(result) {

					assert.equal(result.command, 'DELETE');
					assert.equal(result.rowCount, 1);

					postgres.delete_beerCheckin(
						235,
						function(result) {

							assert.equal(result.command, 'DELETE');
							assert.equal(result.rowCount, 1);

							postgres.delete_beerCheckin(
								236,
								function(result) {

									assert.equal(result.command, 'DELETE');
									assert.equal(result.rowCount, 1);

									postgres.delete_beerCheckin(
										237,
										function(result) {

											assert.equal(result.command, 'DELETE');
											assert.equal(result.rowCount, 1);

											done();
										});
								});
						});
				});
		});

		it('should delete the new test users access token', function(done) {

			postgres.delete_accessToken(
				uid,
				function(result) {

					assert.equal(result.command, 'DELETE');
					assert.equal(result.rowCount, 1);
					done();

				});

		});

		it('should delete the new test user', function(done) {

			postgres.delete_uptappduser(
				uid,
				function(result) {

					assert.equal(result.command, 'DELETE');
					assert.equal(result.rowCount, 1);
					done();

				});

		});
	});
});
