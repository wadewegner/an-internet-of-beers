var sleep = require('sleep');

while (true){ //let's create a endless loop

	console.log('top');
	var url = 'http://aninternetofbeers.com/trigger';
	var requestify = require('requestify');

	console.log(url);
	requestify.get(url).then(function(response) {
		console.log('back');
		console.log(response);
	});

    sleep.sleep (60);
}