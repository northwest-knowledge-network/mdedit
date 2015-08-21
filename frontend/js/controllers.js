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

      $http.get('http://localhost:4000/api/metadata/' + recordId)
           .success(function(data) {
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
             var placeholderRec = data.record;
             var emptyRec = JSON.parse(JSON.stringify(placeholderRec));
             for (var field in emptyRec)
             {
               if (['citation', 'access','west_lon','east_lon', 'north_lat', 
                         'south_lat'].indexOf(field) > -1)
               {
                 emptyRec[field] = [JSON.parse(JSON.stringify(EMPTY_CONTACT))];    
               }
               else if (
                 ['place_keywords', 'thematic_keywords',
                  'data_format', 'online'].indexOf(field) > -1)
               {
                 emptyRec[field] = [];    
               }
               else if (['_cls', '_id', 'start_date', 'end_date', 'last_mod_date',
                         'first_pub_date'].indexOf(field) == -1)
               {
                 emptyRec[field] = "";    
               }
             }
             emptyRec.start_date.$date = new Date(2010, 1, 1);
             emptyRec.end_date.$date = new Date();
             emptyRec.end_date.$date.setHours(0);
             emptyRec.end_date.$date.setMinutes(0);
             emptyRec.end_date.$date.setSeconds(0);

             emptyRec.start_date.hours = 0;
             emptyRec.end_date.hours = 0;
             emptyRec.start_date.minutes = 0;
             emptyRec.end_date.minutes = 0;
             emptyRec.start_date.seconds = 0;
             emptyRec.end_date.seconds = 0;

             emptyRec.last_mod_date.$date = new Date();
             emptyRec.first_pub_date.$date = new Date();
            
             $scope.auxDataFormats = "";

             emptyRec.online = [""];

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
      // the start and end dates currently have hours and minutes zero;
      // grab the hours and minutes and append them. Confusingly JS 
      // uses setHours to set minutes and seconds as well
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

      current.place_keywords = current.place_keywords.split(', ');
      current.thematic_keywords = current.thematic_keywords.split(', ');

      if ($scope.auxDataFormats)
      {
        var auxList = $scope.auxDataFormats.split(',')
                            .map(function(el){ return el.trim(); });
        current.data_format = $scope.dataFormats.concat(auxList);
      }

      current.last_mod_date.$date = 
        $scope.currentRecord.last_mod_date.$date.getTime();
      current.start_date.$date = 
        $scope.currentRecord.start_date.$date.getTime();

      current.end_date.$date = 
        $scope.currentRecord.end_date.$date.getTime();

      current.first_pub_date.$date = 
        $scope.currentRecord.first_pub_date.$date.getTime();

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
