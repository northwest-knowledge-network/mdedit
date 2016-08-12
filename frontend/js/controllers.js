'use strict';


// for minification, explicitly declare dependencies $scope and $http
metadataEditorApp.controller('BaseController',
    ['$scope', '$http', '$log', '$window', '$timeout', '$location', '$state', 'formOptions', 'updateForms', 'recordService',
     'AttachmentService', 'Geoprocessing', 'hostname', 'session_id', 'partialsPrefix',
     
     function($scope, $http, $log, $window, $timeout, $location, $state, formOptions, updateForms,
        recordService, AttachmentService, Geoprocessing, hostname, session_id,
        partialsPrefix)
    {
        // initialize list of existing metadata records
        $scope.allRecords = [];

        $scope.options = {};

	//Scope variables to check if user has read terms & conditions
	$scope.agreeTermsConditions = false;
	//Scope variable to check if user has right to publish 
	$scope.rightToPublish = false;
	//Scope varialble to check if record does not contain sensitive information
	$scope.noSensitiveInformation = false;

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

	    //Set scope variables to initial values that are use for form completion
	    initScopeValues();
        };

        // initialize form with placeholder data for creating a new record
        $scope.createNewRecord();

        $scope.createNewDublinRecord = function() {
            var freshDC = recordService.getFreshDCRecord();

            $scope.newRecord = true;
            $scope.currentRecord = freshDC;

            //set geocode write-in box to be blank
            $scope.options.bboxInput ='';

	    //Set scope variables to initial values that are use for form completion
	    initScopeValues();
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

	    //Reset scope variables used in disclaimer.html checkboxes
	    initScopeValues();
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
				if((key.length != 0) && (value[i][key].length != 0))
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

	function initScopeValues(){
	    $scope.agreeTermsConditions = false;
	    $scope.rightToPublish = false;
	    $scope.noSensitiveInformation = false;
	}

	//Sets boolean variable to see if terms and conditions have been read and agreed to.
	$scope.setTermsAndConditions = function() {
	    $scope.agreeTermsConditions = !$scope.agreeTermsConditions;
	    return $scope.agreeTermsConditions;
	}

	//Sets boolean variable that demonstrates the author has the right to publish this material.
	$scope.setRightToPublish = function() {
	    $scope.rightToPublish = !$scope.rightToPublish;
	    return $scope.rightToPublish;
	}

	//Sets boolean value to see if metadata being submitted has sensitive information.
	$scope.setSensitiveInformation = function() {
	    $scope.noSensitiveInformation = !$scope.noSensitiveInformation;
	    return $scope.noSensitiveInformation;
	}
	
	//List to populate buttons for ISO. ISO has more default form
	//fields than Dublin.
	$scope.isoFormList = [];
	var isoButtonList = [];
 	var isoButtonInit = [
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

	for(var i = 0; i < isoButtonInit.length; i++){
	    console.log("Adding isoFormList " + i);
	    var scopeButton = recordService.getFreshFormElement();
	    var data = isoButtonInit[i].split(",");
	    scopeButton.form_name = data[0];
	    scopeButton.label = data[1];
	    
	    var buttonName = data[0];

	    //Add button object to Scope list and string to controller list
	    $scope.isoFormList.push(scopeButton);
	    isoButtonList.push(buttonName);
	}
	
	//List to populate possible buttons for dublin core form wizard.
	//String has two values split at the "," value that are both put in
	//the "dublinButton" object from the services.js file.
	$scope.dublinFormList = [];
	var dublinButtonList = [];
 	var dublinButtonInit = [
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

	for(var i = 0; i < dublinButtonInit.length; i++){
	    console.log("Adding formList " + i);
	    var scopeButton = recordService.getFreshFormElement();
	    var data = dublinButtonInit[i].split(",");
	    
	    scopeButton.form_name = data[0];
	    scopeButton.label = data[1];

	    var buttonName = data[0];

	    //Push buttons onto controller and scope lists
	    $scope.dublinFormList.push(scopeButton);
	    dublinButtonList.push(buttonName);
	}

	function addDublinButton(buttonName, buttonLabel){
	    var dublinButton = recordService.getFreshFormElement();
	    dublinButton.form_name = buttonName;
	    dublinButton.label = buttonLabel;
	    //Swap last element in array with new element (last element is review step)
	    var reviewStep = $scope.dublinFormList.pop();
	    $scope.dublinFormList.push(dublinButton);
	    $scope.dublinFormList.push(reviewStep);

	    //Add same button to dublinIntializer because we need this list for use in the controller (cant use $scope in controller)
	    var reviewStepString = dublinButtonList.pop();
	    dublinButtonList.push(dublinButton.form_name);
	    dublinButtonList.push(reviewStepString);
	    
	}

	function removeDublinButton(buttonName){
	    for(var i = 0; i < $scope.dublinFormList.length; i++){
		if($scope.dublinFormList[i].form_name == buttonName){
		    for(var j = i; j < $scope.dublinFormList.length-1; j++){
			$scope.dublinFormList[j] = $scope.dublinFormList[j+1];
			dublinButtonList[j] = dublinButtonList[j+1];
		    }
		    //Remove last list element
		    $scope.dublinFormList.pop();
		    dublinButtonList.pop();
		}
	    }
	}

	//Jump to page (state) and set currentPageIndex to page index to keep arrow buttons and button list indecies the same. 
	$scope.jumpToPage = function(index, formType) {
	    if(formType == 'iso'){
		//Check index against array bounds
		if((index >= 0) || (index < isoButtonList.length)){
		    $state.go(isoButtonList[index]);
		    currentPageIndex = index;

		    //Set selected page's button to blue
		    $scope.isoFormList[index].buttonStyle = {"background-color": "#00BC8C"};
		}
	    }else if(formType == 'dublin'){
		//Check index against array bounds
		if((index >= 0) || (index < isoButtonList.length)){
		    $state.go(dublinButtonList[index]);
		    currentPageIndex = index;
		    
		    //Set selected page's button to green
		    $scope.dublinFormList[index].buttonStyle = {"background-color": "#00BC8C"};
		}
	    }else
		console.log("Tried to index non-supported record type.");
	}

	$scope.resetBackground = function(formType) {
	    if(formType == 'iso'){
		$scope.isoFormList[currentPageIndex].buttonStyle = {};
	    }else if(formType == 'dublin'){
		$scope.dublinFormList[currentPageIndex].buttonStyle = {};
	    }else
		console.log("Error: tried to reset background color of button of unsupported form type.");
	}

	$scope.checkFormComplete = function(formName, formType){
	    checkFormPartial(formName, formType);
	}


	//Checks to see if visited form section has been completed. If not, then turns corresponding form button red
	function checkFormPartial(formName, formType){
	    var formComplete = true;

	    //Get part of form name after "." in name. EX: "form.detailed" returns "detailed".
	    //var parsedName = formName.split(".")[1];
	    var parsedName = "";
	    
	    if(formType == 'iso')
		parsedName = isoButtonList[currentPageIndex].split(".")[1];
	    else if(formType == 'dublin')
		parsedName = dublinButtonList[currentPageIndex].split(".")[1];


	    console.log("Printing current page: " + parsedName);
	    switch(parsedName){
	    case "setup":
		break;
	    case "basic":
		//Check if user has filled out fields on "Basic Information"
		if(($scope.currentRecord.title == null)
		   || ($scope.currentRecord.summary == null)
		   || ($scope.currentRecord.first_pub_date == null)){

		    formComplete = false;
		    break;
		}
		if(($scope.currentRecord.title.length == 0)
		   || ($scope.currentRecord.summary.length == 0)
		   || ($scope.currentRecord.first_pub_date == 0)){
		    formComplete = false;
		}
		
		break;
	    case "detailed":
		//Check if user has filled out fields on "Detailed Information"
		if(($scope.currentRecord.place_keywords == null)
		   || ($scope.currentRecord.thematic_keywords == null)
		   || ($scope.currentRecord.topic_category[0] == null)){
		    formComplete = false;
		    break;
		}
		
		if(($scope.currentRecord.place_keywords.length == 0)
		   || ($scope.currentRecord.thematic_keywords.length == 0)
		   ||($scope.currentRecord.topic_category[0].length == 0))
		    formComplete = false;
		
		break;
	    case "dataFormats":
		//Check if user has specified data format yet.
		if($scope.currentRecord.data_format == null){
		    formComplete = false;
		    break;
		}
		
		if($scope.currentRecord.data_format.length == 0)
		    formComplete = false;
		break;

	    case "onlineResourcesAndRestrictions":
		//Check if user has specified a "Use Restriction" yet.
		if($scope.currentRecord.use_restrictions == null){
		    formComplete = false;
		    break;
		}
		
		if($scope.currentRecord.use_restrictions.length == 0)
		    formComplete = false;
		break;
	    case "spatialExtent":
		//Check if any of the spacial variables have been set by user
		if(($scope.currentRecord.west_lon == null)
		   || ($scope.currentRecord.east_lon == null)
		   || ($scope.currentRecord.north_lat == null)
		   || ($scope.currentRecord.south_lat == null)){
		    formComplete = false;
		    break;
		}
		
		if(($scope.currentRecord.west_lon.length == 0)
		   || ($scope.currentRecord.east_lon.length == 0)
		   || ($scope.currentRecord.north_lat.length == 0)
		   || ($scope.currentRecord.south_lat.length == 0))
		    formComplete = false;
		break;
	    case "temporalExtent":
		if(($scope.currentRecord.start_date == null)
		   || ($scope.currentRecord.end_date == null)){
		    formComplete = false;
		    break;
		}
		
		if(($scope.currentRecord.start_date.length == 0)
		   || ($scope.currentRecord.end_date.length == 0))
		    formComplete = false;
		break;
	    case "review":
		break;
	    case "fileUpload":
		//Check if any files have been uploaded
		if($scope.currentRecord.attachments.length == null){
		    formComplete = false;
		    break;
		}
		
		if($scope.currentRecord.attachments.length == 0)
		    formComplete = false;
		break;
	    case "requestDOI":
		//Check if the user has specified DOI, ARK, or neither via the radio buttons 
		if($scope.currentRecord.doi_ark_request == null){
		    formComplete = false;
		    break;
		}
		
		if($scope.currentRecord.doi_ark_request.length == 0)
		    formComplete = false;
		break;
	    case "disclaimer":
		//Check to see user has agreed to terms, record does not have sensitive information,
		//and the the user has the right to publish.
		console.log("Printing booleans: " + $scope.agreeTermsConditions + " : " + $scope.noSensitiveInformation + " : " + $scope.rightToPublish);
		if(($scope.agreeTermsConditions == false)
		   || ($scope.noSensitiveInformation == false)
		   || ($scope.rightToPublish == false))
		    formComplete = false;
		break;
	    case "otherOptions":
		//Check to see if search on data one boolean value is set in
		//currentRecord yet. 
 		if($scope.currentRecord.data_one_search == null){
		    formComplete = false;
		    break;
		}
		if($scope.currentRecord.data_one_search.length == 0)
		    formComplete = false;
		break;
	    case "contacts":
		//Loop through each "Data Contacts" and "Data Access Contacts" block
		//and check if form elements are filled in.
		for(var i = 0; i < $scope.currentRecord.citation.length; i++){
		    for(var key in $scope.currentRecord.citation[i]){
			if($scope.currentRecord.citation[i][key] != null){
			    if($scope.currentRecord.citation[i][key].length == 0)
				formComplete = false;
			}else{
			    
			    formComplete = false;

			}
		    }
		}

		for(var i = 0; i < $scope.currentRecord.access.length; i++){
		    for(var key in $scope.currentRecord.access[i]){
			if($scope.currentRecord.access[i][key] != null){
			    if($scope.currentRecord.access[i][key].length == 0)
				formComplete = false;
			}else
			    formComplete = false;
		    }
		}
		break;
		
				
	    default:
		formComplete = true;
		break;
		
	    }

	    //If form element was not finished, then set corresponding button red. If it was, set corresponding
	    //button to green.
	    
	    if(formType == 'iso'){
		var index = 0;
		for(var i = 0; i < $scope.isoFormList.length; i++){
		    if($scope.isoFormList[i].form_name.includes(parsedName)){
			index = i;
		    }
		}
		if(formComplete == false){
		    $scope.isoFormList[index].buttonStyle = {"background-color": "#FF0000"};
		}else if(formComplete == true){
		    //Set button to green because it has been completed
		    $scope.isoFormList[index].buttonStyle = {"background-color": "#00FF00"};
		}
	    }else if(formType == 'dublin'){
		var index = 0;
		for(var i = 0; i < $scope.dublinFormList.length; i++){
		    if($scope.dublinFormList[i].form_name.includes(parsedName))
			index = i;
		}

		if(formComplete == false){
		    $scope.dublinFormList[index].buttonStyle = {"background-color": "#FF0000"};
		}else if(formComplete == true){
		    //Set button to green because it has been completed
		    $scope.dublinFormList[index].buttonStyle = {"background-color": "#00FF00"};
		}
	    }
	    else
		console.log("Error: tried to set background-color of unsupported form type.");
	    
	}

	//Using index of current page, decide what next page and previous page should be for forwards and
	//backwards buttons should be.
	$scope.prevPage;
	$scope.nextPage;
	var currentPageIndex = 0;
	
	$scope.setCurrentPage = function(shift, formType) {

	    if(formType == "iso"){
		checkFormPartial(isoButtonList[currentPageIndex], "iso");
		currentPageIndex += shift;
		if(currentPageIndex <= 0){
		    currentPageIndex = 0;
		    
		}else if(currentPageIndex >= isoButtonList.length){
		    currentPageIndex = isoButtonList.length-1;
		}

		//Check to see if on disclaimer page or terms and conditions page.
		//Must return to disclaimer page if arrow buttons are pressed on
		//that page.
		if(($state.is("form.termsConditions")) || ($state.is("form.sensitiveInformation"))){
		    $state.go(isoButtonList[isoButtonList.indexOf("form.disclaimer")]);
		    currentPageIndex = isoButtonList.indexOf("form.disclaimer");
		    checkFormPartial("form.disclaimer", "iso");
		}else{
		    $state.go(isoButtonList[currentPageIndex]);
		    //Set selected page's button to blue
		    $scope.isoFormList[currentPageIndex].buttonStyle = {"background-color": "#00BC8C"};
		}

	    }else if(formType == "dublin"){
		checkFormPartial(dublinButtonList[currentPageIndex], "dublin");
		currentPageIndex += shift;
		if(currentPageIndex <= 0){
		    currentPageIndex = 0;
		    
		}else if(currentPageIndex >= dublinButtonList.length){
		    currentPageIndex = dublinButtonList.length-1;
		}
		if(($state.is("dublinForm.termsConditions")) || ($state.is("dublinForm.sensitiveInformation"))){
		    $state.go(dublinButtonList[dublinButtonList.indexOf("dublinForm.disclaimer")]);
		    currentPageIndex = dublinButtonList.indexOf("dublinForm.disclaimer");
		}else{
		    //Set selected page's button to blue
		    $scope.dublinFormList[currentPageIndex].buttonStyle = {"background-color": "#00BC8C"};
		    $state.go(dublinButtonList[currentPageIndex]);
		}
		

	    }else{
		console.log("Tried to use unsupported form type.")
	    }
	}

        function checkTermsConditions(page) {
	    return page == ".termsConditions";
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
