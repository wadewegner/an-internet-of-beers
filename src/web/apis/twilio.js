var twilio = require('twilio');

module.exports = {
	sendTxt: function (accountSid, authToken, toPhoneNumber, fromPhoneNumber, message, result) {

		var client = new twilio.RestClient(accountSid, authToken);
		 
		client.messages.create({
		    body: message,
		    to: toPhoneNumber,
		    from: fromPhoneNumber
		}, function(err, message) {
			if (err) {
		        console.log(err.message);
		    };

		    result(message);
		});
	}
}