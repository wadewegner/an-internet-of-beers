var assert = require('chai').assert;
var config = require('../src/web/config/config.js');

require('dotenv').load();

function checkString(value, description) {

	assert.isNotNull(value, description);
	assert.isDefined(value, description);
	assert.isString(value, description);
	assert.isAtLeast(value.length, 1, description);

}

describe('Setup', function() {

	before(function(done) {
		done();
	});

	describe('Config', function() {
		it('should return error when Config value is not setup correctly', function(done) {
			checkString(config.untappd.signin_url);

			done();
		});

		it('should return error when Environment values are not setup correctly', function(done) {

			checkString(process.env.DATABASE_URL, '');
			checkString(process.env.CLIENT_ID, '');
			checkString(process.env.CLIENT_SECRET, '');
			checkString(process.env.REDIRECT_URL, '');
			checkString(process.env.TRIGGER_URL, '');

			done();
		});
	});
});