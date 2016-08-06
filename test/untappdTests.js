var assert = require('chai').assert;
var untappd = require('../src/web/apis/untappd.js');

require('dotenv').load();

function checkString(value, description) {

	assert.isNotNull(value, description);
	assert.isDefined(value, description);
	assert.isString(value, description);
	assert.isAtLeast(value.length, 1, description);

}

describe('Untappd', function() {

	this.timeout(5000);

	before(function(done) {
		done();
	});

	describe('Setup', function() {
		it('should find Untappd environment values are available for test', function(done) {

			// +1 224-588-3104
			var untappdToken = process.env.UNTAPPD_TOKEN;
			var untappdUsername = process.env.UNTAPPD_USERNAME;

			checkString(untappdToken, '');
			checkString(untappdUsername, '');

			done();
		});
	});

	describe('Tests', function() {
		it('should hit the Untappd API and get the appropriate responses', function(done) {

			var untappdToken = process.env.UNTAPPD_TOKEN;
			var untappdUsername = process.env.UNTAPPD_USERNAME;

			untappd.checkins(untappdUsername, untappdToken, function(result) {

				//TODO: write tests

				done();
			});

		});
	});
});