'use strict';


// for minification, explicitly declare dependencies $scope and $http
metadataEditorApp.controller('BaseController', ['$scope', '$http', '$log', 
  '$route', '$routeParams', 'formOptions',
  function($scope, $http, $log, $route, $routeParams, formOptions) {

    // first see if we have any user information given to us (from Drupal)
    if (typeof(window.session_id) === 'undefined')
    {
      var session_id = 'local';
    }
    else
    {
      var session_id = window.session_id;
    }

    // next see if there is a hostname defined
    var hostname = '';
    if (typeof(window.hostname) === 'undefined')
    {
      hostname = 'localhost:4000';
    }
    else
    {
      hostname = window.hostname;
    }
    $scope.hostname = hostname;

    /** load up formOptions constants (defined in app.js) **/
    $scope.topicCategoryChoices = formOptions.topicCategoryChoices;

    // order for contact fields
    $scope.orderedContactFields = formOptions.orderedContactFields;

    $scope.cfieldsMap = formOptions.cfieldsMap;

    // initialize list of existing metadata records
    displayCurrentRecords();

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

    /**
     * Fetch the record with recordId and update the form to display it.
     *
     * Intended for use in conjunction with the Edit buttons in the records list
     */
    $scope.editRecord = function(recordId)
    {
      $scope.newRecord = false;

      $http.post('//' + hostname + '/api/metadata/' + recordId,
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

      $http.get('//' + hostname + '/api/metadata/placeholder')
           .success(function(data) {
             var placeholderRec = data.record;

             var emptyRec = JSON.parse(JSON.stringify(placeholderRec));

             // clear out placeholder values
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

             $scope.currentRecord = emptyRec;
             $log.log("yo check it");
             $log.log($scope.currentRecord);

             // iso data formats come from a pre-defined list to from ISO std
             $scope.dataFormats = {
               iso: [''],
               // aux, ie auxiliary, is a single text input write-in
               aux: ''
             };

             updateForms($scope.currentRecord);
           });
    };

    // initialize form with placeholder data for creating a new record
    $scope.createNewRecord();

    $log.log($scope.currentRecord);

    /**
     * Change the metadata type being generated between ISO for datasets
     * and Dublin Core for other research products
     */
    $scope.isDublin = false;
    $scope.isISO = true;
    $scope.toggleMetadataType = function(type)
    {
      switch (type)
      {
        case 'dublin':
          $scope.isDublin = true;
          $scope.isISO = false;
          break;

        case 'iso':
          $scope.isDublin = false;
          $scope.isISO = true;
          break;

        default:
          $scope.isDublin = false;
          $scope.isISO = true;
      }

    };

    /**On click of Load MILES Defaults button, 
     * load the defaults in MILES defaults json file
     */
    $scope.defaultMILES = function()
    {
      $scope.newRecord = true;

      $http.get('//' + hostname + '/api/metadata/defaultMILES')
           .success(function(data) {

             var milesRec = data.record;

             for (var key in milesRec)
             {
               if (milesRec.hasOwnProperty(key))
               {
                  // only want to overwrite country and state for MILES
                  if (key === "citation")
                  {
                    $scope.currentRecord[key][0].country = milesRec[key][0].country;
                    $scope.currentRecord[key][0].state = milesRec[key][0].state;
                  }
                  else
                  {
                    $scope.currentRecord[key] = milesRec[key];
                  }
               }
             }

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
        $http.put('//' + hostname + '/api/metadata',
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
        $http.put('//' + hostname + '/api/metadata/' + current._id.$oid,
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
      // if the record is totally new, we first want to save the draft of it
      if ($scope.newRecord)
      {
        $http.post('//' + hostname + '/api/metadata', current)
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
      // if the record already existed as a draft, we update the draft
      else
      {
        $http.put('//' + hostname + '/api/metadata/' + current._id.$oid,
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

      $http.post('//' + hostname + '/api/metadata/' +
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

      current.data_format = $scope.dataFormats.iso;

      if ($scope.dataFormats.aux)
      {
        var auxList = $scope.dataFormats.aux.split(',')
                            .map(function(el){ return el.trim(); });

        current.data_format = current.data_format.concat(auxList);
      }

      current.last_mod_date =
        {$date: $scope.currentRecord.last_mod_date.$date.getTime()};
      current.start_date =
        {$date: $scope.currentRecord.start_date.$date.getTime()};
      current.end_date =
        {$date: $scope.currentRecord.end_date.$date.getTime()};

      current.first_pub_date =
        {$date: $scope.currentRecord.first_pub_date.$date.getTime()};

      // Handle situation where certain fields are missing.
      // Remove them so they are not None when submitted to server.
      return current;
    }


    function displayCurrentRecords()
    {
      $http.post('//' + hostname + '/api/metadata',
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
       /* place and thematic keywords come as a list from the server */
       record.place_keywords =
         record.place_keywords.join(', ');

       record.thematic_keywords =
         record.thematic_keywords.join(', ');

       /* 
        * Need to do $scope with dates because our service returns them as
        * epoch seconds.
        */
       record.start_date.$date =
         new Date(record.start_date.$date);

       record.end_date.$date =
         new Date(record.end_date.$date);

       record.last_mod_date.$date =
         new Date(record.last_mod_date.$date);

       record.first_pub_date.$date =
         new Date(record.first_pub_date.$date);

       // these hours, minutes, seconds get put into broken out select boxes
       record.start_date.hours = record.start_date.$date.getHours();
       record.end_date.hours = record.end_date.$date.getHours();

       record.start_date.minutes = record.start_date.$date.getMinutes();
       record.end_date.minutes = record.end_date.$date.getMinutes();

       record.start_date.seconds = record.start_date.$date.getSeconds();
       record.end_date.seconds = record.end_date.$date.getSeconds();

       $scope.currentRecord = record;
       // This seems to be only for loading from the server.
       // If we are saving updates, this will just overwrite updates with 
       // whatever came from the server, again, which is fine for loading from 
       // the server, but we must first set record.data_format above
       $scope.dataFormats.aux =
         record.data_format.filter(function (f) {
           return $scope.knownDataFormats.indexOf(f) === -1;
         }).join(', ');

       $scope.dataFormats.iso =
         record.data_format.filter(function (f) {
           return $scope.knownDataFormats.indexOf(f) > -1;
         });

       if (!$scope.currentRecord.online) {
         record.online = [""];
       }
    }
    
    

    var addedContacts =
    {
      'access': 0,
      'citation': 0
    };

    $scope.addContactCitation = function()
    {
      $scope.currentRecord.citation
            .push(JSON.parse(JSON.stringify(EMPTY_CONTACT)));

      addedContacts.citation += 1;
    };

    $scope.addContactAccess = function()
    {
      $scope.currentRecord.access
            .push(JSON.parse(JSON.stringify(EMPTY_CONTACT)));

      addedContacts.access += 1;
    };


    $scope.cancelAddContactCitation = function()
    {
      if (addedContacts.citation > 0)
      {
        $scope.currentRecord.citation.pop();
        addedContacts.citation -= 1;
      }
    };

    $scope.cancelAddContactAccess = function()
    {
      if (addedContacts.access > 0)
      {
        $scope.currentRecord.access.pop();
        addedContacts.access -= 1;
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
