var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var first_app = express();
var mongojs = require('mongojs');
var crypto = require('crypto');
var db = mongojs('AromaDB', [ 'Customer', 'PaymentDetails', 'OrderHistory', 'LastOrder' ]);
var httpServer = http.createServer(first_app);

first_app.use('/', express.static(__dirname + '/'));
first_app.use(bodyParser.json());

var genRandomString = function(length) {
	return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0,
			length);
};

function saltHashPassword(userpassword) {
	var salt = genRandomString(16);
	var passwordData = sha512(userpassword, salt);
	/* The above will give passwordData.passwordHash and passwordData.salt */
	return passwordData;
}


var sha512 = function(password, salt) {
	var hash = crypto.createHmac('sha512', salt);
	hash.update(password);
	var value = hash.digest('hex');
	return {
		salt : salt,
		passwordHash : value
	};
};

first_app.post('/verifyPerson', function(request, response) {

	var jsonVerify = request.body;
	var findUsername = {
		'Username' : jsonVerify.Username
	};
	db.DeliveryPerson.find(findUsername, function(err, data) {
		if (data.length > 0) {
			var dbSalt = data[0].Password.salt;
			var dbPasswordHash = data[0].Password.passwordHash;
			var userPasswordData = sha512(jsonVerify.Password, dbSalt);
			var userPasswordHash = userPasswordData.passwordHash;
			if (userPasswordHash === dbPasswordHash) {
				response.write('Success');
				response.end();
			} else {
				response.write("Failed");
				response.end();
			}
		} else {
			response.write("Not found");
			response.end();
		}
	});
});

first_app.post('/deliveryOrders', function(request, response) {
	var jsonFind = request.body;
	db.OrderHistory.find(jsonFind, function(err, data) {
		if (data.length > 0) {
			response.write(JSON.stringify(data));
			response.end();
		} else {
			response.write("Failed");
			response.end();
		}
	});

});


/* For adding a delivery Person, only by the Administrator  */
first_app.post('/addDeliveryPerson', function(request, response) {
	var deliveryPerson = request.body;
	deliveryPerson.Password = saltHashPassword(deliveryPerson.Password);
	db.DeliveryPerson.insert(deliveryPerson, function(err, data) {
		console.log("inserting into Database :" + data);
		if (err == null) {
			response.write("Success");
			response.end();
		} else {
			console.error(err.code);
			response.write("F" + err.code);
			response.end();
		}
	});
});

first_app.post('/updateDeliveryStatus', function(request, response) {
	console.log('inside update delivery status');
	var jsonUpdate = request.body;
	db.OrderHistory.update({
		_id : mongojs.ObjectId(jsonUpdate.OrderId)
	}, {
		$set : {
			'OrderStatus' : jsonUpdate.OrderStatus.toString(),
			'StatusProgress' : jsonUpdate.OrderStatus.toString(),
			'DeliveryTime' : jsonUpdate.DeliveryTime.toString()
		}
	}, function(err, result) {
		if (result.nModified > 0) {
			response.write("Success");
			response.end();
		} else {
			response.write("Failed");
			response.end();
		}
	});
});

httpServer.listen(4000, function() {
	console.log('Server listening on port 4000');
});
