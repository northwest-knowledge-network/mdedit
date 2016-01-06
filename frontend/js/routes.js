'use strict';

metadataEditorApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        redirectTo: '/iso'
      }).
      when('/dublin', {
        templateUrl: 'partials/dublin.html',
        controller: 'DCController'
      }).
      when('/iso', {
        templateUrl: 'partials/iso.html',
        controller: 'ISOController'
      });
  }
]);
