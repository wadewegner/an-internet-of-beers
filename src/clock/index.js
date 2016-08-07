var sleep = require('sleep');
var requestify = require('requestify'); 
var async = require('async');

async.whilst(
    function() { return true; },
    function(callback) {

		var url = process.env.TRIGGER_URL;
		requestify.get(url)
		    .then(function(response) {
		        console.log('response from trigger: ' + response.getBody());
		    })
		    .fail(function(response) {
		        console.log('error from trigger: ' + response.getCode());
		    });

        setTimeout(function() {
            callback(null, true);
        }, 60000);
    },
    function (err, n) {
        // 5 seconds have passed, n = 5
        console.log('err: ' + err);
    }
);