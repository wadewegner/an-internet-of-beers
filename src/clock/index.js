var sleep = require('sleep');
var requestify = require('requestify'); 
var async = require('async');

async.whilst(
    function() { return true; },
    function(callback) {

		var url = 'https://aninternetofbeers.com/trigger';
		requestify.get(url).then(function(response) {
			console.log('response from trigger: ' + response.getBody());
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