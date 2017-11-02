deliveryStatus.controller('signInController' , function($scope,$http,$location) {
	
	/* Adding a delivery person, only by the administrator */
	$scope.addPerson = function() {
		var deliveryPerson = {
				'PersonId': 7,
				'UserName':$scope.username,
		        'Password':$scope.password,
		        'Availability': 'Yes'
		}
		console.log(JSON.stringify(deliveryPerson));
		$http.defaults.headers.post["Content-Type"] = "application/json";
		$http.post('/addDeliveryPerson',JSON.stringify(deliveryPerson)).then(
			       function(response){
			    	   console.log("success");
			       }, 
			       function(response){
			    	   console.log("error");
			       }
		           );
	}
	
	
	$scope.signIn = function() {
		var deliveryPerson = {
				'UserName':$scope.username,
		        'Password':$scope.password
		}
		$http.defaults.headers.post["Content-Type"] = "application/json";
		$http.post('/verifyPerson',JSON.stringify(deliveryPerson)).then(
			       function(response){
			    	   localStorage.setItem("deliveryPerson", $scope.username);
			    	   $location.path('/deliveryStatus');
			       }, 
			       function(response){
			    	   console.log("error");
			       }
		           );
	}
	
	
});