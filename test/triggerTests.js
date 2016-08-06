var assert = require('chai').assert;
var config = require('../src/web/config/config.js');
var trigger = require('../src/web/apis/trigger.js');

require('dotenv').load();

describe('Trigger', function() {

	this.timeout(15000);

	before(function(done) {
		done();
	});

	describe('New Checkins', function() {
		it('should check for new checkins and insert into database', function(done) {

			trigger.insertNewCheckins(function(results) {
				done();
			});
		});

		it('should process new checkins and send updated BAC values', function(done) {

			trigger.processNewCheckins(function(results) {
				done();
			});
		});
	});
});
