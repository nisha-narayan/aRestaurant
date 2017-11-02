first_app.controller('sessionExpiredController' , function($scope, $http, $location, $timeout, $rootScope, $uibModal, $cookies, AuthenticationService){

	$scope.hideSessionIncorrectLogin = true ;
    
	$scope.customer = {
			FirstName:'',
			LastName:'',
			Username:'',
			Password:'',
			Email:'',
			Address:{
				AddressLine1:'',
				AddressLine2:'',
				City:'',
				State:'',
				ZipCode:''
			},
		   BTreeCustId:''
	} ;
	
	$scope.customerLogin = {
			Username:'',
			Password:''
	}
			
	$scope.signInUser = function() {
		$scope.showLoadingIcon = true ;
		$scope.hideIncorrectUsername = true;
   	    $scope.hideIncorrectPassword = true;
		if($scope.customerLogin.Username == '' || $scope.customerLogin.Username == undefined || 
				   $scope.customerLogin.Password == '' || $scope.customerLogin.Password == undefined	) {
				   $scope.validationString = "Please enter your Username and Password.";
				   $uibModal.open({
					      animation: $scope.animationsEnabled,
					      templateUrl: 'signInValidation.html',
					      controller: 'signInModalInstanceCtrl',
					      resolve: {
					    	  validationString : function() {
					    		  return $scope.validationString ;
					    	  }
					      }
					    }); 
		$scope.showLoadingIcon = false ;
		}
		else {
		$http.defaults.headers.post["Content-Type"] = "application/json";
		$http.post('/verifyUser',JSON.stringify($scope.customerLogin)).then(
				
			       function(response){
			    	   if(response.data == "Failed"){ 
			    		   var incorrectCredentials = function() {
				        	   $scope.hideIncorrectUsername = false;
				        	   $scope.hideIncorrectPassword = false;
			    		   }
			    		   $timeout(incorrectCredentials,50);
			        	   $scope.showLoadingIcon = false ;
			           }else {
			           	   AuthenticationService.SetCredentials($scope.customerLogin.Username,$scope.customerLogin.Password);
			               var path = sessionStorage.getItem("sessionExpiredPage");
			        	   sessionStorage.setItem("signedInCustomer", JSON.stringify(response.data));
			        	   sessionStorage.removeItem("401");
			        	   $location.path(path).replace();
			           }
			       },
			       function(response){
			    	   $scope.validationString = "An error occurred. Please try again.";
					   $uibModal.open({
						      animation: $scope.animationsEnabled,
						      templateUrl: 'signInValidation.html',
						      controller: 'signInModalInstanceCtrl',
						      resolve: {
						    	  validationString : function() {
						    		  return $scope.validationString ;
						    	  }
						      }
						    }); 
					   $scope.showLoadingIcon = false ;
			       }
			       );
		}
	}
		
	$scope.backToMenu = function() {
		$location.path('/');
	}
	
	var onLoad = function() {
		
		var sessionExpiredPage = sessionStorage.getItem("sessionExpiredPage");
		var isUnAuthorized = sessionStorage.getItem("401");
		console.log('sessionExpiredPage ' + sessionExpiredPage)
		if(!isUnAuthorized){
			$scope.sessionInfo = "Session expired." ;
			if(sessionExpiredPage == "/order"){
				$scope.sessionInfo1 = "Your transaction completed. However your session has expired."
				$scope.sessionInfo2 = "Please sign-in again to proceed to order confirmation."
			}
			else if (sessionExpiredPage == "/cart"){
				$scope.sessionInfo1 = "Your session has expired."
			    $scope.sessionInfo2 = "Please sign-in again to navigate to your shopping cart."
			}
			else if (sessionExpiredPage == "/payment"){
				$scope.sessionInfo1 = "Your session has expired."
			    $scope.sessionInfo2 = "Please sign-in again to enter your payment information."
			}
			else if (sessionExpiredPage == "/modifyOrder"){
				$scope.sessionInfo1 = "Your session has expired."
			    $scope.sessionInfo2 = "Please sign-in again to continue to your menu selection."
			}
		}
		else {
			$scope.sessionInfo = "HTTP Error 401." ;
			$scope.sessionInfo1 = "The requested action requires user authentication."
			$scope.sessionInfo2 = "Please sign-in again to continue."
		}
	}
	
	onLoad();
});


first_app.controller('signInModalInstanceCtrl', function ($scope, $uibModalInstance , validationString) {
	
	   if(validationString.includes("An error occurred")){
		   $scope.btnPosition = {
					'top':'15px'
		   }
	   }
	   else {
		   $scope.btnPosition = {
					'top':'20px'
		   }
	   }
	   $scope.hideModal = function () {
		    $uibModalInstance.close();
	   }
	   $scope.modalValidationText = validationString;
});


