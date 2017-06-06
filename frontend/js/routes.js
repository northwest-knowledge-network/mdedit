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
	//check if user is admin. If so, then redirect to /admin route.
        otherwise({
		/*
		redirectTo: function(routeParams, path, search){
			recordService.authenticateAdmin().success(function(response){
				return "/admin";
			}).error(function(error, status){
				return "/iso";
			});		
		},
*/
            redirectTo: '/',
            controller: 'BaseController'
	});
}]);
