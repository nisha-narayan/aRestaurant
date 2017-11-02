var https = require('https');
var express = require('express');
var first_app = express();
var nodemailer = require('nodemailer');
var mongojs = require('mongojs');
var db = mongojs('AromaDB', [ 'Customer', 'PaymentDetails', 'OrderHistory', 'LastOrder' ]);
var crypto = require('crypto');
var bodyParser = require('body-parser');
var braintree = require('braintree');
var basicAuth = require('basic-auth');
var fs = require('fs');
var privateKey  = fs.readFileSync('key.pem', 'utf8');
var certificate = fs.readFileSync('cert.pem', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var httpsServer = https.createServer(credentials, first_app);



var auth =  function(request, response) {
	     
	     function unauthorized(response) {
		    return "401";
		  };
		  var user = basicAuth(request);
		  if (!user || !user.name || !user.pass) {
		    return unauthorized(response);
		  }
		  else {
				 var result = verifyUser(user.name, user.pass);
				 if(result == false){
					 return unauthorized(response);
				 } 
		  }
}



var verifyUser = function(username,password){
	var findUsername = {
		'Username' : username
	};
	db.Customer.find(findUsername, function(err, data) {
		if (data.length > 0) {
			var dbSalt = data[0].Password.salt;
			var dbPasswordHash = data[0].Password.passwordHash;
			var userPasswordData = sha512(password, dbSalt);
			var userPasswordHash = userPasswordData.passwordHash;
			if (userPasswordHash === dbPasswordHash) {
				return true ;
			} else {
				return false ;
			}
		} else {
			return false ;
		}
	});
}

var genRandomString = function(length) {
	return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0,
			length);
};

var sha512 = function(password, salt) {
	var hash = crypto.createHmac('sha512', salt);
	hash.update(password);
	var value = hash.digest('hex');
	return {
		salt : salt,
		passwordHash : value
	};
};

function saltHashPassword(userpassword) {
	var salt = genRandomString(16);
	var passwordData = sha512(userpassword, salt);
	/* The above will give passwordData.passwordHash and passwordData.salt */
	return passwordData;
}

// Using Sandbox credentials for testing purpose.
var gateway = braintree.connect({
	environment : braintree.Environment.Sandbox,
	merchantId : "3d4zp4b2w7cgk28p",
	publicKey : "g6dtbjcz84bnwm74",
	privateKey : "7358d1e9968b3e8b6aca6656bd3f3705"
});

var smtpTransport = nodemailer.createTransport("SMTP", 
	{
	service : "Gmail",
	auth : {
		user : 'fjnabjgbajfivbkafdvkjafnafgjan@gmail.com',
		pass : 'admin.root'
	},
	secure: true
});

first_app.use('/', express.static(__dirname + '/'));
first_app.use(bodyParser.json());

/* For parsing content-type : application/x-www-form-urlencoded
 * first_app.use(bodyParser.urlencoded({
	       extended: true
	   })); */


first_app.post('/verifyUser', function(request, response) {
	var jsonVerify = request.body;
	var findUsername = {
		'Username' : jsonVerify.Username
	};
	db.Customer.find(findUsername, function(err, data) {
		if (data.length > 0) {
			var dbSalt = data[0].Password.salt;
			var dbPasswordHash = data[0].Password.passwordHash;
			var userPasswordData = sha512(jsonVerify.Password, dbSalt);
			var userPasswordHash = userPasswordData.passwordHash;
			if (userPasswordHash === dbPasswordHash) {
				var responseJson = {
						'_id':data[0]._id,
						'Username' :data[0].Username,
						'FirstName':data[0].FirstName,
						'LastName':data[0].LastName,
						'Email':data[0].Email,
						'Address':data[0].Address,
						'BTreeCustId':data[0].BTreeCustId
				}
				response.write(JSON.stringify(responseJson));
				response.end();
			} else {
				response.write("Failed");
				response.end();
			}
		} else {
			response.write("Failed");
			response.end();
		}
	});
});

first_app.post('/adduser', function(request, response) {
	var jsonInsert = request.body;
	jsonInsert.Password = saltHashPassword(jsonInsert.Password);	
	db.Customer.insert(jsonInsert, function(err, data) {
		if (err == null) {
			response.write("Success");
			response.end();
		} else {
			response.write("F" + err.code);
			response.end();
		}
	});

});

first_app.post('/getUsername', function(request, response){
	var jsonFind = request.body;
	db.Customer.find(jsonFind, function(err,data){
		if(err == null && data.length > 0){
			response.write(data[0].Username);
			response.end();
		}else {
			response.write('Invalid User');
			response.end();
		}
	});
});

