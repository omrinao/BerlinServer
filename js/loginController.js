angular.module('myApp').controller('loginController', ['$rootScope', '$location', '$window', '$scope','$http', 
function($rootScope, $location, $window, $scope, $http) {
    let serverUrl='http://localhost:3000/';
    $scope.logInShow = true;
    $scope.restoreInShow = false;
    $scope.tryLogin = function(){
      if ($scope.username == null || $scope.password == null || $scope.username == "" || $scope.password == ""){
        alert("Please enter user name and password")
      }
      else $http.post(serverUrl + "login", { "UserName": $scope.username , "Password": $scope.password }, {"headers": {
        'Content-Type': 'application/json', 
      }}).then(function successCallback(response) {
        if (response.data == "Wrong User Name Or Password"){
          $window.alert("Wrong User Name Or Password");
          $location.path("/login");
          $scope.username = "";
          $scope.password = "";

        }
        else if (response.data == null || response.data.length < 1){
          $window.alert("Wrong User Name Or Password");
          $scope.username = "";
          $scope.password = "";
          $location.path("/login");
        }
        else{
          $rootScope.Logged = true;
          $rootScope.loggedUser = $scope.username
          $window.localStorage.setItem($rootScope.loggedUser, response.data);//response = token
          $location.path("/poi");
        }
    }, function errorCallback(response) {
      $location.path("/login.html"); 
    }); 
      
    }

    $rootScope.logOut = function(){
      $rootScope.Logged = false;
    }

    $scope.restorePass = function(){
        var userToRestore = document.getElementById("username").value;
        
        if (userToRestore == ""){
          alert("please insert username to restore password");
        }
        else
        {
          $scope.userToRestore = userToRestore
          let serverUrl='http://localhost:3000/';
          var req = {
              method: 'GET',
              url: serverUrl + "getQuestions/" + userToRestore,
              }
              $http(req).then(gotUserNamee,errorIngettingUserName);
        }
      }

      function errorIngettingUserName(response){
        alert(response);
      }
      function gotUserNamee(response){
        if (response.data === "No such user name"){
          alert("No such user name")
        }
        else{
          $scope.logInShow = false;
          $scope.restoreInShow = true;
          $scope.question1 = response.data[0].Question
          $scope.question2 = response.data[1].Question
        }
      }

      $scope.backToLogIn =  function (){
        $scope.logInShow = true;
        $scope.restoreInShow = false;
      }
     
      $scope.checkAns = function(){
        var answer1 = document.getElementById("answer1").value;
        var answer2 = document.getElementById("answer2").value;
        if (answer1 === "" || answer2 === ""){
          alert("please fill the answer boxes")
        }
        else{
          let serverUrl='http://localhost:3000/';
          var req = {
              method: 'POST',
              url: serverUrl + "RestorePassword/",
              data: { "UserName": $scope.userToRestore, "Answers": [answer1,answer2]}
              }
              $http(req).then(answersCorrect,answersRwong);
        }
      }

      function answersCorrect(response){
        if (response.data === "Wrong answers"){
          alert(response.data)
          $scope.answer1 =""
          $scope.answer2 =""
        }
        else
        {
          alert(response.data)
          $scope.logInShow = true;
          $scope.restoreInShow = false;
          $scope.answer1 =""
          $scope.answer2 =""
        }
      }
      function answersRwong(){
        alert("At list one of the answers are wrong, please try again")
      }
 }]);