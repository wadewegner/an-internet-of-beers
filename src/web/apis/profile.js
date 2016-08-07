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

		postgres.update_profile(response.locals.userName, weight, isMale, phone(mobilePhone)[0], function(result) {

			var updated = true;

			response.render('pages/profile', {weight, isMale, mobilePhone, updated});
		});
	}
};