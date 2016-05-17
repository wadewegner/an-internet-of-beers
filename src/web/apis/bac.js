
module.exports = {
	poundsToKgs: function (pounds) {

		return pounds / 2.2046;

	},
	waterPercentage: function(isMale) {

		var maleWaterPercentage = .58;
		var femaleWaterPercentage = .49;

		var waterPercentage = femaleWaterPercentage;
		if (isMale) {
			waterPercentage = maleWaterPercentage;
		}

		return waterPercentage;

	},
	totalBodyWaterPercentage: function(weightInKgs, waterPercentage) {

		return weightInKgs * waterPercentage;

	},
	theoreticalBacPeak: function(totalBodyWaterPercentage, beers) {

		var bacTotalTheoreticalPeak = 0;
		var count = Object.keys(beers).length;

		for (var i = 0; i < count; i++) {
			
			var abv = beers[i].abv;
			var ounces = beers[i].ounces;
			var bacTheoreticalPeak = this.theoreticalBacPeakPerDrink(totalBodyWaterPercentage, ounces, abv)

			bacTotalTheoreticalPeak += bacTheoreticalPeak;
		}

		return bacTotalTheoreticalPeak;

	},
	theoreticalBacPeakPerDrink: function (totalBodyWaterPercentage, ounces, abv) {

		var weightInGramsOf1OzAlcohol = 23.36;
		var gramsAlcoholPerMlOfWater = weightInGramsOf1OzAlcohol / (totalBodyWaterPercentage * 1000);
		var ouncesOfAlcohol = ounces * abv;
		var waterPercentageInBlood = .806;
		var alcoholConcentrationInBlood = gramsAlcoholPerMlOfWater * waterPercentageInBlood;
		var alcoholConcentrationInBloodPer100Ml = alcoholConcentrationInBlood * 100;
		var bacTheoreticalPeak = ouncesOfAlcohol * alcoholConcentrationInBloodPer100Ml;

		return bacTheoreticalPeak;
	},
	bacAfterElapsedTime: function (bacTotalTheoreticalPeak, totalTimeInHours, metabolismRate) {

		// .02 - above average
		// .017 - average
		// .012 - below average
		
		if (metabolismRate < .012 || metabolismRate > .02) {
			throw new Error('metabolism rate out of bounds');
		}

		var bacAfterElapsedTime = bacTotalTheoreticalPeak - (metabolismRate * totalTimeInHours);
		return bacAfterElapsedTime;

	}
};