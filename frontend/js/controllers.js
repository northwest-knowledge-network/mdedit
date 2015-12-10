'use strict';


// for minification, explicitly declare dependencies $scope and $http
metadataEditorApp.controller('BaseController',

    ['$scope', '$http', '$log', 'formOptions', 'updateForms', 'recordService',

    function($scope, $http, $log, formOptions, updateForms, recordService)
    {
        // initialize list of existing metadata records
        $scope.allRecords = [];

        $scope.updateRecordsList = () => {
            recordService.list()
                .success(data => $scope.allRecords = data.results);
        };

        $scope.updateRecordsList();

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

            var fresh = recordService.getFreshRecord();

            $scope.newRecord = true;
            $scope.currentRecord = fresh;

            // iso data formats come from a pre-defined list to from ISO std
            $scope.dataFormats = {
              iso: [''],
              // aux, ie auxiliary, is a single text input write-in
              aux: ''
            };
        };

        // initialize form with placeholder data for creating a new record
        $scope.createNewRecord();

        /**
         * On click of Load MILES Defaults button,
         * load the defaults in MILES defaults json file
         */
        $scope.loadDefaultMILES = function() {

            var milesFields = recordService.getMilesDefaults();

            for (var key in milesFields)
            {
                if (milesFields.hasOwnProperty(key))
                {
                    // only want to overwrite country and state for MILES
                    if (key === "citation")
                    {
                        for (var idx = 0; idx < $scope.currentRecord.citation.length; idx++)
                        {
                            $scope.currentRecord.citation[idx].country =
                                milesFields[key][0].country;

                            $scope.currentRecord.citation[idx].state =
                                milesFields[key][0].state;
                        }
                    }
                    else if (['place_keywords', 'thematic_keywords'].indexOf(key) > -1)
                    {
                        $scope.currentRecord[key] = milesFields[key].join(', ');
                    }
                    else
                    {
                        $scope.currentRecord[key] = milesFields[key];
                    }
                }
            }
        };


        /**
         * Load a record that from the server and display fields in form
         * @param  {string} recordId The server-generated ID
         */
        $scope.editRecord = function (recordId) {
            console.log("in here");

            recordService.getRecordToEdit(recordId)
                .success( (data) => {
                    $scope.newRecord = false;
                    console.log("deeper in here");
                    updateForms($scope, data.record);
                })
                .error( error =>
                    $scope.errors.push("Error in loading record to edit")
            );
        };


        /**
         * On submit of metadata form, submitRecord. This both updates the server
         * and makes sure the form is current. Not sure how it wouldn't be, todo?
         */
        $scope.submitDraftRecord = function() {

            recordService.saveDraft($scope)
                .success( function (data) {

                    updateForms($scope, data.record);

                    $scope.newRecord = false;

                    $scope.addedContacts = {
                        'access': 0,
                        'citation': 0
                    };

                    $scope.updateRecordsList();
                })
                .error( function (data) {
                    // TODO
                });
        };


        /**
         * Publish a record to the portal. Requires all fields to be valid
         */
        $scope.publishRecord = function() {

            recordService.publish($scope)
                .success( function (data) {

                    updateForms(data.record);

                    $scope.newRecord = false;

                    $scope.addedContacts = {
                        'access': 0,
                        'citation': 0
                    };

                    updateRecordsList();
                })
                .error( function (data) {
                    // TODO
                });
        };

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
]);