first_app.post('/updateNewUsername', function(request, response){
	if (auth(request, response) == "401"){
		response.write("401");
		response.end();
		return;
	}
     var newUser = request.body ;
     console.log(JSON.stringify(newUser));
     db.Customer.update({'Username':newUser.Username}, {$set:
    	 {
    	  'Username':newUser.newUsername
    	 }
     }, function(err, result){
    		if(result.nModified > 0){
    			response.write('Success');
    			response.end();
    		}
    		else {
    			response.write('Failed');
    			response.end();
    		}
     });	
});


first_app.post('/updateProfile', function(request, response){
		if (auth(request, response) == "401"){
			response.write("401");
			response.end();
			return;
		}
	
		var jsonUpdate  = request.body ;
		db.Customer.update({'Username' : jsonUpdate.Username}, {$set:
			{
			 'FirstName' :jsonUpdate.FirstName,
			 'LastName'  :jsonUpdate.LastName,
			 'Address'   : {
				          'AddressLine1' : jsonUpdate.Address.AddressLine1,
				          'AddressLine2' : jsonUpdate.Address.AddressLine2,
				          'City'  : jsonUpdate.Address.City,
				          'State' : jsonUpdate.Address.State,
				          'ZipCode' :jsonUpdate.Address.ZipCode
			             },
		     'Email'     : jsonUpdate.Email
			}	
		} , function(err, result){
			if(result.nModified > 0){
				response.write('Success');
				response.end();
			}
			else {
				response.write('Failed');
				response.end();
			}
		});	

});

first_app.post('/sendUsername', function(request, response) {
	var mailOptions = request.body;
	db.Customer.find({
		'Email' : mailOptions.to
	}, function(err, data) {
		console.log(data[0]);
		if (data.length > 0) {
			mailOptions = request.body;
			smtpTransport.sendMail(mailOptions, function(error, result) {
				if (error) {
					console.log(error);
					response.write('Email Error');
					response.end();
				} else {
					console.log('Message sent :' + result.message);
					response.write('Success');
					response.end();
				}
			});
		} else {
			response.write('Invalid User');
			response.end();
		}
	});
});


first_app.post('/passwordResetLink', function(request, response) {
	var mailOptions = request.body;
	db.Customer.find({
		'Email' : mailOptions.to
	}, function(err, data) {
		console.log(data[0]);
		if (data.length > 0) {
			mailOptions = request.body;
			smtpTransport.sendMail(mailOptions, function(error, result) {
				if (error) {
					console.log(error);
					response.write('Email Error');
					response.end();
				} else {
					console.log('Message sent :' + result.message);
					response.write('Success');
					response.end();
				}
			});
		} else {
			response.write('Invalid User');
			response.end();
		}
	});
});

first_app.post('/resetPassword', function(request, response) {
					var newPasswordJson = request.body;
					db.Customer.find({
									   'Email' : newPasswordJson.CustomerEmail
									 },
									function(err, data) {
										if (data.length > 0) {
											newPasswordJson.NewPassword = saltHashPassword(newPasswordJson.NewPassword);
											db.Customer.update(
															{
																'Email' : newPasswordJson.CustomerEmail
															},
															{
																$set : {
																	'Password' : newPasswordJson.NewPassword
																}
															},
															function(err,result) {
																if (result.nModified > 0) {
																	response.write('Success');
																	response.end();
																} else {
																	response.write('Failed');
																	response.end();
																}
															});
										} else {
											response.write('Invalid User');
											response.end();
										}
									});
				});


first_app.post('/addOrder', function(request, response) {
	if (auth(request, response) == "401"){
		response.write("401");
		response.end();
		return;
	}
	var mailSent = false;
	var jsonInsert = request.body;
	console.log(jsonInsert);
	db.OrderHistory.insert(jsonInsert, function(err, data) {
			   if(err == null && data != undefined){
					var order = {
						OrderId : data.OrderId,
						OrderTime : data.OrderTime
					}
					response.write(JSON.stringify(order));
					response.end();
				} else {
					response.write("Failed");
					response.end();
				}
	});	
});

first_app.post('/getOrderTime', function(request, response) {
	
	var jsonOrder = request.body;
	db.OrderHistory.find({
		OrderId : jsonOrder.OrderId
	}, function(err, data) {
		if (data.length > 0) {
			var order = {
				OrderId : data[0]._id,
				OrderTime : data[0].OrderTime
			}
			response.write(JSON.stringify(order));
			response.end();
		} else {
			response.write("Failed");
			response.end();
		}
	});
});

