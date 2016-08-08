var pg = require('pg');

function execute (sql, showLogs, result) {

	pg.defaults.ssl = true;

	pg.connect(process.env.DATABASE_URL, function(err, client, done) {

		var handleError = function(err) {
			// no error occurred, continue with the request
			if(!err) return false;

			// An error occurred, remove the client from the connection pool.
			// A truthy value passed to done will remove the connection from the pool
			// instead of simply returning it to be reused.
			// In this case, if we have successfully received a client (truthy)
			// then it will be removed from the pool.
			if(client){
				done(client);
			}

			if (showLogs) {
				console.log('  sql err: ' + err);
			}

			return true;
		};

		// handle an error from the connection
		if(handleError(err)) return;

		if (showLogs) {
			console.log('  sql: ' + sql)
		}

		var query = client.query(sql, function(err, queryResult) {

			// handle an error from the query
			if(handleError(err)) return;
			if (showLogs) {
				console.log('  sql result: ' + result)
			}
			result(queryResult);
			done();

		});
	});
}

module.exports = {

	update_processCheckins: function(id, result) {
		var sql = "UPDATE salesforce.untappdbeercheckins__c " +
			"SET processed__c = true " +
			"WHERE id = '" + id + "'"

		execute(sql, false, function(executeResult) {
			result(executeResult);
		});
	},

	get_userfromphone: function (phone, result) {

		var sql = "SELECT user_name__c FROM salesforce.untappduser__c WHERE " + 
			"mobile_phone__c = '" + phone + "'";

		execute(sql, false, function(executeResult) {
			result(executeResult);
		});

	},

	get_unprocessedCheckins: function (result) {
		var sql = "SELECT id, bid__c, consumed_at__c, beer_abv__c, beer_ounces__c, user_name__c FROM salesforce.untappdbeercheckins__c WHERE " + 
			"processed__c is null OR processed__c = false ORDER BY consumed_at__c ASC";

		execute(sql, false, function(executeResult) {
			result(executeResult);
		});
	},

	get_recentCheckins: function (userName, since_datetime, result) {

		var sql = "SELECT consumed_at__c AT TIME ZONE 'UTC' as consumed_at__c, beer_abv__c, beer_ounces__c FROM salesforce.untappdbeercheckins__c WHERE " + 
			"consumed_at__c > '" + since_datetime + "' AND " +
			"user_name__c = '" + userName + "' ORDER BY consumed_at__c ASC";

		execute(sql, false, function(executeResult) {
			result(executeResult);
		});
	},

	get_lastCheckin: function (userName, result) {

		var sql = "SELECT id, consumed_at__c AT TIME ZONE 'UTC' as consumed_at__c, beer_abv__c, beer_ounces__c FROM salesforce.untappdbeercheckins__c WHERE " + 
			"user_name__c = '" + userName + "' ORDER BY consumed_at__c DESC limit 1";

		execute(sql, false, function(executeResult) {
			result(executeResult);
		});
	},

	insert_sms: function (fromState, fromCity, fromZip, fromCountry, fromPhone, body, result) {

		var sql = "INSERT INTO salesforce.incomingsms__c (from_state__c, from_city__c, from_zip__c, from_country__c, from_phone__c, body__c) VALUES " +
			"('" + 
			fromState + "', '" + 
			fromCity + "', '" + 
			fromZip + "', '" + 
			fromCountry + "', '" + 
			fromPhone + "', '" + 
			body + 
			"')";

		execute(sql, false, function(executeResult) {
			result(executeResult);
		});	
	},

	insert_sentMessage: function (userName, message, result) {

		var sql = "INSERT INTO salesforce.sentmessages__c (username__c, message__c) VALUES " +
			"('" + userName + "', '" + message + "')";

		execute(sql, false, function(executeResult) {
			result(executeResult);
		});	
	},

	insert_beerCheckin: function(beerAbv, userName, ounces, consumedAt, result) {

		var sql = "INSERT INTO salesforce.untappdbeercheckins__c (beer_abv__c, user_name__c, beer_ounces__c, consumed_at__c) VALUES " +
			"(" + beerAbv + ",'" + userName + "'," + ounces + ",'" + consumedAt + "')";

		execute(sql, false, function(executeResult) {
			result(executeResult);
		});	
	},

	insert_bulkBeerCheckins: function (checkinValues, result) {

		var sql = "with data(id, checkin_id__c, created_at__c, consumed_at__c, bid__c, beer_abv__c, name, user_name__c, beer_ounces__c, stomach_fullness__c) as (values " + checkinValues +
			") insert into salesforce.untappdbeercheckins__c (id, checkin_id__c, created_at__c, consumed_at__c, bid__c, beer_abv__c, name, user_name__c, beer_ounces__c, stomach_fullness__c)" +
			"select d.id, d.checkin_id__c, d.created_at__c, d.consumed_at__c, d.bid__c, d.beer_abv__c, d.name, d.user_name__c, d.beer_ounces__c, d.stomach_fullness__c " +
			"from data d where not exists (select 1 from salesforce.untappdbeercheckins__c u2 where u2.id = d.id)";

		execute(sql, false, function(executeResult) {
			result(executeResult);
		});	
	},

	delete_beerCheckin: function(id, result) {

		var sql = "DELETE from salesforce.untappdbeercheckins__c WHERE id = " + id;

		execute(sql, false, function(executeResult) {
			result(executeResult);
		});	
	},

	get_tokens: function (result) {

		var sql = "SELECT id, token, uid FROM accesstokens";

		execute(sql, false, function(executeResult) {
			result(executeResult);
		});	

	},

	get_profile: function (userName, result) {

		var sql = "SELECT weight__c, male__c, mobile_phone__c " +
			"FROM salesforce.untappduser__c " +
			"WHERE user_name__c = '" + userName + "'"

		execute(sql, false, function(executeResult) {
			result(executeResult);
		});	
	},

	update_profile: function (userName, weight, isMale, mobilePhone, result) {

		var sql = "UPDATE salesforce.untappduser__c " +
			"SET weight__c = " + weight + "," +
			"    male__c = " + isMale + "," +
			"    mobile_phone__c = '" + mobilePhone + "' " + 
			"WHERE user_name__c = '" + userName + "'"

		execute(sql, false, function(executeResult) {
			result(executeResult);
		});	
	},

	update_checkin: function (id, ounces, result) {


		var sql = "UPDATE salesforce.untappdbeercheckins__c " +
			"SET beer_ounces__c = " + ounces + "," +
			"    processed__c = false " +
			"WHERE id = " + id

		execute(sql, false, function(executeResult) {
			result(executeResult);
		});	

	},

	insert_accessToken: function(accessToken, uid, result) {

		var sql = "INSERT INTO accesstokens (token, uid) SELECT '" + accessToken + "','" + uid + 
		"' WHERE NOT EXISTS ( SELECT token FROM accesstokens WHERE uid = '" + uid + "')";

		execute(sql, false, function(executeResult) {
			result(executeResult);
		});	
	},

	delete_accessToken: function(uid, result) {

		var sql = "DELETE from accesstokens WHERE uid = '" + uid + "'";

		execute(sql, false, function(executeResult) {
			result(executeResult);
		});	
	},

	insert_uptappduser: function (
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
		result) {

		var sql = "INSERT INTO salesforce.untappduser__c (" +
			"uid__c," +
			"user_name__c," +
			"facebook__c," +
			"bio__c," +
			"location__c," +
			"email_address__c," +
			"user_avatar_hd__c," +
			"user_avatar__c," +
			"first_name__c," +
			"foursquare__c," +
			"untappd_url__c," +
			"last_name__c," +
			"twitter__c," +
			"url__c," +
			"user_cover_photo__c," +
			"id__c," +
			"name) " +
			"SELECT '" +
			uid + "','" +
			user_name + "','" +
			facebook + "','" +
			bio + "','" +
			location + "','" +
			email_address + "','" +
			user_avatar_hd + "','" +
			user_avatar + "','" +
			first_name + "','" +
			foursquare + "','" +
			untappd_url + "','" +
			last_name + "','" +
			twitter + "','" +
			url + "','" +
			user_cover_photo + "','" +
			id + "','" +
			id + "' WHERE NOT EXISTS ( SELECT id__c FROM salesforce.untappduser__c WHERE id__c = '" + id + "' )";

		execute(sql, false, function(executeResult) {
			result(executeResult);
		});	
	},

	delete_uptappduser: function(
		uid,
		result) {

		var sql = "DELETE FROM salesforce.untappduser__c " +
			"WHERE uid__c = '" + uid + "'";

		execute(sql, false, function(executeResult) {
			result(executeResult);
		});	
	}

};