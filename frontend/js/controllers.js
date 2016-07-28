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
	$scope.attachFileDiv;

	//Scope variable used to store remaining blank form field names
	$scope.checkFormComplete = [];

	//Scope variable used to show side bar
	$scope.sidebarWidth = {'width' : '0%'};

	//Scope variables for opening and closing side nav
	$scope.openSideNav;
	$scope.closeSideNav;

	$scope.setNavbar;
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
	
		$scope.checkRequiredFields = function(){
		    var missedFields = [];
		    var count = 0;
		    for(var key in $scope.currentRecord){
			switch(key){
			case "title":
			case "summary":
   			case "update_frequency":
			case "status":
			case "hierarchy_level":
			case "place_keywords":
			case "thematic_keywords":
			case "use_restrictions":
			case "west_lon":
			case "east_lon":
			case "north_lat":
			case "south_lat":
			case "spatial_dtype":
			    if($scope.currentRecord[key] != null){
				var response = checkLength(key, $scope.currentRecord[key]);
				if(response.length > 0)
				    missedFields[count] = response;
			    }else{
				var response = checkNull(key, $scope.currentRecord[key]);
				if(response.length > 0)
				    missedFields[count] = response;
			    }
			    count++;
			    break;

    			case "start_date":
			case "end_date":
			    for(var nestedKey in $scope.currentRecord[key]){
				if($scope.currentRecord[key][nestedKey] != null){
				    var response = checkLength(key, $scope.currentRecord[key][nestedKey]);
				    if(response.length > 0)
					missedFields[count] = response;
				}else{
				    var response = checkNull(key, $scope.currentRecord[key][nestedKey]);
				    if(response.length > 0)
					missedFields[count] = response;
				}
			    }
			    count++;
			    break;

			case "data_format":
			    //check $scope.dataFormats: text input isn't bound to currentRecord
			    //Two possibilities: dataFormats.iso[] or dataFormats.aux (string).
			    //If one is filled out, do not check the other (mutally exclusive).
			    if($scope.dataFormats.aux.length == 0){
				for(var i = 0; i < $scope.dataFormats.iso.length; i++){
		    		    if($scope.dataFormats.iso[i] != null){
					var response = checkLength(key, $scope.dataFormats.iso[i]);
					if(response.length > 0)
					    missedFields[count] = response;
				    }else{
					var response = checkNull(key, $scope.dataFormats.iso[i]);
					if(response.length > 0)
					    missedFields[count] = response;
				    }
				    count++;
				}
			    }
			    //Check aux definition too (from text input of other values)
			    if($scope.dataFormats.iso.length == 0){
				if($scope.dataFormats.aux != null){
				    var response = checkLength(key, $scope.dataFormats.aux);
				    if(response.length > 0){
					missedFields[count] = response;
					count++;
				    }
				}else{
				    var response = checkNull(key, $scope.dataFormats.aux);
				    if(response.length > 0){
					missedFields[count] = response;
					count++;
				    }
				}
			    }

			    
			    break;
			    
  			case "topic_category":
			    if($scope.currentRecord[key][0] != null){
				var response = checkLength(key, $scope.currentRecord[key][0]);
				if(response.length > 0)
				    missedFields[count] = response;
			    }else{
				var response = checkNull(key, $scope.currentRecord[key][0]);
				if(response.length > 0)
				    missedFields[count] = response;
			    }
			    count++;
			    break;
			    
			case "citation":
			case "access":
			    for(var nestedKey in $scope.currentRecord[key][0]){
				if($scope.currentRecord[key][0][nestedKey] != null){
				    var response = checkLength(nestedKey, $scope.currentRecord[key][0][nestedKey]);
				    if(response.length > 0)
					missedFields[count] = response;

				    count++;
				}else{
				    var response = checkNull(nestedKey, $scope.currentRecord[key][0][nestedKey]);
				    if(response.length > 0)
					missedFields[count] = response;

				    count++;
				}
			    }
			    break;
			default:
			    //Do nothing
			    break;
			}
		    }

		    $scope.checkFormComplete = missedFields;
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
			case "spatial":
			    parsedString = parsedString + "data ";
			    break;
			case "dtype":
			    parsedString = parsedString + "type";
			    break;
			case "status":
			    parsedString = parsedString + "update ";
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
	    var delay = 2000;

	    //Scroll to "Basic Information" section to show user where form
	    //element is.
	    $location.hash("navbar");
	    $anchorScroll.yOffset = 0;
	    $anchorScroll();

	    //Click on Record Options dropdown list
	    $timeout(function(){
		$scope.clickOnElement("#record-options-dropdown");
	    }, delay);

	    //Simulate hovering on "Create New Dataset" by changing background color of element
	    //to grey for 2 seconds.
	    $timeout(function(){
		$scope.simulateHoverDataset = {'background-color':'#c2c2a3'};
	    }, delay+=2000);

	    //Change background color of "Create New Dataset" back to white
	    //to end "hover."
	    $timeout(function(){
		$scope.simulateHoverDataset = {'background-color':'#ffffff'};
	    }, delay+=2000);

	    //Simulate hover on "Create new Non-Dataset Record" element by changing
	    //background color to grey for 2 seconds.
	    $timeout(function(){
		$scope.simulateHoverNonDataset = {'background-color':'#c2c2a3'};
	    }, delay+=2000);

	    //Change background color of "Create New Non-Dataset Record" element
	    //back to white.
	    $timeout(function(){
		$scope.simulateHoverNonDataset = {'background-color':'#ffffff'};
	    }, delay+=2000);

	    //Scroll to "Step 1" button and click on "Record Options" dropdown again to hide it.
    	    $timeout(function(){
		$location.hash("step-one");
 		$anchorScroll();
		$scope.clickOnElement("#record-options-dropdown");
	    }, delay+=2000); 
	};

	$scope.simulateStepTwo = function(){
	    var delay = 2000;

	    $location.hash("navbar");
	    $anchorScroll.yOffset = 0;
	    $anchorScroll();

	    //Click on "Load Defaults" dropdown menu
	    $timeout(function(){
		$scope.clickOnElement("#defaults-dropdown");
	    },delay);

	    //Simulate hovering effect on "MILES" and "NKN as Data Manager" elements
	    //of dropdown list by changing background of respective elements to grey,
	    //then back to white after delay. 
	    $timeout(function(){
		$scope.simulateHoverMiles = {'background-color':'#c2c2a3'};
	    }, delay+=2000);

	    $timeout(function(){
		$scope.simulateHoverMiles = {'background-color':'#ffffff'};
	    }, delay+=2000);

	    $timeout(function(){
		$scope.simulateHoverNKN = {'background-color':'#c2c2a3'};
	    }, delay+=2000);

	    $timeout(function(){
		$scope.simulateHoverNKN = {'background-color':'#ffffff'};
	    }, delay+=2000);

	    //Click on "Load Defaults" again to hide dropdown list.
	    $timeout(function(){
		$location.hash("step-two");
 		$anchorScroll();
		$scope.clickOnElement("#defaults-dropdown");
	    }, delay+=2000); 
	};
	
	$scope.simulateStepThree = function(){
	    var delay = 2000;

	    //Scroll to navbar
	    $location.hash("navbar");
	    $anchorScroll.yOffset = 0;
	    $anchorScroll();

	    //Scroll to "Basic Information" section to show user where form
	    //element is.
	    $timeout(function(){
		$location.hash("title-input");
		$anchorScroll.yOffset = 350;
		$anchorScroll();
	    }, delay);
	    
	    //Scroll to "title" input after 3 second delay.
	    $timeout(function(){
		$location.hash("title-input");
		$anchorScroll.yOffset = 230;
		$anchorScroll();
	    }, delay+=3000);

	    //Click on "Record Options" dropdown list again to
	    //show user where to save.
	    $timeout(function(){
		$scope.clickOnElement("#record-options-dropdown");
	    }, delay+=5000);

	    //Simulate hovering effect on "Save this record as draft"element
	    //of dropdown list by changing background of element to grey,
	    //then back to white after delay. 
	    $timeout(function(){
		$scope.simulateHoverSave = {'background-color':'#c2c2a3'};
	    }, delay+=2000);

	    $timeout(function(){
		$scope.simulateHoverSave = {'background-color':'#ffffff'};
	    }, delay+=2000);

	    //Scroll back to "Step 3" button at top of page so user
	    //can continue with tutorial.
	    $timeout(function(){
		$location.hash("step-three");
 		$anchorScroll();
		$scope.clickOnElement("#record-options-dropdown");
	    }, delay+=2000); 
	};

	$scope.simulateStepFour = function(){
	    var delay = 3000;
	    $scope.setNavbar = {'position':'fixed', 'top':'0px', 'width':'100%'};
			
	    //Scroll to the "Attach file" section of the form
	    $timeout(function(){
		$location.hash("attachment-header");
		$anchorScroll.yOffset = 75;
 		$anchorScroll();
	    }); 

	    //Highlight attach file section by
	    //changing background of attach file section to grey,
	    //then back to white after delay. 
	    $timeout(function(){
		$scope.attachFileDiv = {'background-color':'#c2c2a3'};
	    }, delay);
	    
	    $timeout(function(){
		$scope.attachFileDiv = {'background-color':'#FFFFFF'};
	    }, delay+=3000); 

	    //Click on "Record Options" dropdown list to show list elements.
	    $timeout(function(){
		$scope.clickOnElement("#record-options-dropdown");
	    }, delay+=3000);

	    //Simulate hovering effect on "Save this record as a draft" elements
	    //of dropdown list by changing background of element to grey,
	    //then back to white after delay. 
	    $timeout(function(){
		$scope.simulateHoverSave = {'background-color':'#c2c2a3'};
	    }, delay+=3000);

	    $timeout(function(){
		$scope.simulateHoverSave = {'background-color':'#ffffff'};
	    }, delay+=2000);

	    //Scroll back to "Step 4" button so user can continue with tutorial.
	    $timeout(function(){
		$scope.setNavbar = {};
		$location.hash("step-four");
 		$anchorScroll();
		$scope.clickOnElement("#record-options-dropdown");
	    }, delay+=2000); 
	};

	$scope.simulateStepFive = function(){
	    var delay = 3000;
	    $timeout(function(){
		$location.hash("navbar");
		$anchorScroll.yOffset = 0;
		$anchorScroll();
	    });
	    //Click on "Record Options" dropdown list to show list elements.
	    $timeout(function(){
		$scope.clickOnElement("#record-options-dropdown");
	    }, delay);
	    
	    //Simulate hovering effect on publish/please complete element
	    //of dropdown list by changing background of element to grey,
	    //then back to white after delay. 
	    $timeout(function(){
		$scope.simulateHoverPublish = {'background-color':'#c2c2a3'};
	    }, delay+=2000);

	    $timeout(function(){
		$scope.simulateHoverPublish = {'background-color':'#ffffff'};
	    }, delay+=2000);

	    //Click on "Record Options" dropdown list to hide it.
    	    $timeout(function(){
		$location.hash("step-five");
 		$anchorScroll();
		$scope.clickOnElement("#record-options-dropdown");
	    }, delay+=2000); 
	};

	$scope.simulateTips = function(){
	    var delay = 2000;
	    $timeout(function(){
		$location.hash("navbar");
		$anchorScroll.yOffset = 0;
		$anchorScroll();
	    }, delay);
	    //Click on "My Records" to expose drop down list
	    $timeout(function(){
		$scope.clickOnElement("#load-delete-record-dropdown");
	    }, delay+=2000);

	    //After 5 second delay, click on "My Records" again to
	    //hide list.
	    $timeout(function(){
		$scope.clickOnElement("#load-delete-record-dropdown");
	    }, delay+=5000);

	    //Click on "View XML as" to expose drop down list
	    $timeout(function(){
		$scope.clickOnElement("#export-dropdown");
	    }, delay+=2000);

	    //Click on "View XML as" again to hide list.
	    $timeout(function(){
		$scope.clickOnElement("#export-dropdown");
	    }, delay+=5000);

	    //Return to steps area
	    $timeout(function(){
		$location.hash("step-tips");
 		$anchorScroll();
	    }, delay+=2000); 
	
	};
    
	//Open side nav
	$scope.openSideNav = function() {
	    $scope.sidebarWidth = {'width' : '15%'};
	};

	//Close side nav
	$scope.closeSideNav = function() {
	    $scope.sidebarWidth = {'width' : '0%'};
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
      $scope.options;
      
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
