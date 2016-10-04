'use strict';

var metadataEditorApp = angular
    .module('metadataEditor', ['ngRoute', 'ui.date', 'ngMap', 'ngAnimate', 'ui.router', 'ngRoute'])
    .config(function($compileProvider, $stateProvider, $urlRouterProvider, $routeProvider, $locationProvider) {
	// $compileProvider.aHrefSanitizationWhitelist(/localhost:/);
	
	var partialsPrefix = "partials/form/";
	//Comment out line above, uncomment line below to use system in Drupal framwork on development server
	//var partialsPrefix = "frontend/partials/form";
	
	$stateProvider
	    .state('form', {
		templateURl: 'partials/iso.html'
	    })
	    .state('form.setup', {
		templateUrl: partialsPrefix + 'setup.html'
	    })
	    .state('form.basic', {
		templateUrl:  partialsPrefix + 'basic.html'
	    })
	    .state('form.detailed', {
		templateUrl:  partialsPrefix + 'detailed.html'
	    })
	    .state('form.dataFormats', {
		templateUrl:  partialsPrefix + 'isoDataFormats.html'
	    })
	    .state('form.onlineResourcesAndRestrictions', {
		templateUrl:  partialsPrefix + 'onlineResourcesAndRestrictions.html'
	    })
	    .state('form.spatialExtent', {
		templateUrl:  partialsPrefix + 'spatialExtent.html'
	    })
	    .state('form.temporalExtent', {
		templateUrl:  partialsPrefix + 'isoTemporalExtent.html'
	    })
	    .state('form.review', {
		templateUrl:  partialsPrefix + 'review.html'
	    })
	    .state('form.termsConditions', {
		templateUrl:  partialsPrefix + 'termsConditions.html'
	    })
	    .state('form.disclaimer', {
		templateUrl:  partialsPrefix + 'disclaimer.html'
	    })
	    .state('form.sensitiveInformation', {
		templateUrl:  partialsPrefix + 'sensitiveInformation.html'
	    }) 
	    .state('form.optionsAndDisclaimer', {
		templateUrl:  partialsPrefix + 'optionsAndDisclaimer.html'
	    }) 
	    .state('form.contacts', {
		templateUrl:  partialsPrefix + 'contacts.html'
	    })


	    .state('dublinForm',{
		templateURL: 'partials/dublin.html'
	    })

	    .state('dublinForm.setup', {
		templateUrl:  partialsPrefix + 'setup.html'
	    })
	    .state('dublinForm.basic', {
		templateUrl:  partialsPrefix + 'basic.html'
	    })
	    .state('dublinForm.dataFormats', {
		templateUrl:  partialsPrefix + 'dublinDataFormats.html'
	    })
	    .state('dublinForm.onlineResourcesAndRestrictions', {
		templateUrl:  partialsPrefix + 'onlineResourcesAndRestrictions.html'
	    })
	    .state('dublinForm.spatialExtent', {
		templateUrl:  partialsPrefix + 'spatialExtent.html'
	    })
	    .state('dublinForm.temporalExtent', {
		templateUrl:  partialsPrefix + 'dublinTemporalExtent.html'
	    })
	    .state('dublinForm.review', {
		templateUrl:  partialsPrefix + 'review.html'
	    })
	    .state('dublinForm.disclaimer', {
		templateUrl:  partialsPrefix + 'disclaimer.html'
	    })
	    .state('dublinForm.optionsAndDisclaimer', {
		templateUrl:  partialsPrefix + 'optionsAndDisclaimer.html'
	    }) 
	    .state('dublinForm.contacts', {
		templateUrl:  partialsPrefix + 'contacts.html'
	    });

 	$urlRouterProvider
	    .when(/iso/i, '/iso')
	    .when(/dublin/i, '/dublin')
	    .otherwise('/iso');
})
.constant('formOptions',  {

 	topicCategoryChoices: ['biota', 'boundaries',
   'climatologyMeteorologyAtmosphere', 'economy', 'elevation',
   'environment', 'farming', 'geoscientificInformation', 'health',
   'imageryBaseMapsEarthCover', 'inlandWaters', 'location',
   'intelligenceMilitary', 'oceans', 'planningCadastre', 'society',
   'structure', 'transportation',
   'utilitiesCommunication'],

 knownDataFormats: ["ASCII", "csv", "DLG", "docx", "DRG", "DWG", "eps",
      "ERDAS", "Esri file GDB", "Esri grid", "Esri personal GDB","Esri TIN", "FASTA", "FASTQ", "GenBank",
      "GeoJSON", "GeoTIFF", "GML", "HDF", "jpeg", "KML", "LAS", "mp3",
      "MrSID", "netCDF", "pdf", "php", "png", "py", "R", "SDXF", "Shapefile",
      "SPSS", "Stata", "Tab", "tiff", "txt", "VBS", "wav", "xls", "xlsx",
      "xml"],

	spatialDataOptions: ["vector", "grid", "table or text",
      "triangulated irregular network", "stereographic imaging",
      "video recording of a scene"],

	hierarchyLevels: ["dataset", "series"],

	statusChoicesIsoMap:
    {
        'completed': 'completed',
        'continually updated': 'onGoing',
        'in process': 'underDevelopment',
        'planned': 'planned',
        'needs to be generated or updated': 'required',
        'stored in an offline facility': 'historicalArchive',
        'no longer valid': 'obsolete'
    },

	updateFrequencyChoicesMap:
    {
        'continual': 'continual',
        'daily': 'daily',
        'weekly': 'weekly',
        'fortnightly': 'fortnightly',
        'monthly': 'monthly',
        'quarterly': 'quarterly',
        'biannually': 'biannually',
        'annually': 'annually',
        'as needed': 'asNeeded',
        'irregular': 'irregular',
        'not planned': 'notPlanned',
        'unknown': 'unknown'
    },

	orderedContactFields: ['name', 'email', 'org', 'address', 'city',
				       'state', 'zipcode', 'country', 'phone'],

	cfieldsMap:
    {
        'name': 'Name',
        'email': 'Email',
        'org': 'Organization',
        'address': 'Address',
        'city': 'City',
        'state': 'State',
        'zipcode': 'Zip Code',
        'country': 'Country',
        'phone': 'Phone'
    }
}
).constant('emptyContact', {
      'name': '', 'email': '', 'org': '', 'address': '',
      'city': '', 'state': '', 'zipcode': '', 'country': '', 'phone': ''
})
    .run(function($rootScope, hostname){
	$rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
	    //If app is not a local instance, and in Drupal, then we need to add "frontend/" to the path
	    //for states. 
	    if(hostname.indexOf('localhost') == -1)
		toState.templateUrl = "frontend/" + toState.templateUrl;
	})
    });
