first_app.controller('cartappController' , function($scope, $http , $location, $rootScope){
	
	$scope.CartItems = JSON.parse(localStorage.getItem("CartItems"));
	$scope.Shipping_Handling = 12.67 ;
    $scope.Taxes = 1.89 ;
		
	$scope.removeMenuItem = function removeMenuItem(menuItemName) {
		var removeIndex = $scope.CartItems.length;
		while( removeIndex-- ) {
		    if( $scope.CartItems[removeIndex].Name === menuItemName ) break;
		}		
		$scope.CartItems.splice(removeIndex,1);
	}
	
	$scope.calcTotalOrderCost = function () {
		var totalCost = 0.00 ;
		for (var i = 0 ; i < $scope.CartItems.length ; i++ ) {
			totalCost = totalCost + ($scope.CartItems[i].Cost[$scope.CartItems[i].SelectedSize] * $scope.CartItems[i].SelectedQuantity );
		}
		return totalCost.toFixed(2) ;
	}
	
	
	$scope.grandTotal = function () {
		orderTotal =  12.67 + 1.89 + parseInt($scope.calcTotalOrderCost())  ;
		return orderTotal.toFixed(2)
	} ;

    $scope.modifyOrder =  function () {
    	/* Removing and re-setting localStorage for cartItems, in case any menu item 
    	 * was removed from the shopping cart.
    	 */
    	localStorage.setItem("CartItems",JSON.stringify($scope.CartItems)) ;
    	$location.path('/modifyOrder');
    }
	
    $scope.confirmOrder =  function () {
    	/* Removing and re-setting localStorage for cartItems. In case the browser back button 
    	 * is clicked from the payment details page (to update cart), $scope.CartItems needs to have latest list.
    	 */
    	localStorage.setItem("CartItems",JSON.stringify($scope.CartItems)) ;
    	var cartItem ;
    	$scope.orderItems = [] ;
    	for(var i = 0 ; i < $scope.CartItems.length ; i++ ){
    		  cartItem = {
    				ItemName:$scope.CartItems[i].Name , 
    				Quantity:$scope.CartItems[i].SelectedQuantity , 
    				Cost:$scope.CartItems[i].Cost[$scope.CartItems[i].SelectedSize] * $scope.CartItems[i].SelectedQuantity 
    				}
    		$scope.orderItems.push(cartItem);
    	}
    	
    	localStorage.setItem("orderItems", JSON.stringify($scope.orderItems) );
    	localStorage.setItem("grandTotal", $scope.grandTotal());
    	$location.path('/payment');
    }
	
    var cartOnLoad = function () {
    	if(sessionStorage.getItem("signedInCustomer") != null){
			$scope.customerFirstName  = JSON.parse(sessionStorage.getItem("signedInCustomer")).FirstName;
		}
    }
	cartOnLoad() ;
	
	
});
