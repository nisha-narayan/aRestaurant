var deliveryStatus = angular.module('delivery_status', ['ngRoute','ui.bootstrap']) ;

deliveryStatus.config(function($routeProvider, $locationProvider , $httpProvider){
	
	$routeProvider
	.when('/', {
        templateUrl : 'signIn.html',
        controller  : 'signInController'
    })
    .when('/deliveryStatus', {
    	templateUrl : 'deliveryStatus.html',
        controller  : 'deliveryStatusController'
    })
});
