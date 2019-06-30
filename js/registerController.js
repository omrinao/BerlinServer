angular.module("myApp").controller("registerController", function ($scope,$http,$window,$location) {
  $scope.submitReg = function(){
    let serverUrl='http://localhost:3000/';
    var req = {
        method: 'POST',
        url: serverUrl + "register",
          data: {
            username : $scope.userName , password : $scope.rpassword ,
            fName : $scope.firstName , lName : $scope.lastName ,
            city : $scope.City , country : $scope.rcountry ,
            question1 : $scope.rQuestion1 , answer1 : $scope.rAnswer1,
            question2 : $scope.rQuestion2 , answer2 : $scope.rAnswer2,
            sights : $scope.rSights , museums : $scope.rMuseums,
            restaurants : $scope.rRestaurants, shopping : $scope.rShopping,
            Email : $scope.rEmail
          }
      }
        $http(req).then(function successCallback(response) {
            if (response.data === "User name already exists"){
              window.alert("user name already taken, please choose another one")
            }else {
              $window.alert("register succeeded!")
              $location.path("/login")
            }
          }, function errorCallback(response) {
            $location.path("/register.html");
          });
  };



  $scope.notValid = true;
  $scope.checkFOIs = function(){
    var counter = 0
    if ($scope.rSights != null && $scope.rSights == true){
      counter++
    }
    if ($scope.rMuseums != null && $scope.rMuseums == true){
      counter++
    }
    if ($scope.rRestaurants != null && $scope.rRestaurants == true){
      counter++
    }
    if ($scope.rShopping != null && $scope.rShopping == true){
      counter++
    }
    if (counter <= 1){
      $scope.notValid = true;
    }
    else{
      $scope.notValid = false;
    }
}
});

