
deliveryPerson.controller('deliveryPersonController' , function($scope, $http, $location, $timeout, $uibModal){
	
	$scope.personList = [];

	var getPersonList = function() {
		$http.get('/getPersonList').then(function(response){
				$scope.personList = response.data ;		
			} ,
			function(response){
				console.log('error');
				console.log(response.data);
			});
	}
	
	getPersonList();
	
	$scope.isAvailable = function(personId) {
		if($scope.personList.filter(function (obj) {
			return obj._id  == personId ;
		})[0].Availability == "Yes" ) return personId ;
		else return "" ;
	}
		
	$scope.isNotAvailable = function(personId) {
		if($scope.personList.filter(function (obj) {
			return obj._id  == personId ;
		})[0].Availability == "No" ) return personId ;
		else return "" ;
	}
	

		
	$scope.availabilityUpdate = function(personId, availability){
		
		$scope.availability = {
				_id : personId ,
				Availability: availability
		}
	
		$http.post('/updateAvailability',JSON.stringify($scope.availability)).then(
			       function(response){
			    	   if(response.data != "Failed"){  
			        	   $scope.personList.filter(function (obj) {
			        					return obj._id  == personId ;
			        	   })[0].Availability = availability ;  	 
			           }
			    	   else {
			    		   console.log(response.data);
			    	   }
			       },
			       function(response){
			    	   console.log("http post error");
			       }
			       );
	}
	
	
	
});


deliveryPerson.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance , validationString) {
	$scope.hideModal = function () {
		$uibModalInstance.close();
	}
	$scope.modalValidationText = validationString;
});


