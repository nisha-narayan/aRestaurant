first_app.controller('signInController' , function($scope, $http, $location, $timeout, $rootScope, $uibModal, $cookies,$interpolate, AuthenticationService){

	$scope.hideRegistrationSuccess = true; 
	$scope.hideBorderLeftCanvas = true;
	$scope.hideBorderRightCanvas = true;
	$scope.registerDisabled = true ;
	$scope.hideIncorrectUsername = true;
	$scope.hideIncorrectPassword = true;
	$scope.resetEmailResult = "" ;
	$scope.hidePasswordResetHeader = true;
	$scope.hidePasswordReset = true ;
	$scope.hideNewPassword = true ;	
	var customerEmail = "";
		
	$scope.customer = {
			FirstName:'',
			LastName:'',
			Username:'',
			Password:'',
			Email:'',
			Address:{
				AddressLine1:'',
				AddressLine2:'',
				City:'',
				State:'',
				ZipCode:''
			},
		   BTreeCustId:''
	} ;
	
	$scope.customerLogin = {
			Username:'',
			Password:''
	}
	
	var enableCanvas = function() {
		$scope.hideBorderLeftCanvas = false;
		$scope.hideBorderRightCanvas = false;
		// Border Design Right
		var canvasRight = document.getElementById('borderRightDesignGlow');
		var context1 = canvasRight.getContext('2d');
		context1.beginPath();
		context1.moveTo(180, 9);
		context1.quadraticCurveTo(181, -5, 187, 5); 
		context1.moveTo(183, 119);		
		context1.bezierCurveTo(162, 101, 206, 52, 180, 9);
		context1.moveTo(191, 88); 
		context1.bezierCurveTo(202, 125, 164, 120, 181, 164); 
		context1.moveTo(186,125);
		context1.quadraticCurveTo(200, 135, 175, 185); 
		context1.moveTo(187,168);
		context1.quadraticCurveTo(203,188,187,210);
		context1.moveTo(196,207);
		context1.quadraticCurveTo(195,237,172,216); 
		context1.moveTo(170, 196);
		context1.quadraticCurveTo(160, 196 ,145, 207);
		context1.moveTo(174,222);
		context1.bezierCurveTo(160, 240, 130, 174, 98, 212); 
		context1.moveTo(140,212);
		context1.bezierCurveTo(110, 239, 80, 183, 42, 218);
		context1.moveTo(40,218);
		context1.bezierCurveTo(27, 222, 4, 202, 1, 215); 
		context1.moveTo(93,215);
		context1.quadraticCurveTo(83, 223 ,70,220); 
		context1.moveTo(179,220);
		context1.lineTo(185,202); 
		context1.moveTo(177,199);
		context1.lineTo(190,201);
		context1.moveTo(175,191);
		context1.lineTo(173,206);
		context1.moveTo(172,187);
		context1.lineTo(185,193); 
		context1.moveTo(165, 202);
		context1.quadraticCurveTo(173, 216 ,180, 210);
		context1.moveTo(160,190);
		context1.bezierCurveTo(143, 180, 170, 165, 165, 191); 
		context1.strokeStyle = '#e699ff';
		context1.lineWidth = 2; 
		context1.shadowColor   = '#ffffff';
	    context1.shadowBlur = 7;
		context1.stroke();
		
		// Border design left
		var canvasRight = document.getElementById('borderLeftDesignGlow');
		var context2 = canvasRight.getContext('2d');
		context2.beginPath();
		context2.moveTo(10,228);
		context2.bezierCurveTo(27,232,0,193,15,165);
		context2.moveTo(15,165);
		context2.bezierCurveTo(30,143,-3,105,13,67); 
	    context2.moveTo(18,63);
	    context2.quadraticCurveTo( 24, 54, 28,34);
	    context2.moveTo(8,150);
	    context2.quadraticCurveTo(7,133,11,121);
	    context2.moveTo(16,117);
	    context2.bezierCurveTo(40,90,-3,44,6,28);
		context2.moveTo(11,29);
		context2.quadraticCurveTo(-7,5,17,4);
		context2.moveTo(17,11);
		context2.quadraticCurveTo(34,-3,52,13);
		context2.moveTo(39,27);
		context2.quadraticCurveTo(67, 2,90,13);
	    context2.moveTo(59,19);
	    context2.bezierCurveTo(79,39,102,-2,126,12);
		context2.moveTo(97,20);
		context2.bezierCurveTo(117,35,150,1,188,20);
		context2.moveTo(188,20);
		context2.quadraticCurveTo(205,25,195,13);
    	context2.moveTo(8,22);
		context2.lineTo(23,17);
		context2.moveTo(23,9);
		context2.lineTo(27,27);
		context2.moveTo(19,30);
		context2.lineTo(32,28); 
		context2.moveTo(31,16);
		context2.lineTo(36,33);
		context2.moveTo(15,21);
		context2.quadraticCurveTo(12,30,25,40);
		context2.moveTo(32,37);
		context2.bezierCurveTo(62,39, 40,65, 35,40);
		context2.strokeStyle = '#e699ff' ;
		context2.lineWidth = 2;
		context2.shadowColor   = '#ffffff';
	    context2.shadowBlur = 7;
		context2.stroke();	
	}
	
	var signInOnLoad = function() {
		 /* Encrypted Password reset path has a length of 74 for the smallest possible email , e.g: y@z.com  .
		  * Filtering other mis-typed paths(typos) , by checking length of the path string .
		  */
		   if($location.path() != '/signIn' && $location.path().length > 73 ){ 
				var currentPath = $location.path() ;
				currentPath = currentPath.substring(currentPath.indexOf("#")+1,currentPath.length);
				var emailKey = $cookies.get('EmailKey');
				/* Password reset link expires after one hour - 3600000. EmailKey expires. */
				if(emailKey != undefined){
				     customerEmail = CryptoJS.AES.decrypt(currentPath,emailKey).toString(CryptoJS.enc.Utf8);
					 var emailCheck = customerEmail.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
					 if( emailCheck != null && emailCheck.length){
							    $scope.hideNewPassword = false ;
								$scope.hidePasswordReset = true ;
								$scope.hideLoginUser = true ;
								$scope.hidePasswordResetHeader = false ;
								$scope.hideSignInHeader = true ;
								$scope.hideSignInButton = true ;
					   }
					 else {
						    $scope.hideNewPassword = false ;
							$scope.hidePasswordReset = true ;
							$scope.hideLoginUser = true ;
							$scope.hidePasswordResetHeader = false ;
							$scope.hideSignInHeader = true ;
							$scope.hideSignInButton = true ;
							$scope.hideEnterNewPassword = true ;
							$scope.hideConfirmNewPassword = true ;
							$scope.hideReset = true ;
							$scope.resetPasswordStyle = {
									'color' : '#b30000'
							}
							$scope.resetPasswordResult = "An error occurred. Please try again."	;
					 }
				}
				else {
					$scope.hideNewPassword = false ;
					$scope.hidePasswordReset = true ;
					$scope.hideLoginUser = true ;
					$scope.hidePasswordResetHeader = false ;
					$scope.hideSignInHeader = true ;
					$scope.hideSignInButton = true ;
					$scope.hideEnterNewPassword = true ;
					$scope.hideConfirmNewPassword = true ;
					$scope.hideReset = true ;
					$scope.resetPasswordStyle = {
							'color' : '#b30000'
					}
					$scope.resetPasswordResult = "This  password  reset  link  has  expired"	;
				}
				
			}
			else {
				if(!$rootScope.globals.currentUser){
					/* when user has navigated to the sign-in page from the Menu page
					   for the first time */
					sessionStorage.setItem('signInPageVisited' , 'true');
				} else {
					/* Scenario #1
					 * when browser back button is clicked after a user has signed-in, 
					  from the shopping cart page . */
					
					/* Scenario #2
					 * When user re-visits the sign-in page, after visiting the sign-in page earlier, without signing in.
					 * currentUser = Visitor .
					 */
					// Combining scenario 1 and 2 . 
					if($rootScope.globals.currentUser.username != "visitor" && $rootScope.globals.currentUser.username != undefined){
					   $location.path('/');
					}
				}
			}
	}
	signInOnLoad();
	
	
	$scope.enableRegistration = function(noAccountYet) {
		// Toggle options for the 'No Account yet' check box .
		if(noAccountYet){
		  $scope.registerDisabled = false ;
		  $scope.registrationField = {
					'background-color':'#f2f2f2'
		  }
		  $scope.registrationContainer = {
					'background-color':'transparent'
		  }
		  $scope.hideRegistrationContainer = true ;  
		}
		else {
		  $scope.registerDisabled = true;
		  $scope.registrationField = {
					'background-color':'#b3b3b3'
		  }	
		  $scope.hideRegistrationContainer = false ; 
		  $scope.registrationContainer = {
					'background-color':'rgba(0,0,0,0.8)'
		  }
		}
	}
	

	
	$scope.saveUserDetails = function() {
		var modalValidationFlag = false; 
		if($scope.customer.FirstName == '' || $scope.customer.FirstName == undefined || 
		   $scope.customer.LastName == '' || $scope.customer.LastName == undefined	) {
		   modalValidationFlag = true ;
		   $scope.validationString = "Please enter your First and Last Name";
			
		} 
		else if($scope.customer.Username == '' || $scope.customer.Username == undefined  || 
			$scope.customer.Password == '' || $scope.customer.Password == undefined ) {
			modalValidationFlag = true ;
			$scope.validationString = "Please enter a Username and Password";
		}
		else if($scope.customer.Address.AddressLine1 == '' || $scope.customer.Address.AddressLine1 == undefined || 
		   $scope.customer.Address.City == '' || $scope.customer.Address.City == undefined || 
		   $scope.customer.Address.State == '' || $scope.customer.Address.State == undefined || 
		   $scope.customer.Address.ZipCode == '' || $scope.customer.Address.ZipCode == undefined  ) {
			modalValidationFlag = true ;
			$scope.validationString = "Please enter Address information";
		}
		else if  ($scope.customer.Email == '' || $scope.customer.Email == undefined) {
			modalValidationFlag = true ;
			$scope.validationString = "Please enter a valid email address";
		}
		
		if (modalValidationFlag == true) {
			$uibModal.open({
			      animation: $scope.animationsEnabled,
			      templateUrl: 'signInValidation.html',
			      controller: 'signInModalInstanceCtrl',
			      resolve: {
			    	  validationString : function() {
			    		  return $scope.validationString ;
			    	  }
			      }
			    }); 	
		}
		else {			
		$http.defaults.headers.post["Content-Type"] = "application/json";
		$http.post('/adduser',JSON.stringify($scope.customer)).then(
			       function(response){
			           if(response.data == "Success"){
			        	   $scope.hideRegistration = true ;
			        	   $scope.hideRegistrationSuccess = false ; 
			        	   enableCanvas();
			           }else if (response.data == "F11000"){
			        	   $scope.validationString = "Username or Email already exists.";
			        	   $uibModal.open({
							      animation: $scope.animationsEnabled,
							      templateUrl: 'signInValidation.html',
							      controller: 'signInModalInstanceCtrl',
							      resolve: {
							    	  validationString : function() {
							    		  return $scope.validationString ;
							    	  }
							      }
							    }); 
			           }
			           else {
			        	   $scope.validationString = "An error occurred and your registration could not be completed.";
			        	   $uibModal.open({
							      animation: $scope.animationsEnabled,
							      templateUrl: 'signInValidation.html',
							      controller: 'signInModalInstanceCtrl',
							      resolve: {
							    	  validationString : function() {
							    		  return $scope.validationString ;
							    	  }
							      }
							    }); 
			           }
			       }, 
			       function(response){ 
			    	   $scope.validationString = "An error occurred and your registration could not be completed.";
		        	   $uibModal.open({
						      animation: $scope.animationsEnabled,
						      templateUrl: 'signInValidation.html',
						      controller: 'signInModalInstanceCtrl',
						      resolve: {
						    	  validationString : function() {
						    		  return $scope.validationString ;
						    	  }
						      }
						    }); 
		               }      
		           ); 
		}		
	}	
		
	$scope.signInUser = function() {
		$scope.showLoadingIcon = true ;
		$scope.hideIncorrectUsername = true;
   	    $scope.hideIncorrectPassword = true;
		if($scope.customerLogin.Username == '' || $scope.customerLogin.Username == undefined || 
				   $scope.customerLogin.Password == '' || $scope.customerLogin.Password == undefined	) {
				   $scope.validationString = "Please enter your Username and Password.";
				   $uibModal.open({
					      animation: $scope.animationsEnabled,
					      templateUrl: 'signInValidation.html',
					      controller: 'signInModalInstanceCtrl',
					      resolve: {
					    	  validationString : function() {
					    		  return $scope.validationString ;
					    	  }
					      }
					    }); 
		$scope.showLoadingIcon = false ;
		}
		else {
		$http.defaults.headers.post["Content-Type"] = "application/json";
		$http.post('/verifyUser',JSON.stringify($scope.customerLogin)).then(
				
			       function(response){
			    	   if(response.data == "Failed"){ 
			    		   var incorrectCredentials = function() {
				        	   $scope.hideIncorrectUsername = false;
				        	   $scope.hideIncorrectPassword = false;
			    		   }
			    		   $timeout(incorrectCredentials,50);
			        	   $scope.showLoadingIcon = false ;
			           }else {
			           	   AuthenticationService.SetCredentials($scope.customerLogin.Username,$scope.customerLogin.Password);
			           	   sessionStorage.setItem("signedInCustomer", JSON.stringify(response.data));
			        	   $location.path('/cart');			        	   
			           }
			       },
			       function(response){
			    	   $scope.validationString = "An error occurred. Please try again.";
					   $uibModal.open({
						      animation: $scope.animationsEnabled,
						      templateUrl: 'signInValidation.html',
						      controller: 'signInModalInstanceCtrl',
						      resolve: {
						    	  validationString : function() {
						    		  return $scope.validationString ;
						    	  }
						      }
						    }); 
					   $scope.showLoadingIcon = false ;
			       }
			       );
		}
	}
	
	$scope.sendPasswordResetLink = function() {
		
		var emailKey = CryptoJS.lib.WordArray.random(20).toString() ;
		var encryptedEmail = CryptoJS.AES.encrypt($scope.customerEmail , emailKey);
		var resetStartTime = Date.now();
		resetStartTime = resetStartTime.toString();
		resetStartTime =  resetStartTime+"#" ;
		
		var resetLink = "https://localhost:3000/views/#/"+resetStartTime+encryptedEmail ;
		$cookies.put('EmailKey' , emailKey, 
			{
			path:"https://localhost:3000/views/",
			expires:(new Date(Date.now() + 60000).toUTCString()),
			secure:true
		    });
		
		$scope.forgotPasswordHTML = "" ;
		$scope.passwordResetLink = resetLink;
        setTimeout(function(){ 	
		$scope.forgotPasswordHTML = document.querySelector('#forgotPasswordContainer').innerHTML ;
		$scope.forgotPasswordHTML = $interpolate($scope.forgotPasswordHTML)($scope) ;
		 
 		var mailOptions = {
				to:$scope.customerEmail,
				subject:'Password Reset Link' ,
				html:$scope.forgotPasswordHTML  
		}
 		
			$http.post('/passwordResetLink', JSON.stringify(mailOptions)).then(
				function(response){
					if(response.data == 'Invalid User') {
						$scope.resetEmailResult = "This email-address is not registered with any customer."
						$scope.resetEmailStyle = {
								'color' : '#b30000'
						}	
					}
					else if(response.data == 'Success'){
						$scope.resetEmailResult = "A password reset link has been sent to your registered email address." ;
						$scope.resetEmailStyle = {
								'color' : 'green'
						}
					}
					else {
				    	   $scope.validationString = "An error occurred. Please try again.";
						   $uibModal.open({
							      animation: $scope.animationsEnabled,
							      templateUrl: 'signInValidation.html',
							      controller: 'signInModalInstanceCtrl',
							      resolve: {
							    	  validationString : function() {
							    		  return $scope.validationString ;
							    	  }
							      }
							    }); 
						   $scope.showLoadingIcon = false ;
					}
				},
				function(response){
			    	   $scope.validationString = "An error occurred. Please try again.";
					   $uibModal.open({
						      animation: $scope.animationsEnabled,
						      templateUrl: 'signInValidation.html',
						      controller: 'signInModalInstanceCtrl',
						      resolve: {
						    	  validationString : function() {
						    		  return $scope.validationString ;
						    	  }
						      }
						    }); 
					   $scope.showLoadingIcon = false ;
				}
			);
        });
	}
	
	$scope.backToMenu = function() {
		$location.path('/');
	}
	
	$scope.forgotPassword = function(){
		$scope.hidePasswordResetHeader = false ;
		$scope.hideSignInHeader = true ;
		$scope.hideLoginUser = true ;
		$scope.hidePasswordReset = false ;
		$scope.displayMessage = "Enter your e-mail address and a password reset link will be sent to you."
		$scope.hideBtnSendUsername = true ;
	}
	
	$scope.forgotUsername = function(){
		$scope.hidePasswordResetHeader = false ;
		$scope.hideSignInHeader = true ;
		$scope.hideLoginUser = true ;
		$scope.hidePasswordReset = false ;
		$scope.displayMessage = "Enter your e-mail address and your username will be e-mailed to you."
		$scope.hideBtnPwdReset = true ;
	}
	
	
	$scope.sendUsername = function() {
		
		customerEmail = {
				'Email' : $scope.customerEmail
		}
		
		   
		  // $http.defaults.headers.post["Content-Type"] = "application/json";	

			   
		
	      $http.post('/getUsername' , JSON.stringify(customerEmail)).then(
	    		function (response){
	    			if(response.data != 'Invalid User'){
	    				 $scope.forgotUsernameHTML = "" ;
	    				 $scope.forgotUsername = response.data;
	    		         setTimeout(function(){ 	
	    				 $scope.forgotUsernameHTML = document.querySelector('#forgotUsernameContainer').innerHTML ;
	    				 $scope.forgotUsernameHTML = $interpolate($scope.forgotUsernameHTML)($scope) ;
	    				 var mailOptions = {
		    						to:$scope.customerEmail,
		    						subject:'Forgot Username Information' ,
		    						html: $scope.forgotUsernameHTML 
		    			 }
	    				 $http.post('/sendUsername', JSON.stringify(mailOptions)).then(
	    						function(response){
	    							if(response.data == 'Success'){
	    								$scope.resetEmailResult = "Your username has been sent to your registered email address." ;
	    								$scope.resetEmailStyle = {
	    										'color' : 'green'
	    								}
	    							}
	    							else {
	    								console.log(response.data);
	    							}
	    						},
	    						function(response){
	    							
	    						}
	    					);
	    		         });
	    			}
	    			else{
	    				$scope.resetEmailResult = "This email-address is not registered with any customer."
						$scope.resetEmailStyle = {
									'color' : '#b30000'
						}
	    			}
	    		},
	    		function (response){
	    			
	    		}
	    );
		
	}
	
	$scope.resetPassword = function() {
		
		var currentPath = $location.path() ;
		var resetStartTime = currentPath.substring(1, currentPath.indexOf("#")) ;
		/* If user had clicked on the 'Password reset link' before expiry time, but clicked on 'Reset' button 
		 * after link has expired. 
		 */
		if((Date.now() - resetStartTime)  > 60000){
			$scope.hideSignInButton = true ;
			$scope.hideEnterNewPassword = true ;
			$scope.hideConfirmNewPassword = true ;
			$scope.hideReset = true ;
			$scope.resetPasswordStyle = {
					'color' : '#b30000'
			}
			$scope.resetPasswordResult = "This  password  reset  link  has  expired"	;
			return ;
		}
		
		if($scope.newPassword != $scope.confirmPassword){
			$scope.resetPasswordStyle = {
					'color' : '#b30000'
			}
			$scope.resetPasswordResult = "The password entered does not match with the confirmed password."
		}else {
		 	var newPassword = { 
		 		    'CustomerEmail' : customerEmail,
					'NewPassword' : $scope.newPassword 
			}
			$http.post('/resetPassword' , JSON.stringify(newPassword)).then(
				function(response){
					if(response.data == 'Success'){
						$scope.resetPasswordStyle = {
								'color' : 'green'
						}
					  $scope.resetPasswordResult = "Your password was reset successfully."	;
					  $scope.hideEnterNewPassword = true ;
					  $scope.hideConfirmNewPassword = true ;
					  $scope.hideReset = true ;
					  $scope.hideSignInButton = false ;
					}
					else {
						$scope.resetPasswordStyle = {
								'color' : 'red'
						}
						$scope.hideEnterNewPassword = true ;
						$scope.hideConfirmNewPassword = true ;
						$scope.hideReset = true ;
						$scope.resetPasswordResult = "An error occurred, and your password could not be reset."
					}
				},
				function(response){
					console.log(response.data);
				}
			);
		}
	}
	
	$scope.signIn = function() {
		$location.path('/signIn');
	}
	
});


first_app.controller('signInModalInstanceCtrl', function ($scope, $uibModalInstance , validationString) {
	
	   if(validationString.includes("An error occurred")){
		   $scope.btnPosition = {
					'top':'15px'
		   }
	   }
	   else {
		   $scope.btnPosition = {
					'top':'20px'
		   }
	   }
	   $scope.hideModal = function () {
		    $uibModalInstance.close();
	   }
	   $scope.modalValidationText = validationString;
});


