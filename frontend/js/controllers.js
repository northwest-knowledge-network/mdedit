'use strict';

/* Controllers */

var metadataEditorApp = angular.module('metadataEditor', ['ui.date']);

// track whether an existing record

// for minification, explicitly declare dependencies $scope and $http
metadataEditorApp.controller('MetadataCtrl', ['$scope', '$http', '$log', 
  function($scope, $http, $log) {

    $log.log('yo 2');
    // first see if we have any user information given to us (from Drupal)
    if (typeof(session_id) === 'undefined')
    {
      var session_id = 'local';
    }
    $log.log('session_id: ' + session_id);

    // initialize list of existing metadata records
    displayCurrentRecords();

    // set date options
    $scope.dateOptions = {
        changeYear: true,
        changeMonth: true,
        yearRange: '1700:+10'
    };

    // create time picker vars
    $scope.hours = _.range(24);
    $scope.minute_seconds = _.range(60);

    $scope.knownDataFormats = ["ASCII", "csv", "DLG", "docx", "DRG", "DWG", "eps", 
      "ERDAS", "Esri grid", "Esri TIN", "FASTA", "FASTQ", "GenBank", 
      "GeoJSON", "GeoTIFF", "GML", "HDF", "jpeg", "KML", "LAS", "mp3", 
      "MrSID", "netCDF", "pdf", "php", "png", "py", "R", "SDXF", "Shapefile", 
      "SPSS", "Stata", "Tab", "tiff", "txt", "VBS", "wav", "xls", "xlsx", 
      "xml"];

    $scope.dataFormats = [];

    $scope.spatialDataOptions = ["vector", "grid", "table or text", 
      "triangulated irregular network", "stereographic imaging", 
      "video recording of a scene"];
    $scope.hierarchyLevels = ["dataset", "series"];

    /**
     * Fetch the record with recordId and update the form to display it.
     *
     * Intended for use in conjunction with the Edit buttons in the records list
     */
    $scope.editRecord = function(recordId)
    {
      $scope.newRecord = false;

      $http.post('http://localhost:4000/api/metadata/' + recordId,
                 {'session_id': session_id})
           .success(function(data) {
             var record = data.record;
             if (typeof record.start_date == "undefined") {
               record.start_date = {$date: new Date(2010, 1, 1)};
             }
             if (typeof record.end_date == "undefined") {
               record.end_date = {$date: new Date()};
             }
             if (typeof record.last_mod_date == "undefined") {
               record.last_mod_date = {$date: new Date()};
             }
             if (typeof record.first_pub_date == "undefined") {
               record.first_pub_date = {$date: new Date()};
             }
             updateForms(record);
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
             var placeholderRec = data.record;
             var emptyRec = JSON.parse(JSON.stringify(placeholderRec));
             for (var field in emptyRec)
             {
               if (['citation', 'access'].indexOf(field) > -1)
               {
                 emptyRec[field] = [JSON.parse(JSON.stringify(EMPTY_CONTACT))];    
               }
               else if (
                 ['place_keywords', 'thematic_keywords',
                  'data_format', 'online'].indexOf(field) > -1)
               {
                 emptyRec[field] = [""];    
               }
               else if (['_cls', '_id', 'start_date', 'end_date', 'last_mod_date',
                         'first_pub_date'].indexOf(field) == -1)
               {
                 emptyRec[field] = "";    
               }
             }
             emptyRec.start_date = {$date: new Date(2010, 1, 1)};
             emptyRec.end_date = {$date: new Date()};
             emptyRec.end_date.$date.setHours(0);
             emptyRec.end_date.$date.setMinutes(0);
             emptyRec.end_date.$date.setSeconds(0);

             emptyRec.start_date.hours = 0;
             emptyRec.end_date.hours = 0;
             emptyRec.start_date.minutes = 0;
             emptyRec.end_date.minutes = 0;
             emptyRec.start_date.seconds = 0;
             emptyRec.end_date.seconds = 0;

             emptyRec.last_mod_date = {$date: new Date()};
             emptyRec.first_pub_date = {$date: new Date()};
            
             $scope.auxDataFormats = "";

             emptyRec.online = [""];

             emptyRec.topic_category = [""];
             emptyRec.thematic_keywords = [""];
             emptyRec.place_keywords = [""];
             emptyRec.data_format = [""];

             $scope.currentRecord = emptyRec;

             updateForms($scope.currentRecord);
           });
    };

    // initialize form with placeholder data for creating a new record
    $scope.createNewRecord();

    /**On click of Load MILES Defaults button, load the defaults in MILES defaults 
    json file
    */
    $scope.defaultMILES = function()
    {
      $scope.newRecord = true;

      $http.get('http://localhost:4000/api/metadata/defaultMILES')
           .success(function(data) {
             var milesRec = data.record;
             milesRec.start_date = {};
             milesRec.end_date = {};
             milesRec.start_date.$date = new Date(2010, 1, 1);
             milesRec.end_date.$date = new Date();
             milesRec.end_date.$date.setHours(0);
             milesRec.end_date.$date.setMinutes(0);
             milesRec.end_date.$date.setSeconds(0);

             milesRec.start_date.hours = 0;
             milesRec.end_date.hours = 0;
             milesRec.start_date.minutes = 0;
             milesRec.end_date.minutes = 0;
             milesRec.start_date.seconds = 0;
             milesRec.end_date.seconds = 0;

             milesRec.last_mod_date = {};
             milesRec.first_pub_date = {};
             milesRec.last_mod_date.$date = new Date();
             milesRec.first_pub_date.$date = new Date();
            
             $scope.auxDataFormats = "";

             $scope.currentRecord = milesRec;

             updateForms($scope.currentRecord);
           });
    };

    /**
     * On submit of metadata form, submitRecord. This both updates the server
     * and makes sure the form is current. Not sure how it wouldn't be, todo?
     */ 
    $scope.submitDraftRecord = function()
    {
      // the start and end dates currently have hours and minutes zero;
      // grab the hours and minutes and append them. Confusingly JS 
      // uses setHours to set minutes and seconds as well
      var current = prepareCurrentScopedRecord();
      if ($scope.newRecord)
      {
        $http.put('http://localhost:4000/api/metadata', 
                  {'record': current, 'session_id': session_id})
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
             .error(function(data) { $log.log(data.record); });
      }
      else
      {
        $http.put('http://localhost:4000/api/metadata/' + current._id.$oid, 
                  {'record': current, 'session_id': session_id})
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

    /**
     * Publish a record to the portal. Requires all fields to be valid
     */
    $scope.publishRecord = function()
    {
      var current = prepareCurrentScopedRecord();
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
             .error(function(data) { $log.log(data.record); });
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

      var currentId = $scope.currentRecord._id.$oid;

      $http.post('http://localhost:4000/api/metadata/' + 
                 currentId + '/publish', 
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
    };
    
    function prepareCurrentScopedRecord() 
    {
      $scope.currentRecord.start_date.$date.setHours(
        $scope.currentRecord.start_date.hours, 
        $scope.currentRecord.start_date.minutes,
        $scope.currentRecord.start_date.seconds
      );

      $scope.currentRecord.end_date.$date.setHours(
        $scope.currentRecord.end_date.hours, 
        $scope.currentRecord.end_date.minutes,
        $scope.currentRecord.end_date.seconds
      );

      var current = JSON.parse(JSON.stringify($scope.currentRecord));

      current.place_keywords = $scope.currentRecord.place_keywords.split(', ');
      current.thematic_keywords = $scope.currentRecord.thematic_keywords.split(', ');

      current.data_format = $scope.dataFormats;

      if ($scope.auxDataFormats)
      {
        var auxList = $scope.auxDataFormats.split(',')
                            .map(function(el){ return el.trim(); });

        current.data_format = $scope.dataFormats.concat(auxList);
      }

      current.last_mod_date = 
        {$date: $scope.currentRecord.last_mod_date.$date.getTime()};
      current.start_date = 
        {$date: $scope.currentRecord.start_date.$date.getTime()};
      current.end_date = 
        {$date: $scope.currentRecord.end_date.$date.getTime()};

      current.first_pub_date = 
        {$date: $scope.currentRecord.first_pub_date.$date.getTime()};

      return current;
    }


    function displayCurrentRecords()
    {
      $http.post('http://localhost:4000/api/metadata', 
                 {'session_id': session_id})
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

       record.start_date.hours = record.start_date.$date.getHours();
       record.end_date.hours = record.end_date.$date.getHours();

       record.start_date.minutes = record.start_date.$date.getMinutes();
       record.end_date.minutes = record.end_date.$date.getMinutes();

       record.start_date.seconds = record.start_date.$date.getSeconds();
       record.end_date.seconds = record.end_date.$date.getSeconds();

       $scope.currentRecord = record;
       $scope.auxDataFormats = 
         record.data_format.filter(function (f) {
           return $scope.knownDataFormats.indexOf(f) === -1;
         }).join(', ');

       $scope.dataFormats = 
         record.data_format.filter(function (f) {
           return $scope.knownDataFormats.indexOf(f) > -1;
         });

       if (!$scope.currentRecord.online) {
         record.online = [""];
       }
    }
    /*
     * Use these maps in the view: key gets displayed, value is actually the
     * object value
     */
    $scope.statusChoicesIsoMap = {
      'completed': 'completed',
      'continually updated': 'onGoing',
      'in process': 'underDevelopment',
      'planned': 'planned',
      'needs to be generated or updated': 'required',
      'stored in an offline facility': 'historicalArchive',
      'no longer valid': 'obsolete'
    };

    $scope.topicCategoryChoices = 
      ['biota', 'boundaries', 
       'climatologyMeteorologyAtmosphere', 'economy', 'elevation', 
       'environment', 'farming', 'geoscientificInformation', 'health', 
       'imageryBaseMapsEarthCover', 'inlandWaters', 'location', 
       'intelligenceMilitary', 'oceans', 'planningCadastre', 'society', 
       'structure', 'transportation',
       'utilitiesCommunication'];

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

    $scope.addContactCitation = function()
    {
      $scope.currentRecord[Citation]
            .push(JSON.parse(JSON.stringify(EMPTY_CONTACT)));

      addedContacts[Citation] += 1;
    };

    $scope.addContactAccess = function()
    {
      $scope.currentRecord[access]
            .push(JSON.parse(JSON.stringify(EMPTY_CONTACT)));

      addedContacts[access] += 1;
    };


    $scope.cancelAddContactCitation = function()
    {
      if (addedContacts[Citation] > 0)
      {
        $scope.currentRecord[Citation].pop();
        addedContacts[Citation] -= 1;
      }
    };

    $scope.cancelAddContactAccess = function()
    {
      if (addedContacts[access] > 0)
      {
        $scope.currentRecord[access].pop();
        addedContacts[access] -= 1;
      }
    };

    $scope.removeOnlineResource = function(resourceIndex)
    {
      if ($scope.currentRecord.online.length === 1)
      {
        $scope.currentRecord.online[0] = "";
      }
      else
      {
        $scope.currentRecord.online.splice(resourceIndex, 1);
      }
    };

    $scope.addOnlineResource = function()
    {
      $scope.currentRecord.online.push("");    
    };
  } // end of callback for controller initialization
]);
