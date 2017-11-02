


var first_app = angular.module('first_app' , ['ui.bootstrap','ngRoute','ngCookies','ngIdle','ui.mask']) ;

first_app.config(function($routeProvider, $locationProvider , $httpProvider, IdleProvider){
	
	$routeProvider
	.when('/', {
        templateUrl : 'Menu.html',
        controller  : 'menuappController'
    })
	.when('/cart', {
        templateUrl : 'ShoppingCart.html',
        controller  : 'cartappController'
    })
    .when('/payment', {
        templateUrl : 'PaymentDetails.html',
        controller  : 'paymentDetailsController'
    })
    .when('/order', {
        templateUrl : 'OrderConfirm.html',
        controller  : 'orderConfirmController'
    })
    .when('/signIn', {
        templateUrl : 'SignIn.html',
        controller  : 'signInController'
    }) 
    .when('/modifyOrder',{
    	templateUrl : 'Menu.html',
        controller  : 'menuappController'
    })
    .when('/loggedOut',{
    	templateUrl : 'Menu.html',
        controller  : 'menuappController'
    })
    .when('/trackOrder',{
    	templateUrl : 'trackOrder.html',
        controller  : 'trackOrderController'
    })
    .when('/sessionExpired',{
    	templateUrl : 'sessionExpired.html',
    	controller  : 'sessionExpiredController'
    })
    .otherwise({
    	templateUrl : 'SignIn.html',
        controller  : 'signInController'              
      });
	
	 IdleProvider.idle(10*60);  // user is idle after 1 minute
	 IdleProvider.timeout(10);  // after 10 seconds of being idle, user is timedout
	  
});



first_app.run(function($rootScope, $location, $cookies, $http, $window, Idle){

	if($location.path() != '/sessionExpired'){
	    Idle.watch();
	 }
	
	// When user refreshes the home-page or sign-in page. (cookies are not set).
	if($cookies.get('globals')){
	  $rootScope.globals = JSON.parse($cookies.get('globals')) ;
	} 
	else {
		$rootScope.globals = {} ;
	}
	// Keep the user logged in after page refresh
	if($rootScope.globals.currentUser){
		$http.defaults.headers.common.Authorization = $rootScope.globals.currentUser.authdata  ;
	} 
	
	$rootScope.$on('$locationChangeStart' , function (event, next, current){
		 /* Redirect user to sign-in page, if not logged in . (Excluding home page, tracking page, sign-in page,
		  * logged out page, and password reset page.  
		  */
		 if($location.path() != '/sessionExpired'){
		    Idle.watch();
		 }
		 if($location.path() == '/cart' || $location.path() == '/payment' || $location.path() == '/order' || $location.path() == '/modifyOrder' ){
			  if(!$rootScope.globals.currentUser){
				$location.path('/signIn');
			  }
			  else {
				 if($rootScope.globals.currentUser.authdata != $http.defaults.headers.common.Authorization) {
                    if($location.path() == '/modifyOrder' && $rootScope.globals.currentUser.username == 'visitor' ){
                    	return ;
                    }
                    else {
				     $location.path('/signIn'); 
                    }
				 }
			  }
		 }
	});
    
	$rootScope.$on('IdleTimeout', function() {
        // end user session and redirect to login
		if($location.path() != '/' && $location.path() != '/trackOrder' && $location.path() != '/signIn' && $location.path() != '/loggedOut' && $location.path() != '/sessionExpired'){
			sessionStorage.setItem("sessionExpiredPage" , $location.path());
			sessionStorage.removeItem("signedInCustomer");
			$location.path('/sessionExpired'); 
		}
    });
});

