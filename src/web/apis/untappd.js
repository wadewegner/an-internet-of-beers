// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) { 
			return typeof args[number] != 'undefined'
			? args[number]
			: match
			;
		});
	};
}

module.exports = {
	checkins: function (userName, accessToken, result) {

		var url = 'https://api.untappd.com/v4/user/checkins/{0}?access_token={1}'.format(userName, accessToken);
		var requestify = require('requestify');

		requestify.get(url).then(function(response) {

			var checkins = response.getBody().response.checkins.items;

			result(checkins);
		});
	}
}