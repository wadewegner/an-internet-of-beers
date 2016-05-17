var assert = require('chai').assert;
var expect = require('chai').expect;

var bac = require('../src/web/apis/bac.js');

describe('BAC', function() {

	before(function(done) {
		done();
	});

	describe('Helpers', function() {
		it('should convert 128 lbs pounds to ~58 kgs', function(done) {

			var weightInPounds = 128;
			var weightInKgs = bac.poundsToKgs(weightInPounds);

			assert.equal(weightInPounds, 128);
			assert.equal(weightInKgs, 58.06041912365055);

			done();
		});

		it('should accurately accurately calculate a 128 lbs males body water percentage', function(done) {

			var weightInPounds = 128;
			var isMale = true;

			var weightInKgs = bac.poundsToKgs(weightInPounds);
			var waterPercentage = bac.waterPercentage(isMale);
			var totalBodyWaterPercentage = bac.totalBodyWaterPercentage(weightInKgs, waterPercentage);

			assert.equal(totalBodyWaterPercentage, 33.67504309171731);

			done();
		});

		it('should accurately accurately calculate a 128 lbs females body water percentage', function(done) {

			var weightInPounds = 128;
			var isMale = false;

			var weightInKgs = bac.poundsToKgs(weightInPounds);
			var waterPercentage = bac.waterPercentage(isMale);
			var totalBodyWaterPercentage = bac.totalBodyWaterPercentage(weightInKgs, waterPercentage);

			assert.equal(totalBodyWaterPercentage, 28.449605370588767);

			done();
		});
	});

	describe('Exceptions', function() {

		it('should throw exception when out of bounds', function(done) {

			expect(function () {
				bac.bacAfterElapsedTime(.2, 2, 0.01);
			}).to.throw('metabolism rate out of bounds');

			expect(function () {
				bac.bacAfterElapsedTime(.2, 2, 0.021);
			}).to.throw('metabolism rate out of bounds');

			done();
		});
	}),

	describe('Calculations', function() {

		it('should accurately calculate one beer for a 128 lbs male over an hour', function(done) {

			var weightInPounds = 128;
			var totalTimeInHours = 1;
			var isMale = true;
			var metabolism = .012;

			var beers = [];
			beers.push({
				abv: 0.045,
				ounces: 12
			});

			var weightInKgs = bac.poundsToKgs(weightInPounds);
			var waterPercentage = bac.waterPercentage(isMale);
			var totalBodyWaterPercentage = bac.totalBodyWaterPercentage(weightInKgs, waterPercentage);

			var bacTotalTheoreticalPeak = bac.theoreticalBacPeak(totalBodyWaterPercentage, beers);
			assert.equal(bacTotalTheoreticalPeak, 0.030192111031034485);
			
			var bacAfterElapsedTime = bac.bacAfterElapsedTime(bacTotalTheoreticalPeak, totalTimeInHours, metabolism);
			assert.equal(bacAfterElapsedTime, 0.018192111031034484);

			done();
		});

		it('should accurately calculate two beers for a 128 lbs male over an hour', function(done) {

			var weightInPounds = 128;
			var totalTimeInHours = 1;
			var isMale = true;
			var metabolism = .012;

			var beers = [];
			beers.push({
				abv: 0.045,
				ounces: 12
			});
			beers.push({
				abv: 0.045,
				ounces: 12
			});

			var weightInKgs = bac.poundsToKgs(weightInPounds);
			var waterPercentage = bac.waterPercentage(isMale);
			var totalBodyWaterPercentage = bac.totalBodyWaterPercentage(weightInKgs, waterPercentage);

			var bacTotalTheoreticalPeak = bac.theoreticalBacPeak(totalBodyWaterPercentage, beers);
			assert.equal(bacTotalTheoreticalPeak, 0.06038422206206897);
			
			var bacAfterElapsedTime = bac.bacAfterElapsedTime(bacTotalTheoreticalPeak, totalTimeInHours, metabolism);
			assert.equal(bacAfterElapsedTime, 0.048384222062068966);

			done();
		});

		it('should accurately calculate two beers for a 128 lbs male over two hours', function(done) {

			var weightInPounds = 128;
			var totalTimeInHours = 2;
			var isMale = true;
			var metabolism = .012;

			var beers = [];
			beers.push({
				abv: 0.045,
				ounces: 12
			});
			beers.push({
				abv: 0.045,
				ounces: 12
			});

			var weightInKgs = bac.poundsToKgs(weightInPounds);
			var waterPercentage = bac.waterPercentage(isMale);
			var totalBodyWaterPercentage = bac.totalBodyWaterPercentage(weightInKgs, waterPercentage);

			var bacTotalTheoreticalPeak = bac.theoreticalBacPeak(totalBodyWaterPercentage, beers);
			assert.equal(bacTotalTheoreticalPeak, 0.06038422206206897);
			
			var bacAfterElapsedTime = bac.bacAfterElapsedTime(bacTotalTheoreticalPeak, totalTimeInHours, metabolism);
			assert.equal(bacAfterElapsedTime, 0.03638422206206897);

			done();
		});

		it('should accurately calculate one beer for a 128 lbs female over an hour', function(done) {

			var weightInPounds = 128;
			var totalTimeInHours = 1;
			var isMale = false;
			var metabolism = .012;

			var beers = [];
			beers.push({
				abv: 0.045,
				ounces: 12
			});

			var weightInKgs = bac.poundsToKgs(weightInPounds);
			var waterPercentage = bac.waterPercentage(isMale);
			var totalBodyWaterPercentage = bac.totalBodyWaterPercentage(weightInKgs, waterPercentage);

			var bacTotalTheoreticalPeak = bac.theoreticalBacPeak(totalBodyWaterPercentage, beers);
			assert.equal(bacTotalTheoreticalPeak, 0.035737600812244905);
			
			var bacAfterElapsedTime = bac.bacAfterElapsedTime(bacTotalTheoreticalPeak, totalTimeInHours, metabolism);
			assert.equal(bacAfterElapsedTime, 0.023737600812244904);

			done();
		});

		it('should accurately calculate two beers for a 128 lbs female over an hour', function(done) {

			var weightInPounds = 128;
			var totalTimeInHours = 1;
			var isMale = false;
			var metabolism = .012;

			var beers = [];
			beers.push({
				abv: 0.045,
				ounces: 12
			});
			beers.push({
				abv: 0.045,
				ounces: 12
			});

			var weightInKgs = bac.poundsToKgs(weightInPounds);
			var waterPercentage = bac.waterPercentage(isMale);
			var totalBodyWaterPercentage = bac.totalBodyWaterPercentage(weightInKgs, waterPercentage);

			var bacTotalTheoreticalPeak = bac.theoreticalBacPeak(totalBodyWaterPercentage, beers);
			assert.equal(bacTotalTheoreticalPeak, 0.07147520162448981);
			
			var bacAfterElapsedTime = bac.bacAfterElapsedTime(bacTotalTheoreticalPeak, totalTimeInHours, metabolism);
			assert.equal(bacAfterElapsedTime, 0.05947520162448981);

			done();
		});

		it('should accurately calculate two beers for a 128 lbs female over two hours', function(done) {

			var weightInPounds = 128;
			var totalTimeInHours = 2;
			var isMale = false;
			var metabolism = .012;

			var beers = [];
			beers.push({
				abv: 0.045,
				ounces: 12
			});
			beers.push({
				abv: 0.045,
				ounces: 12
			});

			var weightInKgs = bac.poundsToKgs(weightInPounds);
			var waterPercentage = bac.waterPercentage(isMale);
			var totalBodyWaterPercentage = bac.totalBodyWaterPercentage(weightInKgs, waterPercentage);

			var bacTotalTheoreticalPeak = bac.theoreticalBacPeak(totalBodyWaterPercentage, beers);
			assert.equal(bacTotalTheoreticalPeak, 0.07147520162448981);
			
			var bacAfterElapsedTime = bac.bacAfterElapsedTime(bacTotalTheoreticalPeak, totalTimeInHours, metabolism);
			assert.equal(bacAfterElapsedTime, 0.04747520162448981);

			done();
		});

		it('should accurately calculate three big beers for a 180 lbs male over two hours', function(done) {

			var weightInPounds = 180;
			var totalTimeInHours = 2;
			var isMale = true;
			var metabolism = .012;

			var beers = [];
			beers.push({
				abv: 0.07,
				ounces: 12
			});
			beers.push({
				abv: 0.07,
				ounces: 12
			});
			beers.push({
				abv: 0.07,
				ounces: 12
			});

			var weightInKgs = bac.poundsToKgs(weightInPounds);
			var waterPercentage = bac.waterPercentage(isMale);
			var totalBodyWaterPercentage = bac.totalBodyWaterPercentage(weightInKgs, waterPercentage);

			var bacTotalTheoreticalPeak = bac.theoreticalBacPeak(totalBodyWaterPercentage, beers);
			assert.equal(bacTotalTheoreticalPeak, 0.10019307956965522);
			
			var bacAfterElapsedTime = bac.bacAfterElapsedTime(bacTotalTheoreticalPeak, totalTimeInHours, metabolism);
			assert.equal(bacAfterElapsedTime, 0.07619307956965521);

			done();
		});
	});
});
