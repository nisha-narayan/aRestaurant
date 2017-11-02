
first_app.controller('menuappController' , function($scope, $http , $uibModal, $rootScope, $cookies, $location , $window,hideContainer, AuthenticationService ){

	$scope.MenuItemList = [];
	$scope.CartItemList = [];
	$scope.selectedSize = null ;
	$scope.hideContinue = true ;
	$scope.hideHiFirstName = true;
    $scope.hideDownArrow = true ;
	$scope.itemHighlighted = "" ;

	$scope.menuItem = function(menuItemName) {
		if($scope.isItemAvailable(menuItemName)){
			return  {
				'background':'#a6a6a6',
			    'text-align': 'center',
			    'height': '20px',
			    'color' : '#404040'
			  }
		}else {
			return{
			  'text-align': 'center',
			  'height': '20px'
			}
		}
	}
	
	$http.get('Menu.json').success(function(data){
		$scope.MenuItemList = data ;
		
	});

	$scope.searchFilter = function (menuItems) {
		var keyword = new RegExp($scope.nameFilter, 'i');
		return  keyword.test(menuItems.Name) ;
	}
	
	$scope.segmentAllFilter = function (menuItems) {
		var keyword = new RegExp("All") ;
		return keyword.test(menuItems.Segment) ;   
	} 

	$scope.segmentBreakfastFilter = function (menuItems) {
		var keyword = new RegExp("breakfast") ;
		return keyword.test(menuItems.Segment) ;   
	}

	$scope.segmentLunchFilter = function (menuItems) {
		var keyword = new RegExp("Lunch") ;
		return keyword.test(menuItems.Segment) ;   
	}

	$scope.segmentDinnerFilter = function (menuItems) {
		var keyword = new RegExp("Dinner") ;
		return keyword.test(menuItems.Segment) ;   
	}

	$scope.selectedMenuSignIn = function (signInOrContinue) {	
		$scope.showLoadingIcon = true ;
		var CartItemListDetails = [] ;
		var QuantityZeroFlag = false ;
		if($scope.CartItemList.length > 0){
			for( var i = 0; i < $scope.CartItemList.length ; i++){
				CartItemListDetails[i] = $scope.MenuItemList.filter(function (obj) {
					return obj.Name  == $scope.CartItemList[i]; 
				})[0];	
				if( CartItemListDetails[i].SelectedQuantity == 0){
					QuantityZeroFlag = true ;
				}
			}

			if(QuantityZeroFlag) {
				$scope.validationString = "Quantity must be > 0 for selected menu items.";
				$scope.hideMenuContainer = false;
				$uibModal.open({
					animation: $scope.animationsEnabled,
					templateUrl: 'menuValidation.html',
					controller: 'menuModalInstanceCtrl',
					resolve: {
						validationString : function() {
							return $scope.validationString ;
						}
					}
				});
				$scope.showLoadingIcon = false ;	
			}
			else {
				localStorage.setItem("CartItems" ,JSON.stringify(CartItemListDetails));
				if (signInOrContinue == 'signIn'){
					$location.path('/signIn');
				}
				else {
					$location.path('/cart');   
				}
			}
		} else {
			$scope.validationString = "You must select at least one menu item to continue." ;
			$scope.hideMenuContainer = false ;
			$uibModal.open({
				animation: $scope.animationsEnabled,
				templateUrl: 'menuValidation.html',
				controller: 'menuModalInstanceCtrl',
				resolve: {
					validationString : function() {
						return $scope.validationString ;
					}
				}
			});
			$scope.showLoadingIcon = false ;
		}
		
	}


	$scope.updateSelectedSize = function (menuItemSize,menuItemName) {
		$scope.MenuItemList.filter(function (obj) {
			return obj.Name  == menuItemName ;
		})[0].SelectedSize = menuItemSize ;
	}

	$scope.updateSelectedQuantity = function(menuItemQuantity,menuItemName){
		$scope.MenuItemList.filter(function (obj) {
			return obj.Name  == menuItemName ;
		})[0].SelectedQuantity = menuItemQuantity ;
	}


	$scope.toggleItemSelection = function toggleItemSelection(menuItemName){

		var itemId  = $scope.CartItemList.indexOf(menuItemName);		
		// item is already in cartItem list; 
		// checked menu item was clicked again.	(check-box is not checked)
		if(itemId > -1) {
		//removing the selected item from checked menu item list
			$scope.CartItemList.splice(itemId , 1); 
		}
		// item is not in the selected list;
		// item is newly selected (check-box is checked)
		else {
			$scope.CartItemList.push(menuItemName);

		}

	}



	var menuOnload = function () {	
				
		if($location.path() == '/modifyOrder') {
           $scope.hideMenuContainer = true ;
			if(sessionStorage.getItem("signedInCustomer") != null){
				$scope.customerFirstName  = JSON.parse(sessionStorage.getItem("signedInCustomer")).FirstName;	
			       $scope.hideLogOut = false ;
				   $scope.hideContinueGuest = true ;
				   $scope.hideSignIn = true ;
				   $scope.hideContinue = false;
				   $scope.hideHiFirstName = false;	
				   $scope.hideDownArrow = false ;
			}
			if(localStorage.getItem("CartItems") != null){
				$scope.storedCartItems = JSON.parse(localStorage.getItem("CartItems"));
                // Highlighting pre-selected menu Items.
				for(var i = 0 ; i < $scope.storedCartItems.length ; i++){
					$scope.CartItemList[i] = $scope.storedCartItems[i].Name ;
				} 
			}
		}
		else if ($location.path() ==  '/loggedOut'){
			 $scope.hideMenuContainer = true ;
			 AuthenticationService.ClearCredentials();
		}
		/* when the browser back button is clicked on the shopping bag page (instead of 'Modify' button) or Sign-In page
		 * by a signed-in customer or Guest. */
		else if ($location.path() ==  '/') {  	
			if(sessionStorage.getItem("signedInCustomer") != null){
				$location.path('/modifyOrder');
			}else {
				if(sessionStorage.getItem('signInPageVisited') == 'true'){
					//Setting authorization header to 'visitor', since user has not signed-in yet.
					AuthenticationService.SetVisitor();
					$location.path('/modifyOrder');	
				}else{
					$uibModal.open({
						animation: $scope.animationsEnabled,
						templateUrl: 'menuWelcome.html',
						controller: 'welcomeModalInstanceCtrl'
					});
				}
			}
		}
	}


	menuOnload ();	

	$scope.initSelectedQuantity = function(menuItemName) {
		//Updating selectedQuantity for MenuItemList from the storedCartItems .
		if($location.path() == '/modifyOrder') { 
			if( $scope.isItemSelected(menuItemName) != "" ) {
				$scope.MenuItemList.filter(function (obj) {
					return obj.Name  == menuItemName ;
				})[0].SelectedQuantity = $scope.storedCartItems.filter(function (obj) {
					return obj.Name  == menuItemName ;
				})[0].SelectedQuantity ;

				return $scope.storedCartItems.filter(function (obj) {
					return obj.Name  == menuItemName ;
				})[0].SelectedQuantity ;
			}else {
				return "" ;
			}	

		}
		else {
			return "" ;
		}
	}

	$scope.initSelectedSize = function(menuItemName) {
		//Updating selectedSize for MenuItemList from the storedCartItems .
		if($location.path() == '/modifyOrder') {
			if( $scope.isItemSelected(menuItemName) != "" ) {
				$scope.MenuItemList.filter(function (obj) {
					return obj.Name  == menuItemName ;
				})[0].SelectedSize = $scope.storedCartItems.filter(function (obj) {
					return obj.Name  == menuItemName ;
				})[0].SelectedSize ;
			}	 
		//Updating selected size for pre-selected items as well as remaining menu items.

			return $scope.MenuItemList.filter(function (obj) {
				return obj.Name  == menuItemName ;
			})[0].SelectedSize ;

		}else {
			return $scope.MenuItemList.filter(function (obj) {
				return obj.Name  == menuItemName ;
			})[0].SelectedSize ;
		}
	}



	$scope.showFoodDescription = function (menuItemName) {
		$scope.itemHighlighted = menuItemName ;
		$uibModal.open({
			animation: $scope.animationsEnabled,
			templateUrl: 'foodDescription.html',
			controller: 'foodDescModalInstanceCtrl',
			resolve: {
				menuItem : function () {
					return menuItemName ;
				}
			}
		});
	}	

	$scope.hideFoodDescription = function () {
		$scope.itemHighlighted = "" ;
		$rootScope.$broadcast('hideFoodDescription'); /* Broadcasting the 'hideFoodDescription' event to the modal instance ctrl */
	}

	$scope.isItemSelected = function(menuItemName) {
		if($scope.CartItemList.indexOf(menuItemName) > -1) return menuItemName ;
		else return "" ;
	}
	
	$scope.isItemAvailable = function(menuItemName) {
		if($scope.MenuItemList.filter(function (obj) {
			return obj.Name  == menuItemName ;
		})[0].Available == 'No' ) {
			return menuItemName ;
		}
	}
	
	$scope.$on('showMenuList', function() {
		$scope.menuContainer = {
				'background-color':'transparent'
		}    
	}); 
    
	document.querySelector('#menuCover').addEventListener('transitionend' , function(event){
		$scope.hideMenuContainer = true ;
		$scope.menuContainer = {
				'background-color':'rgba(0, 0, 0, 0.8)'
		}  
	}, false);
	 

	$scope.$on('hideContainer', function() {
		$scope.hideMenuContainer = true ;
	}); 

	
});




first_app.controller('TimeCtrl' , function($scope , $interval){
	var tick = function() {
		$scope.clock = Date.now();
	}
	tick();
	$interval(tick, 1000);	
});

first_app.controller('foodDescModalInstanceCtrl', function ($scope, $uibModalInstance, menuItem ) {

	$scope.$on('hideFoodDescription', function() {
		$uibModalInstance.close();
	}); 

	$scope.menuItemName = 'images/'+menuItem+'.jpg' ;
	if(menuItem == 'Burger') 	$scope.menuItemName = 'images/'+menuItem+'.png' ;

});

first_app.controller('menuModalInstanceCtrl', function ($scope, $uibModalInstance , hideContainer,validationString) {
	$scope.hideModal = function () {
		$uibModalInstance.close();
		hideContainer();
	}
	$scope.modalValidationText = validationString;
});

first_app.controller('welcomeModalInstanceCtrl', function($scope, $uibModalInstance , showMenu){
	$scope.hideModal = function () {
		$uibModalInstance.close();
		/* broadcasting the 'showMenuList' event in the shared 
		   service 'showMenu', to MenuappController, to hide the Menu Container  */
		showMenu();
	}
});
