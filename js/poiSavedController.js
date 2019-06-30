angular.module('myApp').controller('poiSavedController', ['$window', '$rootScope', '$scope','$http', 
function($window, $rootScope, $scope, $http) {
    let serverUrl='http://localhost:3000/';
    $scope.NoPoisView = false;
    var req2 = {
      method: 'GET',
      url: serverUrl + 'private/user/GetPOISaved/' + $rootScope.loggedUser,
      headers: {
      'token': $window.localStorage.getItem($rootScope.loggedUser)
      },
          data: { "UserName": $rootScope.loggedUser}
      }

  function successGetSavedPOI(response){
    if (response.data === "no pois saved in this category")
        {
          $scope.NoPoisView = true;
        }
    else{
      $scope.detailsView = false;
      $scope.NoPoisView = false;
      
      data = response.data;
      for (var i = 0; i < data.length; i++){
          data[i].POIName = data[i].POIName.replace(/\s*$/,'');
          data[i].CategoryName = "portfolio-item " + data[i].CategoryName.replace(/\s*$/,'') + " all col-xs-12 col-sm-4 col-md-3";
          data[i].Description = data[i].Description.replace(/\s*$/,'');
      }
      $scope.POIs = data
      $rootScope.NumOfSavedPOIs = data.length;
    }
  }

  function errorGetSavedPOI(response){
      alert(response);
  }

  $http(req2).then(successGetSavedPOI, errorGetSavedPOI);


  $scope.getPOIInfo = function(poiName){
        
    function successGetCatPOI(response){
        data = response.data;
        data[0].POIName = data[0].POIName.replace(/\s*$/,'');
        data[0].CategoryName = data[0].CategoryName.replace(/\s*$/,'');
        data[0].Description = data[0].Description.replace(/\s*$/,'');

        $scope.POIs.POIName = data[0].POIName;
        $scope.POIs.Description = data[0].Description;
        $scope.POIs.Rank = "Rank: " + data[0].Rank;
        $scope.POIs.numOfViews = "Number of Viewers: " + data[0].NumOfViews;
        $scope.POIs.ImageURL = data[0].ImageURL;
        if (data.length > 1){
            $scope.POIs.Reviews = "";
            $scope.noReview = false;
            for (var i = 1; i < data.length; i++){
                $scope.POIs.Reviews = $scope.POIs.Reviews + i + ". " + data[i].Review + '\n';
            }
        }
        else {
            $scope.noReview = true;
            $scope.POIs.Reviews = "No Reviews yet! Write your own review!";
        }
        $scope.POIs.message = ""
        $scope.detailsView = true;
    }

    function errorGetCatPOI(response){
        alert(response);
    }

    $http.get(serverUrl + 'getPOI_info/' + poiName).then(successGetCatPOI, errorGetCatPOI);
}

  $scope.getCatPOI = function(category){
    if (category === "All"){
      $http(req2).then(successGetSavedPOI, errorGetSavedPOI);
    }
    else{
      var req = {
        method: 'GET',
        url: serverUrl + 'private/user/getCatPOIForUser/' + $rootScope.loggedUser + '/' + category,
        headers: {
        'token': $window.localStorage.getItem($rootScope.loggedUser)
        },
            data: { "UserName": $rootScope.loggedUser, "Category" : category}
        }
        $http(req).then(successGetSavedPOI, errorGetSavedPOI);
    }
  }


  $scope.swap = function(data,indexToMove,indexMovingTo){
    var tmp = data[indexToMove]
    data[indexToMove] = data[indexMovingTo]
    data[indexMovingTo] = tmp
    return data
  }

  $scope.sortCurrPOIsByRank = function(){
    data = $scope.POIs
    var max = 0;
    var index = 0;
    for (var i = 0 ; i < data.length; i++){
      for (var j = i; j < data.length; j++){
        if (max < data[j].Rank){
          index = j;
          max = data[j].Rank
        }
      }
      data = $scope.swap(data,i,index)
      max = 0;
      index = i;
    }
    $scope.POIs = data
    successGetSavedPOI()
  }

  
  $scope.goBackToPOIs = function(){
    $scope.detailsView = false;
  }

  $scope.removeFromList = function(poiName){
    var req = {
      method: 'POST',
      url: serverUrl + 'private/user/RemovePOI/',
      headers: {
      'token': $window.localStorage.getItem($rootScope.loggedUser)
      },
          data: { "UserName": $rootScope.loggedUser, "POIName" : poiName}
      }
      $http(req).then(successRemovePOI, errorRemovePOI);
  }
  
  function errorRemovePOI(response){
    alert(response);
  }

  function successRemovePOI(response){
    var req = {
      method: 'GET',
      url: serverUrl + 'private/user/GetPOISaved/' + $rootScope.loggedUser,
      headers: {
      'token': $window.localStorage.getItem($rootScope.loggedUser)
      },
          data: { "UserName": $rootScope.loggedUser}
      }

      $http(req).then(successGetSavedPOI, errorRemovePOI);
  }

  }]);