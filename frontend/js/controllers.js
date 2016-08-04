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
	
	$scope.reviewFields = function(value){
	    console.log("Printing value in reviewFields: " + value);

	    if(Array.isArray(value)){
		if(typeof value[0] === 'object'){ 		
		    var totalString = "";
		    var response = "";
		    for(var i = 0; i < value.length; i++){
			var iterationString = "";
			
			for(var key in value[i]){
			    if((key != null) && (value[i][key] != null)){
				response = checkLength(key) + " : " + checkLength(value[i][key]) + " | ";
			    }else{
				response = checkNull(key) + " : " + checkNull(value[i][key]) + " | ";
			    }
			    iterationString = iterationString + response;
			}
			totalString = totalString + iterationString;
		    }
		}
		    return value + " : " + totalString;
	    }
	    
		
	    if(typeof value === 'object'){
		var totalString = "";
		for(key in value){
		    console.log("Printing object's attributes!!!! <<<<<<>>>>>>>>>>>>>>>>> " + key + " : " + value[key]);
		    if(typeof value[key] === 'number')
			totalString = totalString + key + " : " + value[key].toString() + " | ";
		    else
			totalString = totalString + key + " : " + value[key] + " | ";
		}
	    }
	    
	    if(typeof value === 'number'){
		return value.toString();
	    }
	    else if(value != null){
		var response = checkLength(value);
		return response;
	    }else{
		var response = checkNull(value);
		return response;
	    }

/*
	    
	    switch(value){
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
		if(value){
		    var response = checkLength(value);
		    return response;
		}else{
		    var response = checkNull(value);
		    return response;
		}
		break;
		
    	    case "start_date":
	    case "end_date":
		for(var nestedKey in $scope.currentRecord[value]){
		    if($scope.currentRecord[value][nestedKey] != null){
			var response = checkLength(value);
			return response;
		    }else{
			var response = checkNull(value);
			return response;
		    }
		}
		break;
		
	    case "data_format":
		//check $scope.dataFormats: text input isn't bound to currentRecord
		//Two possibilities: dataFormats.iso[] or dataFormats.aux (string).
		//If one is filled out, do not check the other (mutally exclusive).
		if(value != null){
		    var response = checkLength(value);
		    if(response.length > 0)
			return response;
		}else{
		    var response = checkNull(value);
		    if(response.length > 0)
			return response;
		}
		
		//Check aux definition too (from text input of other values)
		if($scope.dataFormats.iso.length == 0){
		    if($scope.dataFormats.aux != null){
			var response = checkLength(value);
			if(response.length > 0){
			    return response;
			}
		    }else{
			var response = checkNull(value);
			if(response.length > 0){
			    return response;
			}
		    }
		}
		
		
		break;
		
  	    case "topic_category":
		if($scope.currentRecord[key][0] != null){
		    var response = checkLength(value);
		    if(response.length > 0)
			return response;
		}else{
		    var response = checkNull(value);
		    if(response.length > 0)
			return response;
		}
		break;
		
	    case "citation":
	    case "access":
		for(var nestedKey in $scope.currentRecord[key][0]){
		    if($scope.currentRecord[key][0][nestedKey] != null){
			var response = checkLength(value);
			if(response.length > 0)
			    return response;
		    }else{
			var response = checkNull(value);
			if(response.length > 0)
			    return response;
		    }
		}
		break;
	    default:
		return '';
		break;
	    }
*/
	 
	}
    

		/* Translate key into more human readable format for alert window.
		   E.X.: data_format -> Data Format
		*/
	function translateKey(key){
	    key = key + "";
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
		function checkLength(fieldName){
		    if(fieldName.length > 0)
			return translateKey(fieldName);

		    return "";
		};
		/* Check if variable is null. If so, display window alert with
		   variable name. 
		*/
	function checkNull(fieldName){
		    if(fieldName != null)
			return translateKey(fieldName);
		    
		    return "";
	};
	/* Click on element to simulate user clicking on element. Used for 
	   step-by-step description buttons in index.html. 
	 */
	$scope.clickOnElement = function(elementID){
	    $timeout(function(){
		angular.element(document).find(elementID).trigger('click');
	    });
	};

	//Sets form to Iso or Dublin core by modifying address path to either /iso or /dublin
	$scope.formType;
	$scope.setFormType = function(type) {
	    if(type == "iso"){
		$location.path("/iso");
		$scope.createNewRecord();
	    }
	    else if(type == "dublin"){
		$location.path("/dublin");
		$scope.createNewDublinRecord();
	    }
	    else
		console.log("Error: tried to set path to unsupported url.");
	}

	$scope.hasSpatialData = false;
	$scope.setSpatialForm = function(buttonName, buttonLabel) {
	    $scope.hasSpatialData = !$scope.hasSpatialData;
	    if($scope.hasSpatialData){
		addDublinButton(buttonName, buttonLabel);
	    }
	    else{
		removeDublinButton(buttonName);
	    }
	}

	//Request either DOI or ARK: sets currentRecord.doi_ark_request to either "DOI", "ARK", or "".
	$scope.applyForDOI = function(type) {
	    if(type == "DOI"){
		$scope.currentRecord.doi_ark_request = type;
	    }else if(type == "ARK"){
		$scope.currentRecord.doi_ark_request = type;
	    }else if(type == "neither"){
		$scope.currentRecord.doi_ark_request = '';
	    }else{
		console.log("Error: tried to set DOI/ARK request to unsupported value: options are DOI/ARK");
	    }
	}

	$scope.searchableOnDataOne = false;
	
	//Initialize form variables to currentRecord values
	$scope.checkSearchableDataOne = function() {
	    //Initialize variable to current record variable for searchable on DataOne 
	    if($scope.currentRecord.data_one_search.localeCompare("true")){
		$scope.searchableOnDataOne = true;
		return true;
	    }
	    else if($scope.currentRecord.data_one_search.localeCompare("false")){
		$scope.searchableOnDataOne = false;
		return false;
	    }
	    else if($scope.currentRecord.data_one_search.localeCompare("")){
		$scope.searchableOnDataOne = false;
		return false;
	    }
	    else{
		console.log("Error: $scope.currentRecord.data_one_search set to a string other than \"true\" or \"false\".");
		$scope.searchableOnDataOne = false;
		return false;
	    }
	}
	
	function toggleSearchableDataOne(){
	    $scope.searchableOnDataOne = !$scope.searchableOnDataOne;
	}
	
	$scope.setSearchableDataOne = function() {
	    toggleSearchableDataOne();
	    $scope.currentRecord.data_one_search = $scope.searchableOnDataOne.toString();
	    return $scope.searchableOnDataOne
	}


	$scope.agreeTermsConditions = false;
	//Sets boolean variable to see if terms and conditions have been read and agreed to.
	$scope.setTermsAndConditions = function() {
	    $scope.agreeTermsConditions = !$scope.agreeTermsConditions;
	}

	$scope.rightToPublish = false;
	//Sets boolean variable that demonstrates the author has the right to publish this material.
	$scope.setRightToPublish = function() {
	    $scope.rightToPublish = !$scope.rightToPublish; 
	}

	$scope.containsSensitiveInformation = true;
	//Sets boolean value to see if metadata being submitted has sensitive information.
	$scope.setSensitiveInformation = function() {
	    $scope.containsSensitiveInformation = !$scope.containsSensitiveInformation;
	}
	
	//List to populate buttons for ISO. ISO has more default form
	//fields than Dublin.
	$scope.isoFormList = [];
 	var isoInitializer = [
	    "form.setup,Template Setup",
	    "form.basic,Basic Information",
	    "form.detailed,Detailed Information",
	    "form.dataFormats,Data Formats",
	    "form.onlineResourcesAndRestrictions,Online Resources",
	    "form.temporalExtent,Temporal Data",
	    "form.spatialExtent,Spatial Data",
	    "form.contacts,Contacts",
	    "form.fileUpload,Upload File",
	    "form.requestDOI,Request DOI/ARK",
	    "form.otherOptions,Other Options",
	    "form.disclaimer,Disclaimer",
	    "form.review,Review"
	];

	for(var i = 0; i < isoInitializer.length; i++){
	    console.log("Adding isoFormList " + i);
	    var dublinButton = recordService.getFreshDublinFormList();
	    var data = isoInitializer[i].split(",");
	    dublinButton.form_name = data[0];
	    dublinButton.label = data[1];
	    $scope.isoFormList.push(dublinButton);
	}
	
	//List to populate possible buttons for dublin core form wizard.
	//String has two values split at the "," value that are both put in
	//the "dublinButton" object from the services.js file.
	$scope.dublinFormList = [];
 	var dublinInitializer = [
	    "dublinForm.setup,Template Setup",
	    "dublinForm.basic,Basic Information",
	    "dublinForm.detailed,Detailed Information",
	    "dublinForm.dataFormats,Data Formats",
	    "dublinForm.onlineResourcesAndRestrictions,Online Resources",
	    "dublinForm.temporalExtent,Temporal Data",
	    "dublinForm.contacts,Contacts",
	    "dublinForm.fileUpload,Upload File",
	    "dublinForm.requestDOI,Request DOI/ARK",
	    "dublinForm.otherOptions,Other Options",
	    "dublinForm.disclaimer,Disclaimer",
	    "dublinForm.review,Review"
	];

	for(var i = 0; i < dublinInitializer.length; i++){
	    console.log("Adding formList " + i);
	    var dublinButton = recordService.getFreshDublinFormList();
	    var data = dublinInitializer[i].split(",");
	    dublinButton.form_name = data[0];
	    dublinButton.label = data[1];
	    $scope.dublinFormList.push(dublinButton);
	}

	function addDublinButton(buttonName, buttonLabel){
	    var dublinButton = recordService.getFreshDublinFormList();
	    dublinButton.form_name = buttonName;
	    dublinButton.label = buttonLabel;
	    //Swap last element in array with new element (last element is review step)
	    var reviewStep = $scope.dublinFormList.pop();
	    $scope.dublinFormList.push(dublinButton);
	    $scope.dublinFormList.push(reviewStep);
	}

	function removeDublinButton(buttonName){
	    for(var i = 0; i < $scope.dublinFormList.length; i++){
		if($scope.dublinFormList[i].form_name == buttonName){
		    for(var j = i; j < $scope.dublinFormList.length-1; j++){
			$scope.dublinFormList[j] = $scope.dublinFormList[j+1];
		    }
		    //Remove last list element
		    $scope.dublinFormList.pop();
		}
	    }
	}
	
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
/*

    .controller('dublinFormButtonController', function($scope, recordService) {
	console.log("In dublin controller: ");
	$scope.formList = [];
	var initializer = [
	    "form.setup,Template Setup",
	    "form.basic,Basic Information",
	    "form.detailed,Detailed Information",
	    "form.dataFormats,Data Formats",
	    "form.onlineResourcesAndRestrictions,Online Resources",
	    "form.spatialExtent,Spatial Data",
	    "form.temporalExtent,Temporal Data",
	    "form.contacts,Contacts",
	    "form.review,Review"
	];

	for(var i = 0; i < initializer.length; i++){
	    console.log("Adding formList " + i);
	    var dublinButton = recordService.getFreshDublinFormList();
	    var data = initializer[i].split(",");
	    dublinButton.form_name = data[0];
	    dublinButton.label = data[1];
	    $scope.formList.push(dublinButton);
	}
	
    });
*/
