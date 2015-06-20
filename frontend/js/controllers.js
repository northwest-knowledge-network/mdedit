'use strict';

/* Controllers */

var metadataEditorApp = angular.module('metadataEditor', []);

// for minification, explicitly declare dependencies $scope and $http
metadataEditorApp.controller('MetadataCtrl', ['$scope', '$http', 
function($scope, $http) {

    $http.get('http://localhost:4000/api/metadata')
         .success(function(data) { 
           updateForms(data); 

           $scope.allRecords = data.results;
         });

    /**
     * On submit of metadata form, updateMetadata. This both updates the server
     * and makes sure the form is current. Not sure how it wouldn't be, todo?
     */ 
    $scope.updateMetadata = function(data) {
      $http.put('http://localhost:4000/api/metadata/' + 
                $scope.firstRecord._id.$oid, $scope.firstRecord)
           .success(function(data){ updateForms(data); })
           .error(console.log($scope.firstRecord));
    };

    var currentRec = {};

    var updateForms = function(data) 
    {
       // need to make this conditional so that we can load a non-default 
       currentRec = data.results[0];
       $scope.firstRecord = currentRec;

       // the way to post back to update a metadata record
       $scope.basicForm = 
        { title: 'Basic Information',
          description: 'Just some get to know ya',
          fields: { 
            title: currentRec.title,
            summary: currentRec.summary
         }
        };

       $scope.detailsForm = 
        { title: 'Detailed Information',
          description: 'and the secrets of your soul-a',
          fields: { 
            topic_category_choices: ['Biota', 'Boundaries', 
               'Climatology/Meterology/Atmosphere', 'Economy', 'Elevation', 
               'Environment', 'Farming', 'Geoscientific Information', 'Health', 
               'Imagery/Base Maps/Earth Cover', 'Inland Waters', 'Location', 
               'Military Intelligence', 'Oceans', 'Planning/Cadastre', 'Society', 
               'Structure', 'Transportation',
               'Utilities/Communication'],
            topic_category: currentRec.topic_category, // restricted options
            place_keywords: currentRec.place_keywords.join(', '),
            theme_keywords: currentRec.theme_keywords.join(', '),
            status_choices: ['completed', 'continually updated', 'in process', 
              'planned', 'needs to be generated or updated', 
              'stored in an offline facility', 
              'no longer valid'],
            status: currentRec.status,
            update_frequency_choices: ['continual', 'daily', 'weekly', 
              'fortnightly', 'monthly', 'quarterly', 'biannually', 'annually', 
              'as needed', 'irregular', 'not planned', 'unknown'],
            update_frequency: currentRec.update_frequency,
          }
        };

        $scope.spatioTemporalForm = 
        {
          title: 'Spatio-temporal Extents',
          description: 'The spatial and temporal extents of the data',
          fields: {
            west_lon: -117.531786,
            east_lon: -110.655421,
            south_lat: 41.946097,
            north_lat: 49.039542,
            start_date: new Date(2010, 10, 1),
            end_date: new Date(2011, 9, 31)
          }
        };

        /*
         * Use these maps in the view: key gets displayed, value is actually the
         * object value
         */
        //
        // our more human-readable status choices need trans to ISO 19115
        console.log(currentRec.status);
        $scope.status_choices_iso_map = {
          'completed': 'completed',
          'contiually updated': 'onGoing',
          'in process': 'underDevelopment',
          'planned': 'planned',
          'needs to be generated or updated': 'required',
          'stored in an offline facility': 'historicalArchive',
          'no longer valid': 'obsolete'
        };

        // our more human-readable update frequency choices need trans to ISO 19115
        $scope.update_frequency_choices_map = {
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
      };
    }; // end updateForms
}]);
