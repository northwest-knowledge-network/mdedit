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
	when('/admin', {
	    templateUrl: prefix + 'partials/admin.html',
	    controller: 'AdminController'
	}).
        otherwise({
            redirectTo: '/',
            controller: 'BaseController'
        });
}]);
