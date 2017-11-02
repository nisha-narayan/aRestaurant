
orderStatus.controller('orderStatusController' , function($scope, $http , $interval, $location, $timeout, $uibModal, $route){
	$scope.OrderList = [];  
	$scope.deliveryPersonList = ["Assign"];
	var orderStatusOnload = function () {
		$http.defaults.headers.post["Content-Type"] = "application/json";
		$http.get('/getOrders').then(
			function(response){
				if(response.data != 'Failed'){
				  $scope.OrderList = response.data ;	
				}
				else {
					$uibModal.open({
					      animation: $scope.animationsEnabled,
					      templateUrl: 'statusValidation.html',
					      controller: 'modalInstanceCtrl',
					      resolve: {
					    	  validationString : function() {
					    		  return "An error occurred. Please re-load."
					    	  }
					      }
					    }); 
				}
			} ,
			function(response){
				$uibModal.open({
				      animation: $scope.animationsEnabled,
				      templateUrl: 'statusValidation.html',
				      controller: 'modalInstanceCtrl',
				      resolve: {
				    	  validationString : function() {
				    		  return "An error occurred. Please re-load."
				    	  }
				      }
				    }); 
			});
	}
	
	orderStatusOnload();
	$interval(orderStatusOnload, 30000);
	
	
	var deliveryPersonList = function() {
		$http.get('/getPersonList').then(
		function(response){
			if(response.data != 'Failed'){
				var deliveryPersonList = response.data ;
			       deliveryPersonList = deliveryPersonList.filter(function (obj) {
					return obj.Availability  == "Yes" ;
				});
				for(var i = 0 ; i < deliveryPersonList.length ; i++ ){
					$scope.deliveryPersonList[i+1] = deliveryPersonList[i].UserName ;
				}
				$route.reload();
			}
			else{
				$uibModal.open({
				      animation: $scope.animationsEnabled,
				      templateUrl: 'statusValidation.html',
				      controller: 'modalInstanceCtrl',
				      resolve: {
				    	  validationString : function() {
				    		  return "An error occurred. Please re-load."
				    	  }
				      }
				    }); 
			}
		},
		function(response){
			$uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'statusValidation.html',
			      controller: 'modalInstanceCtrl',
			      resolve: {
			    	  validationString : function() {
			    		  return "An error occurred. Please re-load."
			    	  }
			      }
			    }); 
		});
	}
	
	deliveryPersonList();
	$interval(deliveryPersonList, 5000);
	
	
	$scope.isItemInQueue = function(orderId) {
		if($scope.OrderList.filter(function (obj) {
			return obj._id  == orderId ;
		})[0].StatusProgress == "" ) return orderId ;
		else return "" ;
	}
		
	$scope.isItemInPreparation = function(orderId) {
		if($scope.OrderList.filter(function (obj) {
			return obj._id  == orderId ;
		})[0].StatusProgress == "Preparation" ) return orderId ;
		else return "" ;
	}
	
	$scope.isItemInQualityCheck = function(orderId) {
		if($scope.OrderList.filter(function (obj) {
			return obj._id  == orderId ;
		})[0].StatusProgress == "QualityCheck" ) return orderId ;
		else return "" ;
	}
	
	$scope.isItemInDelivery = function(orderId) {
		if($scope.OrderList.filter(function (obj) {
			return obj._id  == orderId ;
		})[0].OrderStatus == "OutForDelivery" ) return orderId ;
		else return "" ;
	}
		
	$scope.orderStatusUpdate = function(orderId, statusProgress){
		
		$scope.orderStatus = {
				OrderId : orderId ,
				StatusProgress:statusProgress
		}
		$http.post('/updateStatusProgress',JSON.stringify($scope.orderStatus)).then(
			       function(response){
			    	   if(response.data != "Failed"){  
			        	   $scope.OrderList.filter(function (obj) {
			        					return obj._id  == orderId ;
			        	   })[0].StatusProgress = statusProgress ;  	 
			           }
			    	   else {
							$uibModal.open({
							      animation: $scope.animationsEnabled,
							      templateUrl: 'statusValidation.html',
							      controller: 'modalInstanceCtrl',
							      resolve: {
							    	  validationString : function() {
							    		  return "An error occurred. Please try again."
							    	  }
							      }
							    }); 
			    	   }
			       },
			       function(response){
						$uibModal.open({
						      animation: $scope.animationsEnabled,
						      templateUrl: 'statusValidation.html',
						      controller: 'modalInstanceCtrl',
						      resolve: {
						    	  validationString : function() {
						    		  return "An error occurred. Please try again."
						    	  }
						      }
						    }); 
			       }
			       );
	}

	
	
	
	$scope.orderStatusDelivery = function(orderId) {	
		$scope.orderStatus = {
				OrderId : orderId ,
				OrderStatus:'OutForDelivery'
		}

		$http.post('/updateOrderStatus',JSON.stringify($scope.orderStatus)).then(
			       function(response){
			    	   if(response.data != "Failed"){  
			    		   $scope.OrderList.filter(function (obj) {
	        					return obj._id  == orderId ;
	        	            })[0].OrderStatus = 'OutForDelivery' ; 
			    		   $scope.OrderList.filter(function (obj) {
	        					return obj._id  == orderId ;
	        	            })[0].StatusProgress = 'OutForDelivery' ;
			           }
			    	   else{
							$uibModal.open({
							      animation: $scope.animationsEnabled,
							      templateUrl: 'statusValidation.html',
							      controller: 'modalInstanceCtrl',
							      resolve: {
							    	  validationString : function() {
							    		  return "An error occurred. Please try again."
							    	  }
							      }
							    }); 
			    	   }
			       },
			       function(response){
						$uibModal.open({
						      animation: $scope.animationsEnabled,
						      templateUrl: 'statusValidation.html',
						      controller: 'modalInstanceCtrl',
						      resolve: {
						    	  validationString : function() {
						    		  return "An error occurred. Please try again."
						    	  }
						      }
						    }); 
			       }
			       );
	}

	
	$scope.disableOutForDelivery = function(orderId, deliveryPerson) {
		/* In case database was updated and page refreshed,before 'out for delivery' was selected.
		   Preventing direct update to 'out for delivery' from 'queue' or 'preparation'. */
		if($scope.OrderList.filter(function (obj) {
	        				 return obj._id  == orderId ;
	        	            })[0].DeliveryPerson == "" || deliveryPerson == 'Assign' ||
	       $scope.OrderList.filter(function (obj) {
		        				 return obj._id  == orderId ;
		        	            })[0].StatusProgress == ""  ||
		   $scope.OrderList.filter(function (obj) {
			        				 return obj._id  == orderId ;
			        	            })[0].StatusProgress == "Preparation"
		){  
		   return true ; 
		}
		else {
		   return false ;
		}
	}
	
	// Preventing status update from 'OutForDelivery' or 'QualityCheck' to 'Preparation'.
	$scope.disablePreparation = function(orderId) {
		if($scope.OrderList.filter(function (obj) {
			 return obj._id  == orderId ;
           })[0].StatusProgress == 'OutForDelivery' || $scope.OrderList.filter(function (obj) {
			 return obj._id  == orderId ;
           })[0].StatusProgress ==  'QualityCheck' ){  
		return true ; 
		}
		else {
		return false ;
		}
	}
	
	// Preventing status update from 'Queue' or 'OutForDelivery' to 'QualityCheck'.
	$scope.disableQualityCheck = function(orderId) {
		if($scope.OrderList.filter(function (obj) {
			 return obj._id  == orderId ;
           })[0].StatusProgress == 'OutForDelivery' || $scope.OrderList.filter(function (obj) {
			 return obj._id  == orderId ;
           })[0].StatusProgress ==  "" ){  
		return true ; 
		}
		else {
		return false ;
		}
	}
		
	$scope.assignDeliveryPerson = function(deliveryOrderId,deliveryPerson) {
		var deliveryOrder = {
				'OrderId':deliveryOrderId,
				'DeliveryPerson':deliveryPerson
		}	
	
		$http.post('/DeliveryPerson' , JSON.stringify(deliveryOrder)).then(
				function(response){
				  if(response.data == "Success"){
					 $scope.OrderList.filter(function (obj) {
	 					return obj._id  == deliveryOrderId ;
	 	            })[0].DeliveryPerson = deliveryPerson ; 
				  }
				  else {
					  console.log(response.data);
					  $scope.validationString = "An error occurred.Please try again.";
					  $uibModal.open({
							animation: $scope.animationsEnabled,
							templateUrl: 'deliveryValidation.html',
							controller: 'ModalInstanceCtrl',
							resolve: {
								validationString : function() {
									return $scope.validationString ;
								}
							}
						});
				  }
				},
				function(response){
					$scope.validationString = "An error occurred.Please try again.";
					  $uibModal.open({
							animation: $scope.animationsEnabled,
							templateUrl: 'deliveryValidation.html',
							controller: 'ModalInstanceCtrl',
							resolve: {
								validationString : function() {
									return $scope.validationString ;
								}
							}
						});
				}
		);
	}
	
});


orderStatus.controller('modalInstanceCtrl', function ($scope, $uibModalInstance , validationString) {
	$scope.hideModal = function () {
		$uibModalInstance.close();
	}
	$scope.modalValidationText = validationString;
});


