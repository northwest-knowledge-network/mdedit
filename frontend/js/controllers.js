'use strict';

/* Controllers */

var metadataEditorApp = angular.module('metadataEditor', ['ui.date']);

// track whether an existing record

// for minification, explicitly declare dependencies $scope and $http
metadataEditorApp.controller('MetadataCtrl', ['$scope', '$http', '$log', 
  function($scope, $http, $log) {

    // initialize list of existing metadata records
    displayCurrentRecords();

    // set date options
    $scope.dateOptions = {
        changeYear: true,
        changeMonth: true,
        yearRange: '1700:+10'
    };

    /**
     * Fetch the record with recordId and update the form to display it.
     *
     * Intended for use in conjunction with the Edit buttons in the records list
     */
    $scope.editRecord = function(recordId)
    {
      $scope.newRecord = false;

      $http.get('http://localhost:4000/api/metadata/' + recordId)
           .success(function(data) {
              $log.log(data.record);
              updateForms(data.record);
           });
    };

    var EMPTY_CONTACT = 
    {
      'name': '', 'email': '', 'org': '', 'address': '',
      'city': '', 'state': '', 'zipcode': '', 'country': '', 'phone': ''     
    };


    $scope.createNewRecord = function()
    {
      $scope.newRecord = true;

      $http.get('http://localhost:4000/api/metadata/placeholder')
           .success(function(data) {
             //updateForms(data.record);
             var placeholderRec = data.record;
             var emptyRec = JSON.parse(JSON.stringify(placeholderRec));
             for (var field in emptyRec)
             {
               if (['citation', 'access'].indexOf(field) > -1)
               {
                 emptyRec[field] = [JSON.parse(JSON.stringify(EMPTY_CONTACT))];    
               }
               else if (
                 ['place_keywords', 'thematic_keywords'].indexOf(field) > -1)
               {
                 emptyRec[field] = [];    
               }
               else if (['_cls', '_id', 'west_lon', 'east_lon', 'north_lat', 
                         'south_lat', 'start_date', 'end_date', 'last_mod_date',
                         'first_pub_date'].indexOf(field) == -1)
               {
                 emptyRec[field] = "";    
               }
             }
             emptyRec.start_date.$date = new Date(2010, 1, 1);
             emptyRec.end_date.$date = new Date();
             emptyRec.last_mod_date.$date = new Date();
             emptyRec.first_pub_date.$date = new Date();
             $log.log(emptyRec);
             $scope.currentRecord = emptyRec;
             updateForms($scope.currentRecord);
           });
    };

    // initialize form with placeholder data for creating a new record
    $scope.createNewRecord();


    /**
     * On submit of metadata form, submitRecord. This both updates the server
     * and makes sure the form is current. Not sure how it wouldn't be, todo?
     */ 
    $scope.submitRecord = function()
    {
      //var current = $scope.currentRecord;
      var current = JSON.parse(JSON.stringify($scope.currentRecord));

      current.place_keywords = current.place_keywords.split(', ');
      current.thematic_keywords = current.thematic_keywords.split(', ');

      current.start_date.$date = 
        $scope.currentRecord.start_date.$date.getTime();

      current.end_date.$date = 
        $scope.currentRecord.end_date.$date.getTime();

      current.last_mod_date.$date = 
        $scope.currentRecord.last_mod_date.$date.getTime();

      current.first_pub_date.$date = 
        $scope.currentRecord.first_pub_date.$date.getTime();

      $log.log(current);

      if ($scope.newRecord)
      {
        
        $http.post('http://localhost:4000/api/metadata', current)
             .success(function(data) {
                 updateForms(data.record);
                 $scope.newRecord = false;
                 addedContacts = 
                 {
                  'access': 0,
                  'citation': 0
                 };            
                 displayCurrentRecords();
             })
             .error(function(data) { console.log(data.record); });
      }
      else
      {
        $http.put('http://localhost:4000/api/metadata/' + current._id.$oid, 
                  current)
             .success(function(data) {
                 updateForms(data.record);
                 addedContacts = 
                 {
                  'access': 0,
                  'citation': 0
                 };            
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
       record.place_keywords = 
         record.place_keywords.join(', ');

       record.thematic_keywords = 
         record.thematic_keywords.join(', ');

       record.start_date.$date = 
         new Date(record.start_date.$date);

       record.end_date.$date = 
         new Date(record.end_date.$date);

       record.last_mod_date.$date = 
         new Date(record.last_mod_date.$date);

       record.first_pub_date.$date = 
         new Date(record.first_pub_date.$date);

       $scope.currentRecord = record; 
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
       'Utilities/Communication'];

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
    
    // order for contact fields
    $scope.orderedContactFields = 
      ['name', 'email', 'org', 'address', 'city', 
       'state', 'zipcode', 'country', 'phone'];

    $scope.cfieldsMap = 
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
    };

    var addedContacts = 
    {
      'access': 0,
      'citation': 0
    };

    $scope.addContact = function(accessOrCitation)
    {
      $scope.currentRecord[accessOrCitation]
            .push(JSON.parse(JSON.stringify(EMPTY_CONTACT)));

      addedContacts[accessOrCitation] += 1;
    };

    $scope.cancelAddContact = function(accessOrCitation)
    {
      if (addedContacts[accessOrCitation] > 0)
      {
        $scope.currentRecord[accessOrCitation].pop();
        addedContacts[accessOrCitation] -= 1;
      }
    };

  } // end of callback for controller initialization
]);
