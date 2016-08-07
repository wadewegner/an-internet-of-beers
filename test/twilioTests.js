var assert = require('chai').assert;
var twilio = require('../src/web/apis/twilioHelper.js');

require('dotenv').load();

function checkString(value, description) {

	assert.isNotNull(value, description);
	assert.isDefined(value, description);
	assert.isString(value, description);
	assert.isAtLeast(value.length, 1, description);

}

describe('Twilio', function() {

	before(function(done) {
		done();
	});

	describe('Setup', function() {
		it('should find Twilio environment values are available for test', function(done) {

			// +1 224-588-3104
			var accountSid = process.env.TWILIO_SID_TEST;
			var authToken = process.env.TWILIO_TOKEN_TEST;

			checkString(accountSid, '');
			checkString(authToken, '');

			done();
		});
	});

	describe('Tests', function() {
		it('should hit the Twilio API and get the appropriate responses', function(done) {

			var accountSid = process.env.TWILIO_SID_TEST;
			var authToken = process.env.TWILIO_TOKEN_TEST;
			var fromPhoneNumber = process.env.TWILIO_PHONENUMBER_TEST;
			var toPhoneNumber = '+17196610040';
			var message = 'test';

			twilio.sendTxt(accountSid, authToken, toPhoneNumber, fromPhoneNumber, message, function(result) {

				assert.equal(result.to, toPhoneNumber);
				assert.equal(result.from, fromPhoneNumber);
				assert.equal(result.status, 'queued');
				assert.equal(result.price, null);
				assert.equal(result.error_message, null);

				done();
			});

		});
	});
});