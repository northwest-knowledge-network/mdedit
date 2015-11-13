'use strict';

metadataEditorApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        redirectTo: '/iso'
      }).
      when('/dublin', {
        templateUrl: 'dublin.html',
        controller: 'FormCtrl'
      }).
      when('/iso', {
        templateUrl: 'iso.html',
        controller: 'FormCtrl'
      });
  }
]);
