deliveryStatus.controller('deliveryStatusController' , function($scope, $http, $location, $interval, $uibModal, modalClosed) {
	
	$scope.deliveryPerson = localStorage.getItem("deliveryPerson") ;
	$scope.deliveryPerson =  $scope.deliveryPerson.charAt(0).toUpperCase()+$scope.deliveryPerson.substring(1) ;
	$scope.deliveryList = "" ;
	$scope.selectedOrder = "" ;
	
	var getOrders = function() {
		var deliveryPerson = {
				'DeliveryPerson':localStorage.getItem("deliveryPerson") ,
				'OrderStatus':'OutForDelivery'
		}
		console.log(JSON.stringify(deliveryPerson));
		$http.post('/deliveryOrders' , JSON.stringify(deliveryPerson)).then(
		  function(response){
			  if(response.data != 'Failed'){
				  console.log(response.data);
				  $scope.deliveryList = response.data ;
			  }
			  else {
				  console.log(response.data);
				  $scope.deliveryList = "";
			  }
		  }	,
		  function(response){
			  console.log(response.data); 
		  }
		);
	}
	
	getOrders() ;
	$interval(getOrders, 30000);
	
	
	$scope.isItemDelivered = function(orderId) {
		if($scope.deliveryList.filter(function (obj) {
			return obj._id  == orderId ;
		})[0].OrderStatus == "Delivered" ) return orderId ;
		else return "" ;
	}
	
	
	$scope.updateDeliveryStatus = function(orderId) {
		var deliveryStatus = {
				OrderId : orderId ,
				OrderStatus:'Delivered',
				DeliveryTime: new Date() 
		}
		$http.post('/updateDeliveryStatus',JSON.stringify(deliveryStatus)).then(
			       function(response){
			    	   if(response.data != "Failed"){  
			    		   $scope.deliveryList.filter(function (obj) {
	        					return obj._id  == orderId ;
	        	            })[0].OrderStatus = 'Delivered' ; 
			    		   $scope.deliveryList.filter(function (obj) {
	        					return obj._id  == orderId ;
	        	            })[0].StatusProgress = 'Delivered' ;
			    		   $scope.deliveryList.filter(function (obj) {
	        					return obj._id  == orderId ;
	        	            })[0].DeliveryTime = deliveryStatus.DeliveryTime ;
			           }
			       },
			       function(response){
			    	   console.log("http post error");
			       }
			       );
	}
	
	$scope.showDeliveryAddress = function(orderId){
		$scope.selectedOrder = orderId ;
		$scope.customerAddress = $scope.deliveryList.filter(function (obj) {
			                       return obj._id  == orderId ;
                                 })[0].DeliveryAddress ;
        $scope.customerPhone = $scope.deliveryList.filter(function (obj) {
                                   return obj._id  == orderId ;
                                })[0].CustomerPhone ;
       
		$uibModal.open({
			animation: $scope.animationsEnabled,
			templateUrl: 'customerAddress.html',
			controller: 'addressModalInstanceCtrl',
			resolve: {
				customerAddress : function() {
					return $scope.customerAddress ;
				},
				customerPhone : function() {
					return $scope.customerPhone ;
				}
			}
		});
	}
	
	$scope.isOrderSelected = function(orderId) {
		if($scope.selectedOrder == orderId) return true;	
		else return "" ;
	}
	
	$scope.$on('modalClosing', function() {
		$scope.selectedOrder = "" ;
	}); 
	
	$scope.logOut = function() {
		$location.path('/');
	}	
});

deliveryStatus.controller('addressModalInstanceCtrl', function ($scope, $uibModalInstance , customerAddress, customerPhone, modalClosed) {
	$scope.hideModal = function () {
		$uibModalInstance.close();
		modalClosed();
	}
	$scope.customerAddress = customerAddress;
	$scope.customerPhone = customerPhone;
});

