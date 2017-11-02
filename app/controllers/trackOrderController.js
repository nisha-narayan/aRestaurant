first_app.controller('trackOrderController' , function($scope , $uibModal, $route, $http, $location, $interval, AuthenticationService,$routeParams){

	$scope.orderId = "" ;
	$scope.orderPlacedTime = "";
	$scope.orderPlacedDate = "";
	$scope.Order = "" ;
	
	if(sessionStorage.getItem("signedInCustomer") != null){
		$scope.customerFirstName  = JSON.parse(sessionStorage.getItem("signedInCustomer")).FirstName;		
	}else {
		$scope.customerFirstName = 'Guest' ;
		$scope.hideTrackDownArrow = true ;
	}
	
	
	/* When the customer has navigated to the track order page from the Order confirmation page (previous) */ 
	var orderStatusPromise ;
	var trackOrderOnLoad = function() {
          /* Scenario #1 
	       * When the user has navigated from the order confirmation page and/or has refreshed the page.
	       */
		  /* Scenario #2
		   * When the user has refreshed the page, after tracking an order by entering an order#.
		   */
		  // Combining scenario 1 and 2 
		    if( sessionStorage.getItem("orderPlacedTime") != null && ( sessionStorage.getItem("trackFromConfirm") != null || sessionStorage.getItem("trackFromInput") != null )){
				var sessionStorageOrder = JSON.parse(sessionStorage.getItem("orderPlacedTime")) ;
				$scope.displayOrderId = sessionStorageOrder.OrderId ;
				$scope.orderId = sessionStorageOrder.OrderId ;
				$scope.orderPlacedTime = sessionStorageOrder.OrderTime ;
				$scope.orderPlacedDate = sessionStorageOrder.OrderDate ;
			 }
	        getOrderStatus();
	        checkCustomer(); // Checking if a different order was tracked by the same/different customer. 
	        $scope.stopOrderStatus();
	        orderStatusPromise = $interval(getOrderStatus, 10000);
	}
	
    $scope.stopOrderStatus = function() {
    	$interval.cancel(orderStatusPromise);
    }
	
	var checkCustomer = function () {
		if($scope.Order != ""){
			var orderCustomerId = $scope.Order.CustomerId.$id ;
			if(sessionStorage.getItem("signedInCustomer") != null){
			  var signedInCustomerId = JSON.parse(localStorage.getItem("signedInCustomer"))._id ;
			}else {
				var signedInCustomerId = 0 ;
			}
			if(orderCustomerId != signedInCustomerId){
				$scope.hideLogOut = true;
				$scope.customerFirstName = "Guest" ;
				localStorage.removeItem("signedInCustomer");
			}	
		}
	}

	
	var clearOrderStatus = function() {
		$route.reload();
	}
	
    var getOrderStatus = function() {
    	
       var order = {
	    			"OrderId":$scope.orderId 
	    	       }
       if($scope.orderId != "" || $scope.orderId != null || $scope.orderId != undefined){
			$http.defaults.headers.post["Content-Type"] = "application/json";
			$http.post('/getOrderStatus',JSON.stringify(order)).then(
				       function(response){
				    	   if(response.data != "Failed"){  
				    		   $scope.Order = response.data ;  
				    		      if($scope.Order.StatusProgress == "") {
				    		    	 orderPlaced()  ;
							      }
							      if($scope.Order.StatusProgress == "Preparation") {
							    	  preparation()  ;
							      }
							      else if($scope.Order.StatusProgress == "QualityCheck"){
							    	  qualityCheck() ; 
							      }
							      else if($scope.Order.OrderStatus == "OutForDelivery"){
							    	  outForDelivery() ;
							      } 
							      else if($scope.Order.OrderStatus == "Delivered"){
							    	  delivered() ;
							      } 
				           }
				       },
				       function(response){
				    	   console.log("http post error");
				       });
       }
    }
    
  
	var orderPlaced = function() {
		$scope.focusOrderPlaced = {
				'z-index':'3',
				background:'#000000'
		}	
		trackOrderPlaced();
	}
	
	var trackOrderPlaced = function() {
		//Tracking phase container
		 $scope.showOrderPlaced = true ;	
		// Tracking bar label
		 $scope.showOrderPlacedLabel = true ;
		// Tracking skewed grey bars
		 $scope.showOrderPlacedGreyBar = true;
		// Tracking bar
		 $scope.showBarOrderPlaced = true;
		// Tracking bar divider
		 $scope.showBarDivider1 = true ;
	}
	
	var preparation = function() {
		$scope.focusPreparation = {
		'z-index':'3',
		background:'#000000'	
		}
		$scope.focusOrderPlaced = {
				'z-index':'1'
		}
		trackOrderPlaced(); // In case the customer refreshed the page in this step.
		trackPreparation();
	}
	
	var trackPreparation = function() {
		//Tracking phase container
		$scope.showPreparation = true ;	
		// Tracking bar label
		 $scope.showPreparationLabel = true ;
		// Tracking skewed grey bars
		 $scope.showPreparationGreyBar = true;
		// Tracking bar
		 $scope.showBarPreparation = true;
		// Tracking bar divider
		 $scope.showBarDivider2 = true ;
	}
	
	var qualityCheck = function() {
		$scope.focusQualityCheck = {
		'z-index':'3',
		background:'#000000'	
         } 
		$scope.focusPreparation = {
				'z-index':'1'
		}	
		trackOrderPlaced(); // In case the customer refreshed the page in this step.
		trackPreparation(); // In case the customer refreshed the page in this step.
		trackQualityCheck();
	}
	
	var trackQualityCheck = function() {
		//Tracking phase container
		$scope.showQualityCheck = true ;	
		// Tracking bar label
		 $scope.showQualityCheckLabel = true ;
		// Tracking skewed grey bars
		 $scope.showQualityCheckGreyBar = true;
		// Tracking bar
		 $scope.showBarQualityCheck = true;
		// Tracking bar divider
		 $scope.showBarDivider3 = true ;
	}
	
	var outForDelivery = function() {
		$scope.focusOutForDelivery = {
		 'z-index':'3',
		 background:'#000000'		
          }
		$scope.focusQualityCheck = {
				'z-index':'1'	
		  } 
		trackOrderPlaced(); // In case the customer refreshed the page in this step.
		trackPreparation(); // In case the customer refreshed the page in this step.
		trackQualityCheck(); // In case the customer refreshed the page in this step.
		trackOutForDelivery();
	}
    
	var trackOutForDelivery = function() {
		//Tracking phase container
		$scope.showOutForDelivery = true ;	
		// Tracking bar label
		 $scope.showOutForDeliveryLabel = true ;
		// Tracking skewed grey bars
		 $scope.showOutForDeliveryGreyBar = true;
		// Tracking bar
		 $scope.showBarOutForDelivery = true;
		// Tracking bar divider
		 $scope.showBarDivider4 = true ;
	}

	
	var delivered = function () {
		$scope.barDelivered = {
				background:'#004d00' 
			
		}
		$scope.focusOutForDelivery = {
				 'z-index':'1'		
		}
		trackOrderPlaced(); // In case the customer refreshed the page in this step.
		trackPreparation(); // In case the customer refreshed the page in this step.
		trackQualityCheck(); // In case the customer refreshed the page in this step.
		trackOutForDelivery(); // In case the customer refreshed the page in this step.
		$scope.showBarDelivered = true;
		$scope.showOrderDeliveredLabel = true;
		
		var localDateTime = new Date($scope.Order.DeliveryTime);
		var time_hr = addZero(localDateTime.getHours()) ;
		var time_min = addZero(localDateTime.getMinutes()) ;
		var time_sec = addZero(localDateTime.getSeconds()) ;
		
		var AM_PM  = "" ;
		if(time_hr > 11){ 
			AM_PM = "PM" ;	
		}
		else { AM_PM = "AM" ;
		}
		
		$scope.deliveryTime =  time_hr + ":" + time_min + ":" + time_sec + " " + AM_PM;			
	}
	
	/* When the customer has navigated to the track order page, from
	 * a link in the order confirmation email. 
	 */
	var addZero = function(i) {
	    if (i < 10) {
	        i = "0" + i;
	    }
	    return i;
	}
	
	var getOrderTime = function(trackOrderId) {
		var order = {
				"OrderId":trackOrderId,
				"OrderTime":""
		}
		$http.defaults.headers.post["Content-Type"] = "application/json";
		$http.post('/getOrderTime',JSON.stringify(order)).then(
			       function(response){
			    	   if(response.data != "Failed"){  
			    		   $scope.Order = response.data ;     
							var localDateTime = new Date($scope.Order.OrderTime);
							var time_hr = addZero(localDateTime.getHours()) ;
							var time_min = addZero(localDateTime.getMinutes()) ;
							var time_sec = addZero(localDateTime.getSeconds()) ;
							
							var AM_PM  = "" ;
							if(time_hr > 11){ 
								AM_PM = "PM" ;	
							}
							else { AM_PM = "AM" ;
							}
							
							
							order.OrderTime = time_hr + ":" + time_min + ":" + time_sec + " " + AM_PM;
							order.OrderDate = (localDateTime.getMonth()+1)+"/"+localDateTime.getDate()+"/"+localDateTime.getFullYear();
							sessionStorage.removeItem("orderPlacedTime");
							sessionStorage.setItem("orderPlacedTime" , JSON.stringify(order));
							console.log(sessionStorage.getItem("orderPlacedTime"));
							clearOrderStatus();
			           }
			    	   else {
			        	   $scope.modalValidationText = "An error occurred. Please verify order number and try again."
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
			       },
			       function(response){
		        	   $scope.modalValidationText = "A server error occurred. Please try again."
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
		
		
	}
	
	/* When the customer is redirected to the track order page, from a link in the 
	 * order confirmation email. Customer enters order number and clicks on 'Track' button.
	 */
	
	$scope.trackOrder = function(trackOrderId) {
		sessionStorage.setItem("trackFromInput", true);
		getOrderTime(trackOrderId);
		
	}
	
	trackOrderOnLoad() ;
	
});

