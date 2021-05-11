first_app.controller('ApplicationController', function($scope , $location , $uibModal, AuthenticationService){
	
	$scope.hideLocation = true;
	$scope.hideContact = true;
	$scope.hideProfileOptions = true;
	$scope.hideAppContainer = true;
	
	
	$scope.Locations = [
		{'_id' : '1',
		 'LocationName'	:'Location Title',
		 'Address' : {
			 'Line1' :'Address Line 1',
			 'Line2' :'Address Line 2',
			 'City'  :'City',
			 'State' :'State',
			 'Zip'   :'Zip Code'
		 } 
		},
		{'_id' : '2',
			 'LocationName'	:'Location Title',
			 'Address' : {
				 'Line1' :'Address Line 1',
				 'Line2' :'Address Line 2',
				 'City'  :'City',
				 'State' :'State',
				 'Zip'   :'Zip Code'
			 } 
		}
	] ;
	
	  var amount = 800;
	  var skew = angular.element(document.querySelector('#skew'));

	  for (var i = 0 ; i < amount ; i++ ) {
		 var s  = angular.element('<div class="star-blink"><div></div></div>');
		 s.css({
			'top': Math.random() * 100 + '%',
			'left': Math.random() * 100 + '%',
			'animation': 'blinkAfter 15s infinite ' + Math.random() * 100 + 's ease-out',
			'width': Math.random() * 2 + 7 + 'px',
			'height': Math.random() * 2 + 7 + 'px',
			'opacity': Math.random() * 5 / 10 + 0.5
			});
		if (i % 8 === 0) {
			s.addClass('red');
		} else if (i % 10 === 6) {
			s.addClass('blue');
		}
		skew.append(s);
	  }

	
	 $scope.hideContactLocations = function() {
		 if($scope.hideLocation == false)
		     $scope.hideLocation = true;
		 if($scope.hideContact == false)
		     $scope.hideContact = true;
	 }
	
	 $scope.showLocations = function() {
		 $scope.hideLocation = false;
	 }
	
	 $scope.showContact = function() {
		 $scope.hideContact = false;
	 }
	 
	 $scope.logOut = function() {
		 $location.path('/loggedOut');
		 $scope.hideProfileOptions = true ;
	 }
	 
	 $scope.updateProfile = function() {
		 $scope.hideAppContainer = false;
			$uibModal.open({
				animation: $scope.animationsEnabled,
				templateUrl: 'profile-template.html',
				controller: 'updateProfileCtrl'
			});
	 }
	 
	 $scope.changeUsername = function() {
		 $scope.hideAppContainer = false;
			$uibModal.open({
				animation: $scope.animationsEnabled,
				templateUrl: 'change-username.html',
				controller: 'changeUsernameCtrl'
			});
	 }
	 
	 $scope.showProfileOptions = function() {
		$scope.hideProfileOptions = false ; 	
	 }
	 
	 $scope.$on('hideAppContainer', function() {
		 $scope.hideAppContainer = true;  
	 }); 
	 
});


first_app.controller('updateProfileCtrl',
		function($scope, $uibModalInstance, $http, $route, $uibModal, $rootScope, $location) {
			$scope.Title = "Update Profile";
			$scope.Person = JSON.parse(sessionStorage.getItem("signedInCustomer"));
			$scope.disableUsername = true;
			$scope.save = function() {
				if ($scope.Person.Email == "" || $scope.Person.Email == undefined) {
					$uibModal.open({
								animation : $scope.animationsEnabled,
								templateUrl : 'profileValidation.html',
								controller : 'profileValidationCtrl',
								resolve : {
									validationString : function() {
										return "You must enter a valid e-mail address."
									}
								}
							});
				} else {
				
					$http.post('/updateProfile',JSON.stringify($scope.Person))
							.then(function(response) {
								      
										if (response.data == "Failed") {
											$uibModal.open({
														animation : $scope.animationsEnabled,
														templateUrl : 'profileValidation.html',
														controller : 'profileValidationCtrl',
														resolve : {
															validationString : function() {
																return "No changes were made to the profile."
															}
														}
													});
										}
										else if (response.data == "401") {
											$rootScope.$broadcast('hideAppContainer');
											$uibModalInstance.close();
											sessionStorage.setItem("sessionExpiredPage" , $location.path());
											sessionStorage.setItem("401", 'true');
											sessionStorage.removeItem("signedInCustomer");
											$location.path('/sessionExpired'); 
										}
										else {
											// In case the person
											// refreshes the page.
											sessionStorage.setItem("signedInCustomer",JSON.stringify($scope.Person));
											$rootScope.$broadcast('hideAppContainer');
											$uibModalInstance.close();
											$route.reload();
										}
									}, function(response) {

									});
				}
			}

			$scope.cancel = function() {
				$rootScope.$broadcast('hideAppContainer');
				$uibModalInstance.close();
			}
		});


first_app.controller('changeUsernameCtrl', function ($scope, $uibModalInstance,$http, $route, $uibModal, $rootScope,$location ) {
	
	$scope.Title = "Change Username";
	$scope.Person = JSON.parse(sessionStorage.getItem("signedInCustomer"));
	$scope.disableUsername = true ;
	
	$scope.save = function() {
		if ($scope.newUser == "" || $scope.newUser == undefined) {
			$uibModal.open({
						animation : $scope.animationsEnabled,
						templateUrl : 'profileValidation.html',
						controller : 'profileValidationCtrl',
						resolve : {
							validationString : function() {
								return "You must enter a new Username."
							}
						}
					});
		} else {
			$scope.newUsername = {
					'Username':$scope.Person.Username,
					'newUsername' : $scope.newUser
			}
			$http.post('/updateNewUsername',JSON.stringify($scope.newUsername))
					.then(function(response) {
						      console.log(response.data);
								if (response.data == "Failed") {
									$uibModal.open({
												animation : $scope.animationsEnabled,
												templateUrl : 'profileValidation.html',
												controller : 'profileValidationCtrl',
												resolve : {
													validationString : function() {
														return "No changes were made to the profile."
													}
												}
											});
								}
								else if (response.data == "Unauthorized") {
									$rootScope.$broadcast('hideAppContainer');
									$uibModalInstance.close();
									sessionStorage.setItem("sessionExpiredPage" , $location.path());
									sessionStorage.setItem("Unauthorized", 'true');
									sessionStorage.removeItem("signedInCustomer");
									$location.path('/sessionExpired'); 
								} 
								else {
									// In case the person
									// refreshes the page.
									$scope.Person.Username = $scope.newUser ;
									sessionStorage.setItem("signedInCustomer",JSON.stringify($scope.Person));
									$rootScope.$broadcast('hideAppContainer');
									$uibModalInstance.close();
									$route.reload();
								}
							}, function(response) {
								console.log(response.data);
							});
		}
	}
	$scope.cancel = function () {
		$rootScope.$broadcast('hideAppContainer');
		$uibModalInstance.close();	
	}
	
});


first_app.controller('profileValidationCtrl', function ($scope, $uibModalInstance,validationString) {
	$scope.hideModal = function () {
		$uibModalInstance.close();	
	}
	$scope.modalValidationText = validationString;
});