first_app.get('/getOrders', function(request, response) {
	db.OrderHistory.find({
		'OrderStatus' : 'Queue'
	}).sort({
		OrderTime : 1
	}, function(err, data) {
		if(err == null){
			response.write(JSON.stringify(data));
			response.end();
		}
		else {
			response.write('Failed');
			response.end();
		}
	});
});

first_app.post('/updateOrderStatus', function(request, response) {
	var jsonUpdate = request.body;
	db.OrderHistory.update({
		_id : mongojs.ObjectId(jsonUpdate.OrderId)
	}, {
		$set : {
			'OrderStatus' : jsonUpdate.OrderStatus.toString(),
			'StatusProgress' : jsonUpdate.OrderStatus.toString()
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

first_app.post('/updateDeliveryStatus', function(request, response) {
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
first_app.post('/updateStatusProgress', function(request, response) {
	var jsonUpdate = request.body;
	db.OrderHistory.update({
		_id : mongojs.ObjectId(jsonUpdate.OrderId)
	}, {
		$set : {
			'StatusProgress' : jsonUpdate.StatusProgress.toString()
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

first_app.post('/getOrderStatus', function(request, response) {
	var jsonOrder = request.body;
	db.OrderHistory.find({
		OrderId : jsonOrder.OrderId
	}, function(err, data) {
		if (data.length > 0) {
			response.write(JSON.stringify(data[0]));
			response.end();
		} else {
			response.write("Failed");
			response.end();
		}
	});
});

first_app.post('/orderConfirmEmail', function(request, response) {
	if (auth(request, response) == "401"){
		response.write("401");
		response.end();
		return;
	}
	var mailOptions = request.body;
	smtpTransport.sendMail(mailOptions, function(error, res) {
		if (error) {
			response.write("Failed");
			response.end();
		} else {
			response.write("Success");
			response.end();
		}
	});
});

/* For adding a delivery Person, only by the Administrator  */
first_app.post('/addDeliveryPerson', function(request, response) {
	var deliveryPerson = request.body;
	deliveryPerson.Password = saltHashPassword(deliveryPerson.Password);
	console.log(deliveryPerson);
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


first_app.get('/getPersonList' , function(request, response){
	db.DeliveryPerson.find({}, {'PersonId':1, 'UserName':1, 'Availability':1}, function(err, data){
		if(err == null && data.length > 0){
			response.write(JSON.stringify(data));
			response.end();
		}
		else{
			response.write('Failed');
			response.end();
		}
	});
	
});


first_app.post('/updateAvailability' , function(request, response){
	var jsonUpdate = request.body ;
	console.log(jsonUpdate);
	db.DeliveryPerson.update({_id:mongojs.ObjectId(jsonUpdate._id)}, {$set: {'Availability':jsonUpdate.Availability}},
			function(err , result){
			   if(result.nModified > 0){
				   response.write('Success');
				   response.end();
			   }
			   else {
				   response.write('Failed');
				   response.end();
			   }
	});
	
});

/* Only for the delivery person */
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
			response.write("Failed");
			response.end();
		}
	});
});

first_app.post('/DeliveryPerson', function(request, response) {
	var jsonUpdate = request.body;
	db.OrderHistory.update({
		_id : mongojs.ObjectId(jsonUpdate.OrderId)
	}, {
		$set : {
			'DeliveryPerson' : jsonUpdate.DeliveryPerson.toString()
		}
	}, function(err, result) {
		if (err == null &&  result.ok > 0 ) {
			response.write("Success");
			response.end();
		} else {
			response.write("Failed");
			response.end();
		}
	});
});



first_app.post('/createBTreeCustomer', function(request, response){
	if (auth(request, response) == "401"){
		response.write("401");
		response.end();
		return;
	}
	
	var jsonCustomer = request.body;
	gateway.customer.create({
		  firstName: jsonCustomer.FirstName,
		  lastName: jsonCustomer.LastName,
		  email: jsonCustomer.Email,
		  phone: jsonCustomer.Phone,
		}, function (err, result) {
		  if(err == null && result.success == true){
			  response.write(result.customer.id);
			  response.end();
		  }
		  else {
			  response.write('Failed');
			  response.end();
		  }
		});
	
});

first_app.post('/updateBTreeCustId', function(request,response){
	if (auth(request, response) == "401"){
		response.write("401");
		response.end();
		return;
	}
	var jsonUpdate = request.body ;
	db.Customer.update({
		'_id' : mongojs.ObjectId(jsonUpdate._id)
	}, {
		$set : {
			'BTreeCustId' : jsonUpdate.BTreeCustId
		}
	}, function(err, result) { 
		if(err == null && result.ok > 0){ // In case CustId was updated more than once.
			response.write("Success");
			response.end();
		} else {
			response.write("Failed");
			response.end();
		}
	});
});


first_app.get('/client_token', function(request, response) {
	if (auth(request, response) == "401"){
		response.write("401");
		response.end();
		return;
	}
	gateway.clientToken.generate({}, function(err, res) {
		if(res != null && res != undefined){
		 response.send(res.clientToken);
		}
		else {
	     response.send('Failed');
		}
	});
});


first_app.post('/addPymtMethod', function(request, response){
			if (auth(request, response) == "401"){
				response.write("401");
				response.end();
				return;
			}
			var jsonInsert = request.body ;
			db.StoredPayments.insert(jsonInsert, function(err, data){
				if(data != undefined && err == null ){
					response.write("Success");
					response.end();
				}
				else if (err.code == 11000){
					response.write('Exists');
					response.end();
				}
				else {
					response.write("Failed");
					response.end();
				}
			});	
});


first_app.post('/deletePaymentMethod', function(request, response){
	if (auth(request, response) == "401"){
		response.write("401");
		response.end();
		return;
	}
	var jsonRemove = request.body ;
	console.log(jsonRemove.Token);
	db.StoredPayments.remove({ "PaymentMethod.Token": jsonRemove.Token } , function(err, result){
				  if(err == null && result.n == 1){
						response.write("Success");
						response.end();
					}
					else {
						response.write("Failed");
						response.end();
					}
			  });
});


first_app.post('/storeInVault', function(request,response){
	if (auth(request, response) == "401"){
		response.write("401");
		response.end();
		return;
	}
	var jsonPymtMethod = request.body ;
	gateway.paymentMethod.create({
		  customerId:jsonPymtMethod.customerId,
		  paymentMethodNonce:jsonPymtMethod.paymentMethodNonce,
		  options : {
			  failOnDuplicatePaymentMethod:true
		  }
		}, function (err, result) { 
			if(result != null && result.success == true){
				var jsonResponse = {
						'Result' :'Success',
						'Token':result.paymentMethod.token
				}
				response.write(JSON.stringify(jsonResponse));
				response.end();
			}
			else if (result != null && result.message == 'Duplicate card exists in the vault.') {
				console.log(JSON.stringify(result));
				response.write('Exists');
				response.end();
			}
			else {
				response.write('Failed');
				response.end();
			}
			
		});
});

first_app.post('/deleteStoredPymt' , function(request, response){
	if (auth(request, response) == "401"){
		response.write("401");
		response.end();
		return;
	}
	var jsonStoredPymt = request.body ;
	gateway.paymentMethod.delete(jsonStoredPymt.Token, function (err) {
		if(err == null){
			response.write("Success");
			response.end();
		}else  {
			console.log(err.type);
			if(err.type == "notFoundError"){
			response.write("Not Found");
			response.end();
			}
			else {
				response.write("Failed");
				response.end();
			}
		}
	});	
});

first_app.post('/checkout', function(request, response) {
	if (auth(request, response) == "401"){
		response.write("401");
		response.end();
		return;
	}
	var paymentInfo = request.body;
	gateway.transaction.sale(paymentInfo, function(err, result) {
		if (err == null && result.success == true) {
			var jsonResult = {
					'Result':'Success',
					'TxnId' :result.transaction.id,
					'Last4' :result.transaction.creditCard.last4,
					'Token' :result.transaction.creditCard.token,
					'CardType':result.transaction.creditCard.cardType
			}
			console.log(JSON.stringify(jsonResult));
		    response.write(JSON.stringify(jsonResult));
			response.end();
		} else {
			var jsonResult = {
					'Result':'Failed'
			}
			response.send(JSON.stringify(jsonResult));
			response.end();
		}
	})
});

first_app.post('/getStoredPymts', function(request, response){
	if (auth(request, response) == "401"){
		response.write("401");
		response.end();
		return;
	}
	var jsonCustomer = request.body ;
	db.StoredPayments.find({'CustomerId':jsonCustomer.CustomerId} , function(err,data){
		if(err == null && data.length > 0){ 
			response.write(JSON.stringify(data));
			response.end();
		}
		else if(err == null && data.length == 0){ 
			response.write('Empty');
			response.end();
		}
		else {
			response.write('Failed');
			response.end();
		}
	})
});



httpsServer.listen(3000, function() {
	console.log('Server listening on port 3000');
});
