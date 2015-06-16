'use strict';

/* Controllers */

var phonecatApp = angular.module('phonecatApp', []);

// for minification, explicitly declare dependencies $scope and $http
phonecatApp.controller('PhoneListCtrl', ['$scope', '$http', 
function($scope, $http) {

  // replace static explicit def with $http.get
  $http.get('phones/phones.json').success(function(data) {
    $scope.phones = data;
  });

  $scope.orderProp = 'age';

  $http.get('http://localhost:4000/api/metadata/555d0b6315b3bad42c0c1c74')
   .success(function(data) {
     var rec = data.record;
     $scope.record = rec;

     $scope.basicForm = 
      { title: 'Basic Information',
        description: 'Just some get to know ya',
       fields: { 
         title: rec.title,
         summary: rec.summary
       }
      };
   });
}]);
