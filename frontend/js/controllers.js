'use strict';


// for minification, explicitly declare dependencies $scope and $http
metadataEditorApp.controller('BaseController', 
 
 ['$scope', '$http', '$log', 
  'formOptions', 'updateForms', 'editRecordService',
  'hostname', 'createNewRecordService', 'EMPTY_CONTACT',
  'submitDraftRecordService', 'updateRecordsList', 'publishRecordService',
  'defaultMilesService',

  function($scope, $http, $log,
           formOptions, updateForms, editRecordService,
           hostname, createNewRecordService, EMPTY_CONTACT, 
           submitDraftRecordService, updateRecordsList, publishRecordService,
           defaultMilesService) 
  {
    // initialize list of existing metadata records
    updateRecordsList($scope);

    $scope.errors = [];

    /** load up formOptions constants (defined in app.js) **/
    $scope.topicCategoryChoices = formOptions.topicCategoryChoices;

    // order for contact fields
    $scope.orderedContactFields = formOptions.orderedContactFields;

    // contact fields mapping for layperson-to-iso translation
    $scope.cfieldsMap = formOptions.cfieldsMap;

    // set date options
    $scope.dateOptions = {
        changeYear: true,
        changeMonth: true,
        yearRange: '1700:+10'
    };

    // create time picker vars
    $scope.hours = [];
    for (var i = 0; i < 24; i++)
    {
      $scope.hours.push(i);
    }

    $scope.minute_seconds = [];
    for (var i = 0; i < 60; i++)
    {
      $scope.minute_seconds.push(i);
    }

    $scope.knownDataFormats = formOptions.knownDataFormats;

    $scope.spatialDataOptions = formOptions.spatialDataOptions;
    
    $scope.hierarchyLevels = formOptions.hierarchyLevels;

    $scope.createNewRecord = function() {

        createNewRecordService.then(
            function(emptyRec)
            {
                $scope.newRecord = true;    
                $scope.currentRecord = emptyRec;
  
                // iso data formats come from a pre-defined list to from ISO std
                $scope.dataFormats = {
                  iso: [''],
                  // aux, ie auxiliary, is a single text input write-in
                  aux: ''
                };
  
                updateForms($scope, $scope.currentRecord);
            },
            function(errorMsg)
            {
                $scope.errors.push("Error in fetching form data prototype");
            }
        );
    };

    // initialize form with placeholder data for creating a new record
    $scope.createNewRecord();

    $scope.editRecord = function(recordId)
    {
        return editRecordService($scope, recordId);
    };

    /**
     * On click of Load MILES Defaults button, 
     * load the defaults in MILES defaults json file
     */
    $scope.defaultMILES = function() { defaultMilesService($scope); };
      

    /**
     * On submit of metadata form, submitRecord. This both updates the server
     * and makes sure the form is current. Not sure how it wouldn't be, todo?
     */
    $scope.submitDraftRecord = function() { submitDraftRecordService($scope); };
    

    /**
     * Publish a record to the portal. Requires all fields to be valid
     */
    $scope.publishRecord = function() { publishRecordService($scope); };

    $scope.addedContacts =
    {
      'access': 0,
      'citation': 0
    };

    $scope.addContactCitation = function()
    {
      $scope.currentRecord.citation
            .push(JSON.parse(JSON.stringify(EMPTY_CONTACT)));

      $scope.addedContacts.citation += 1;
    };

    $scope.addContactAccess = function()
    {
      $scope.currentRecord.access
            .push(JSON.parse(JSON.stringify(EMPTY_CONTACT)));

      $scope.addedContacts.access += 1;
    };


    $scope.cancelAddContactCitation = function()
    {
      if ($scope.addedContacts.citation > 0)
      {
        $scope.currentRecord.citation.pop();
        $scope.addedContacts.citation -= 1;
      }
    };

    $scope.cancelAddContactAccess = function()
    {
      if ($scope.addedContacts.access > 0)
      {
        $scope.currentRecord.access.pop();
        $scope.addedContacts.access -= 1;
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

    $scope.options = {};
    $scope.getBbox = function()
    {
      var baseUrl = '//' + hostname + '/api/geocode/';
      var fullUrl = baseUrl + $scope.options.bboxInput;

      $http.get(fullUrl)
           .success(function(data)
           {
             $scope.currentRecord.north_lat = data.north;
             $scope.currentRecord.south_lat = data.south;
             $scope.currentRecord.east_lon = data.east;
             $scope.currentRecord.west_lon = data.west;
           });
    };
  } // end of callback for controller initialization
])
.controller('ISOController', ['formOptions', function(formOptions)
  {
    this.standard = 'iso';
    this.statusChoicesIsoMap = formOptions.statusChoicesIsoMap;

    // our more human-readable update frequency choices need trans to ISO 19115
    this.updateFrequencyChoicesMap = formOptions.updateFrequencyChoicesMap;
  }     
])
.controller('DCController', [function()
  {
    this.standard = 'dc';
  }
])
//map work
.controller('MapController',function($compile, NgMap)
  {
    var vm = this;
    vm.ne, vm.sw, vm.center;
    NgMap.getMap().then(function(map) {
    console.log('map', map);
    vm.map = map;
  });
    vm.boundsChanged = function() {
    vm.ne = this.getBounds().getNorthEast();
    vm.sw = this.getBounds().getSouthWest();
    vm.center = this.getBounds().getCenter();
    vm.map.setCenter(vm.center);
    vm.map.fitBounds(this.getBounds());
  };
});