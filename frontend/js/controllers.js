'use strict';


// for minification, explicitly declare dependencies $scope and $http
metadataEditorApp.controller('BaseController',
    ['$scope', '$http', '$log', '$window', '$timeout', '$location', '$anchorScroll', 'formOptions', 'updateForms', 'recordService',
     'AttachmentService', 'Geoprocessing', 'hostname', 'session_id', 'partialsPrefix',
     
     function($scope, $http, $log, $window, $timeout, $location, $anchorScroll, formOptions, updateForms,
        recordService, AttachmentService, Geoprocessing, hostname, session_id,
        partialsPrefix)
    {
        // initialize list of existing metadata records
        $scope.allRecords = [];

        $scope.options = {};
	
	//Delcare variables used for ng-style tags during automated tutorial
	$scope.simulateHoverSave;
	$scope.simulateHoverPublish;
	$scope.simulateHoverDataset;
	$scope.simulateHoverNonDataset;
	$scope.simulateHoverMiles;
	$scope.simulateHoverNKN;
	
        //=== set up hostname-related scope variables ===//
        // export to XML
        var exportAddr = function(oid, xmlType) {
            return hostname + '/api/metadata/' + oid + '/' + xmlType;
        };
        $scope.export_ = function(type) {
            var oid = $scope.currentRecord._id.$oid;
            var prefix = 'http://';
            $window.open(prefix + exportAddr(oid, type));
        };
        // prefix on routes to partials
        $scope.partialsPrefix = partialsPrefix;

        $scope.updateRecordsList = function() {
            recordService.list()
                .success(function(data) {
                    $scope.allRecords = data.results;
                });
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
        for (i = 0; i < 60; i++)
        {
          $scope.minute_seconds.push(i);
        }

        $scope.knownDataFormats = formOptions.knownDataFormats;

        $scope.spatialDataOptions = formOptions.spatialDataOptions;

        $scope.hierarchyLevels = formOptions.hierarchyLevels;

        //for user sorting and filtering of records list, sets defaults
        $scope.sortType = '-last_mod_date';
        $scope.sortReverse = false;
        $scope.searchRecords = '';

        $scope.createNewRecord = function() {

            var freshISO = recordService.getFreshISORecord();

            $scope.newRecord = true;
            $scope.currentRecord = freshISO;

            //set geocode write-in box to be blank
            $scope.options.bboxInput ='';

            // iso data formats come from a pre-defined list to from ISO std
            $scope.dataFormats = {
              iso: [''],
              // aux, ie auxiliary, is a single text input write-in
              aux: ''
            };

            $scope.attachmentInfo = {
                newAttachment: ''
            };
        };

        // initialize form with placeholder data for creating a new record
        $scope.createNewRecord();

        $scope.createNewDublinRecord = function() {
            var freshDC = recordService.getFreshDCRecord();

            $scope.newRecord = true;
            $scope.currentRecord = freshDC;

            //set geocode write-in box to be blank
            $scope.options.bboxInput ='';

        };


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
            //set geocode write-in box to be Idaho
            $scope.options.bboxInput ='Idaho';
        };

        /**
         * Load NKN as the only data access contact
         */
        $scope.loadDefaultNKNAsDistributor = function () {

            var nknContact = recordService.getNKNAsDistributor();

            $scope.currentRecord.access[0] = nknContact;
        };


        /**
         * Load a record that from the server and display fields in form
         * @param  {string} recordId The server-generated ID
         */
        $scope.editRecord = function (recordId) {

            recordService.getRecordToEdit(recordId)
                .success(function (data) {
                    $scope.newRecord = false;

                    updateForms($scope, data.record);
                })
                .error(function (error) {
                    $scope.errors.push("Error in loading record to edit");
                });

             //set geocode write-in box to be blank
            $scope.options.bboxInput = '';
        };

        /**
         * On submit of metadata form, submitRecord. This both updates the server
         * and makes sure the form is current.
         */
        $scope.submitDraftRecord = function() {
	    if(!checkRequiredFields()){
		recordService.saveDraft($scope)
                    .success( function (data) {
			// need to update the sheet with the ID

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
	    }
        };

        /** Function to identify if the record is ISO or Dublin based on schema_type field
        used to execute same function but set condition before hand, using for Edit
        */

        $scope.isISO = function(schemaType){
            if (schemaType == 'Dataset (ISO)')
                return true;
            else
                return false;
        };

        /** Function to enable restriction on deleting published records.
        */

        $scope.isPublished = function(pubDate){
            if (pubDate > 0)
                return true;
            else
                return false;
        };

        /**
         * Delete a draft record.
         *
         */
        $scope.deleteById = function(recordId) {

            if ($scope.currentRecord._id !== undefined) {
                var currentRecordId = $scope.currentRecord._id.$oid;
            }

            // delete record, then if the currently loaded record's ID is
            // identical to the one deleted, clear form and re-initialize
            recordService.delete(recordId)
                .success( function (res) {
                    if (currentRecordId === recordId) {
                        $scope.createNewRecord();
                    }

                    $scope.updateRecordsList();
                })
                .error( function (res) {
                    $log.log('yo in erroring out');
                });
        };


        /**
         * Publish a record to the portal. Requires all fields to be valid
         */
        $scope.publishRecord = function() {

            recordService.publish($scope)
                .success( function (data) {

                    // why?
                    // updateForms(data.record);

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

        $scope.addedContacts =
        {
          'access': 0,
          'citation': 0
        };

        $scope.addContactCitation = function()
        {
            $scope.currentRecord.citation
                .push({
                    'name': '', 'email': '', 'org': '', 'address': '',
                    'city': '', 'state': '', 'zipcode': '',
                    'country': '', 'phone': ''
                }
            );

            $scope.addedContacts.citation += 1;
        };

        $scope.addContactAccess = function()
        {
            $scope.currentRecord.access
                .push({
                    'name': '', 'email': '', 'org': '', 'address': '',
                    'city': '', 'state': '', 'zipcode': '',
                    'country': '', 'phone': ''
                }
            );

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

        $scope.getBbox = function()
        {
            Geoprocessing.getBbox($scope.options.bboxInput)
                .success( function(data) {
                    $scope.currentRecord.north_lat = data.north;
                    $scope.currentRecord.south_lat = data.south;
                    $scope.currentRecord.east_lon = data.east;
                    $scope.currentRecord.west_lon = data.west;
                })
                .error( function(error) { $log.log(error); });
        };

        $scope.attachmentInfo = {
            newAttachment: ''
        };

        $scope.attachFile = function() {
            // first upload file, then in success callback, attach to record

            var file = $scope.attachmentInfo.newAttachment;

            // in order to attach files we need an identifier
            var recordId;
            if ($scope.currentRecord.hasOwnProperty('_id'))
            {
                recordId = $scope.currentRecord._id.$oid;
            }
            else
            {
                $scope.submitDraftRecord();
                recordId = $scope.currentRecord._id.$oid;
            }

            // if upload is successful, sync upload with the metadata
            AttachmentService.uploadFile(file, recordId)
                .success(function (data) {
                    var url = data.url;
                    AttachmentService.attachFile(url, recordId)
                        .success(function (attachData) {

                            $scope.currentRecord.attachments =
                                attachData.record.attachments;

                            $scope.updateRecordsList();
                        });
                });
        };

        $scope.detachFile = function(attachmentId) {

            // the attachmentId needs to be fetched from the attachments
            var recordId = $scope.currentRecord._id.$oid;

            AttachmentService.detachFile(attachmentId, recordId)
                .success(function (data) {
                    updateForms($scope, data.record);
                });
        };

	/* Check all inputs, selects, and textfields that are not 
	   optional to see if they have a value. If one does not have
	   a value, it has not been filled out.
	 */
	function checkRequiredFields(){
	    var missedFields = "";

	    for(var key in $scope.currentRecord){
		switch(key){
		case "title":
		case "summary":
   		case "update_frequency":
		case "status":
		case "hierarcy_level":
		case "place_keywords":
		case "thematic_keywords":
		case "use_restrictions":
		case "west_lon":
		case "east_lon":
		case "north_lat":
		case "south_lat":
		    missedFields = missedFields + "\n" + checkLength(key, $scope.currentRecord[key]);
		    break;

//		case "last_mod_date.date":
//		case "first_mod_date.date":
		    //		case "md_pub_date.date":
    		case "start_date":
		case "end_date":
		    missedFields = missedFields + "\n" + checkNull(key, $scope.currentRecord[key][0]);
		    break;

//		case "data_format":		    
//  		case "topic_category":
//		    missedFields = missedFields + "\n" + checkNull(key, $scope.currentRecord[key][0]);
//		    break;
		    
		case "citation":
		case "access":
		    for(var nestedKey in $scope.currentRecord[key][0]){
			missedFields = missedFields + "\n" + checkLength(nestedKey, $scope.currentRecord[key][0][nestedKey]);
		    }
		    break;
		default:
		    break;
		}
	    }
	    
	    if(missedFields.length > 0){
		window.alert("Please fill out the following form fields:\n " + missedFields);
		return true;
	    }

	    return false;
	};

	/* Translate key into more human readable format for alert window.
	   E.X.: data_format -> Data Format
	*/
	function translateKey(key){
	    var delimString = key.split("_");
	    var parsedString = "";
	    for(var i = 0; i < delimString.length; i++){
		switch(delimString[i]){
		case "org":
		    parsedString = parsedString + "organization ";
		    break;
		case "lat":
		    parsedString = parsedString + "latitude ";
		    break;
		case "lon":
		    parsedString = parsedString + "longitude ";
		    break;
		default:
		    parsedString = parsedString + delimString[i] + " ";
		}
	    }
	    return parsedString;
	};

	/* Check if variable length is 0 (initialized with string of 
	   length 0 in services.js). If so, display window alert with
	   variable name. 
	*/
	function checkLength(fieldName, field){
	    if(field.length == 0)
		return translateKey(fieldName);

	    return "";
	};
	/* Check if variable is null. If so, display window alert with
	   variable name. 
	*/
	function checkNull(fieldName, field){
	    if(field == null)
		return translateKey(fieldName);
	   
	    return "";
	};

	/* Click on element to simulate user clicking on element. Used for 
	   step-by-step description buttons in index.html. 
	 */
	$scope.clickOnElement = function(elementID){
	    $timeout(function(){
		angular.element(elementID).trigger('click');
	    });
	};

	//Functions to simulate steps in tutorial
	$scope.simulateStepOne = function(){
	    var second = 2000;
	    $timeout(function(){
		$scope.clickOnElement("#record-options-dropdown");
	    });

	    $timeout(function(){
		$scope.simulateHoverDataset = {'background-color':'#c2c2a3'};
	    }, 2000);

	    $timeout(function(){
		$scope.simulateHoverDataset = {'background-color':'#ffffff'};
	    }, second+=2000);

	    $timeout(function(){
		$scope.simulateHoverNonDataset = {'background-color':'#c2c2a3'};
	    }, second+=2000);

	    $timeout(function(){
		$scope.simulateHoverNonDataset = {'background-color':'#ffffff'};
	    }, second+=2000);

    	    $timeout(function(){
		$scope.clickOnElement("#record-options-dropdown");
	    }, second+=2000); 
	};

	$scope.simulateStepTwo = function(){
	    var second = 2000;
	    $timeout(function(){
		$scope.clickOnElement("#defaults-dropdown");
	    });

	    $timeout(function(){
		$scope.simulateHoverMiles = {'background-color':'#c2c2a3'};
	    }, second);

	    $timeout(function(){
		$scope.simulateHoverMiles = {'background-color':'#ffffff'};
	    }, second+=2000);

	    $timeout(function(){
		$scope.simulateHoverNKN = {'background-color':'#c2c2a3'};
	    }, second+=2000);

	    $timeout(function(){
		$scope.simulateHoverNKN = {'background-color':'#ffffff'};
	    }, second+=2000);

	    $timeout(function(){
		$scope.clickOnElement("#defaults-dropdown");
	    }, second+=2000); 
	};
	
	$scope.simulateStepThree = function(){
	    var second = 3000;
	    $location.hash("title-input");
	    $anchorScroll.yOffset = 400;
	    $anchorScroll();

	    $timeout(function(){
		$location.hash("title-input");
		$anchorScroll.yOffset = 260;
		$anchorScroll();
	    }, second);
	    
	    $timeout(function(){
		$scope.clickOnElement("#record-options-dropdown");
	    }, second+=4000);

	    $timeout(function(){
		$scope.simulateHoverSave = {'background-color':'#c2c2a3'};
	    }, second+=2000);

	    $timeout(function(){
		$scope.simulateHoverSave = {'background-color':'#ffffff'};
	    }, second+=2000);

	    $timeout(function(){
		$location.hash("step-three");
 		$anchorScroll();
		$scope.clickOnElement("#record-options-dropdown");
	    }, second+=2000); 
	};

	$scope.simulateStepFour = function(){
	    var second = 3000;
	    
	    $timeout(function(){
		$scope.clickOnElement("#record-options-dropdown");
	    });

	    $timeout(function(){
		$scope.simulateHoverSave = {'background-color':'#c2c2a3'};
	    }, second);

	    $timeout(function(){
		$scope.simulateHoverSave = {'background-color':'#ffffff'};
	    }, second+=2000);

	    $timeout(function(){
		$scope.clickOnElement("#record-options-dropdown");
	    }, second+=2000); 
	};

	$scope.simulateStepFive = function(){
	    var second = 3000;
	    $timeout(function(){
		$scope.clickOnElement("#record-options-dropdown");
	    });

	    $timeout(function(){
		$scope.simulateHoverPublish = {'background-color':'#c2c2a3'};
	    }, second);

	    $timeout(function(){
		$scope.simulateHoverPublish = {'background-color':'#ffffff'};
	    }, second+=2000);

    	    $timeout(function(){
		$scope.clickOnElement("#record-options-dropdown");
	    }, second+=2000); 
	};

	$scope.simulateTips = function(){

	    $timeout(function(){
		$scope.clickOnElement("#load-delete-record-dropdown");
	    });

	    $timeout(function(){
		$scope.clickOnElement("#load-delete-record-dropdown");
	    }, 5000);
	};
  } // end of callback for controller initialization
])
.controller('ISOController', ['formOptions', function(formOptions) {
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
.controller('MapController',function($scope, $compile, NgMap)
  {
    var vm = this;
    vm.ne, vm.sw, vm.center;
    NgMap.getMap().then(function(map) {
        vm.map = map;
        if (vm.ne !== undefined)
        {
            $scope.currentRecord.north_lat = vm.ne.lat();
            $scope.currentRecord.south_lat = vm.sw.lat();
            $scope.currentRecord.east_lon = vm.ne.lng();
            $scope.currentRecord.west_lon = vm.sw.lng();
        }
  });
    vm.boundsChanged = function() {
        vm.ne = this.getBounds().getNorthEast();
        vm.sw = this.getBounds().getSouthWest();
        vm.center = this.getBounds().getCenter();
        vm.map.setCenter(vm.center);
        vm.map.fitBounds(this.getBounds());
        $scope.currentRecord.north_lat = vm.ne.lat();
        $scope.currentRecord.south_lat = vm.sw.lat();
        $scope.currentRecord.east_lon = vm.ne.lng();
        $scope.currentRecord.west_lon = vm.sw.lng();
    };
});
