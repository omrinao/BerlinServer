angular.module('myApp').controller('welcomeController', ['$rootScope', '$scope','$http', function($rootScope, $scope, $http) {
    let serverUrl='http://localhost:3000/';
    $rootScope.notLogged = false;
    function successGetRandomPOI(response){
        data = response.data;
        for (var i = 0; i < data.length; i++){
            data[i].POIName = data[i].POIName.replace(/\s*$/,'');
            data[i].CategoryName = "portfolio-item " + data[i].CategoryName.replace(/\s*$/,'') + " all col-xs-12 col-sm-4 col-md-3";
            data[i].Description = data[i].Description.replace(/\s*$/,'');
        }
        $scope.POIs = data;
    }
    
    function errorGetRandomPOI(response){
        alert(response);
    }
    
    $http.get(serverUrl + 'GetRandomPOI/0').then(successGetRandomPOI, errorGetRandomPOI);
 }]);

 