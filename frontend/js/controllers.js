'use strict';

/* Controllers */

var metadataEditorApp = angular.module('metadataEditor', []);

// track whether an existing record

// for minification, explicitly declare dependencies $scope and $http
metadataEditorApp.controller('MetadataCtrl', ['$scope', '$http', 
function($scope, $http) {

  // initialize form with placeholder data for creating a new record
  createNewRecord();

  // initialize list of existing metadata records
  displayCurrentRecords();

  /**
   * Fetch the record with recordId and update the form to display it.
   *
   * Intended for use in conjunction with the Edit buttons in the records list
   */
  function editRecord(recordId)
  {
    $scope.newRecord = false;

    updateForms(
      $http.get('http://localhost:4000/api/metadata/' + recordId).record
    );
  }

  function createNewRecord()
  {
    $scope.newRecord = true;

    $http.get('http://localhost:4000/api/metadata/placeholder')
         .success(function(data) {
           updateForms(data.record);
         });
  }

  /**
   * On submit of metadata form, submitRecord. This both updates the server
   * and makes sure the form is current. Not sure how it wouldn't be, todo?
   */ 
  $scope.submitRecord = function()
  {
    var current = $scope.currentRecord;

    current.place_keywords = current.place_keywords.split(', ');
    current.thematic_keywords = current.thematic_keywords.split(', ');

    if ($scope.newRecord)
    {
      $http.post('http://localhost:4000/api/metadata', current)
           .success(function(data) {
               updateForms(data.record);
               $scope.newRecord = false;
               displayCurrentRecords();
           })
           .error(console.log(data.record));
    }
    else
    {
      $http.put('http://localhost:4000/api/metadata/' + current._id.$oid, 
                current)
           .success(function(data) {
               updateForms(data.record);
               displayCurrentRecords();
           });
    }
  };

  function displayCurrentRecords()
  {
    $http.get('http://localhost:4000/api/metadata')
         .success(function(data){ 
           $scope.allRecords = data.results; 
         });
  }

  /**
   * Assign a record to the scope's current record.
   *
   * Args:
   *  (Object) actual record
   */
  function updateForms(record) 
  {
     $scope.currentRecord = record;

     $scope.currentRecord.place_keywords = $scope.currentRecord.place_keywords.join(', ');
     $scope.currentRecord.thematic_keywords = $scope.currentRecord.thematic_keywords.join(', ');

     $scope.currentRecord.start_date = new Date($scope.currentRecord.start_date.$date);
     $scope.currentRecord.end_date = new Date($scope.currentRecord.end_date.$date);
     $scope.currentRecord.first_pub_date = new Date($scope.currentRecord.first_pub_date.$date);
  }

  /*
   * Use these maps in the view: key gets displayed, value is actually the
   * object value
   */
  $scope.statusChoicesIsoMap = {
    'completed': 'completed',
    'contiually updated': 'onGoing',
    'in process': 'underDevelopment',
    'planned': 'planned',
    'needs to be generated or updated': 'required',
    'stored in an offline facility': 'historicalArchive',
    'no longer valid': 'obsolete'
  };

  $scope.topicCategoryChoices = 
    ['Biota', 'Boundaries', 
     'Climatology/Meterology/Atmosphere', 'Economy', 'Elevation', 
     'Environment', 'Farming', 'Geoscientific Information', 'Health', 
     'Imagery/Base Maps/Earth Cover', 'Inland Waters', 'Location', 
     'Military Intelligence', 'Oceans', 'Planning/Cadastre', 'Society', 
     'Structure', 'Transportation',
     'Utilities/Communication'],

  // our more human-readable update frequency choices need trans to ISO 19115
  $scope.updateFrequencyChoicesMap = {
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
  }
]);
