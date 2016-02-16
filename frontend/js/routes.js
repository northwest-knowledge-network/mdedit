'use strict';

metadataEditorApp.config(['$routeProvider', 'partialsPrefixProvider',
function($routeProvider, partialsPrefixProvider) {

    var prefix = partialsPrefixProvider.$get();

    $routeProvider.
        when('/dublin', {
            templateUrl: prefix + 'partials/dublin.html',
            controller: 'DCController'
        }).
        when('/iso', {
            templateUrl: prefix + 'partials/iso.html',
            controller: 'ISOController'
        }).
        otherwise({
            redirectTo: '/',
            controller: 'BaseController'
        });
}]);
