first_app.controller('orderConfirmController' , function($scope , $location ,$rootScope, $http ,$parse , $document ,$interpolate, $compile, $cookies, $uibModal, hideContainer ){
	    
    $scope.hideOrderConfirmContainer = true;
    $scope.hideEmailToolTip = true;
    $scope.$on("$routeChangeStart", function(event, next, current) {
          if(JSON.parse(JSON.stringify(next)).$$route.originalPath == '/trackOrder')
            sessionStorage.setItem("trackFromConfirm" , 'true');
     });
	
	var sendOrderConfirmEmail = function() {
		   $scope.orderConfirmHTML ="" ;
		   $http.defaults.headers.post["Content-Type"] = "application/json";	
           setTimeout(function(){ 	
		   $scope.orderConfirmHTML = document.querySelector('#orderConfirmContainer').innerHTML ;
		   $scope.orderConfirmHTML = $interpolate($scope.orderConfirmHTML)($scope) ;
			   
		   var mailOptions = {
			              to:'zvkfjbvaffkjgnaldfughalfnbsnjd@gmail.com',
			              subject: 'Order Confirmation',
			              html:  $scope.orderConfirmHTML 
			             }   
		         
				 $http.post('/orderConfirmEmail' , JSON.stringify(mailOptions) ).then(
						   function(response){
					        if(response.data == "Failed"){
					        	$scope.hideOrderConfirmContainer = false ;
					        	$scope.modalValidationText = "An error occurred. Please reload the page."
									  $uibModal.open({
									      animation: $scope.animationsEnabled,
									      templateUrl: 'modalValidation.html',
									      controller: 'ModalInstanceCtrl',
									      resolve: {
									    	  validationText : function () {
									    		  return $scope.modalValidationText ;
									    	  }
									      }
								});
					        }
					        else if (response.data == "401"){
					        	sessionStorage.setItem("sessionExpiredPage" , $location.path());
								sessionStorage.setItem("401", 'true');
								sessionStorage.removeItem("signedInCustomer");
								$location.path('/sessionExpired');
					        }
					        else {
					        	sessionStorage.setItem("confirmEmailSent" , 'true');
					        }
				           },
				           function(response){
				        	   $scope.modalValidationText = "An error occurred. Please reload the page."
									  $uibModal.open({
									      animation: $scope.animationsEnabled,
									      templateUrl: 'modalValidation.html',
									      controller: 'ModalInstanceCtrl',
									      resolve: {
									    	  validationText : function () {
									    		  return $scope.modalValidationText ;
									    	  }
									      }
								});   
				           });  
				    	
           });  		 
	   }

	
	
	var onLoad = function () {
		var emailSent = sessionStorage.getItem("confirmEmailSent");
		if(!emailSent){
			sendOrderConfirmEmail();	
		}		
	}
	
	
	
	$scope.trackOrder = function () {
		$location.path('/trackOrder'); 
	}
	
	var orderConfirmOnload = function() {
		 if(sessionStorage.getItem("signedInCustomer") != null){
			
			    $scope.storedCustomerDetails = JSON.parse(sessionStorage.getItem("signedInCustomer"));
			    $scope.customerFirstName  = $scope.storedCustomerDetails.FirstName;
			    
			    if(sessionStorage.getItem("orderPlacedTime") != null ){
					$scope.orderItems = JSON.parse(localStorage.getItem("orderItems"));	
					var localStorageOrderId = JSON.parse(sessionStorage.getItem("orderPlacedTime")).OrderId;
					$scope.order_Id = localStorageOrderId ;
					$scope.CustomerPaymentInfo = JSON.parse(localStorage.getItem("customerPaymentInfo"));
				    if($scope.CustomerPaymentInfo.paymentMethod == "Cash") {
					 $scope.CustomerPaymentInfo.paymentMethod = "Cash on Delivery" ;
				    }
				    $scope.grandTotal = localStorage.getItem("grandTotal");
					$scope.Shipping_Handling = 12.67 ;
				    $scope.Taxes = 1.89 ;
				    sessionStorage.removeItem('TxnCompleted');
				    onLoad();
			    }
			    else {
			    	/* When user had clicked on the browser forward button in the payment details page, without entering
			    	 *  payment information.
			    	 */
			    	$location.path('/payment');
			    }
		 }
		 else {
			  /* If transaction had completed but 'signed-in' session expired when order confirm page loads. */
			 sessionStorage.setItem("sessionExpiredPage" , "/order");
			 $location.path('/sessionExpired');
		 }
	}
	
    $scope.calcTotalOrderCost = function() {
    	var totalCost = 0.00 ;
    	if($scope.orderItems){
			for (var i = 0 ; i < $scope.orderItems.length ; i++ ) {
				totalCost = totalCost + $scope.orderItems[i].Cost ;
			}
			return totalCost.toFixed(2) ;
    	}
    }
    
    $scope.showEmailToolTip = function() {
    	if($scope.CustomerPaymentInfo.customerEmail.length > 30){
    		 $scope.hideEmailToolTip = false;
    	}
    }
    
	orderConfirmOnload();

});
