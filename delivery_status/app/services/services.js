deliveryStatus.service('modalClosed' , function($rootScope) {
	
	var modalClosed = function() {
		$rootScope.$broadcast('modalClosing');
	}
	return modalClosed;
});