module.exports = {
	get: function (request, response) {

		response.render('pages/profile', {});

	},
	post: function (request, response) {
		console.log(request.body.phone);
		console.log(request.body.weight);
		console.log(request.body.gender);

		// var phone = request.body.phone;
		// response.send(phone);
	}
};