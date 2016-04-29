var pg = require('pg');

module.exports = {
	get: function (request, response) {

		code = request.query.code;

		var url = 'https://untappd.com/oauth/authorize/?client_id={0}&client_secret={1}&response_type=code&redirect_url={2}&code={3}'.format(
			process.env.CLIENT_ID, 
			process.env.CLIENT_SECRET, 
			process.env.REDIRECT_URL, 
			code);

		var requestify = require('requestify');

		requestify.get(url).then(function(response2) {

			var accessToken = response2.getBody().response.access_token;

//			response.cookie('accessToken', accessToken);

			console.log(accessToken);

			var userInfoUrl = 'https://api.untappd.com/v4/user/info?access_token={0}'.format(accessToken);

			requestify.get(userInfoUrl).then(function(response3) {

				var uid = response3.getBody().response.user.user_name;
				var id = response3.getBody().response.user.id;
				var user_name = response3.getBody().response.user.user_name;
				var first_name = response3.getBody().response.user.first_name;
				var last_name = response3.getBody().response.user.last_name;
				var user_avatar = response3.getBody().response.user.user_avatar;
				var user_avatar_hd = response3.getBody().response.user.user_avatar_hd;
				var user_cover_photo = response3.getBody().response.user.user_cover_photo;
				var user_cover_photo_offset = response3.getBody().response.user.user_cover_photo_offset;
				var location = response3.getBody().response.user.location;
				var bio = response3.getBody().response.user.bio;
				var url = response3.getBody().response.user.url;
				var untappd_url = response3.getBody().response.user.untappd_url;
				var twitter = response3.getBody().response.user.contact.twitter;
				var foursquare = response3.getBody().response.user.contact.foursquare;
				var facebook = response3.getBody().response.user.contact.facebook;
				var email_address = response3.getBody().response.user.settings.email_address;

				setCookies=[];
				setCookies.push('accessToken=' + accessToken);
				setCookies.push('firstName=' + first_name);
				setCookies.push('lastName=' + last_name);
				setCookies.push('userName=' + user_name);
				response.setHeader("Set-Cookie", setCookies);

				console.log('db url: ' + process.env.DATABASE_URL);

				pg.defaults.ssl = true;
				console.log('1');
				pg.connect(process.env.DATABASE_URL, function(err, client) {
									console.log('2');
					if (err) throw err;

					var query = "INSERT INTO salesforce.untappduser__c (" +
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

					console.log(query);

					client.query(query, function(err, result) {
						if (err) throw err;

						console.log(result);
					});

					var query = "INSERT INTO accesstokens (token, uid) SELECT '" + accessToken + "','" + uid + 
					"' WHERE NOT EXISTS ( SELECT token FROM accesstokens WHERE uid = '" + uid + "')";

					client.query(query, function(err, result) {
						if (err) throw err;

						console.log(result);
					});

					response.redirect('/profile');
				});
			});
		});
	}
};