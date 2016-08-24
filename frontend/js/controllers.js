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

	$scope.metadataForm = {};
	
	//Scope variables to check if user has read terms & conditions
	$scope.agreeTermsConditions = false;
	//Scope variable to check if user has right to publish 
	$scope.rightToPublish = false;
	//Scope varialble to check if record does not contain sensitive information
	$scope.noSensitiveInformation = false;

	//Object for initial background color of buttons used in ng-style tags in iso.html and dublin.html 
	var backgroundColor = {"background": "#cccccc"};
	var selectedColor = {"background-color": "#00BC8C"};
	var notCompleteColor = {"background-color": "#FF471A"};
	var completeColor = {"background-color": "#00E600"};
	
	$scope.isoFormList = [];
	var isoButtonList = [];
 	var isoButtonInit = [
	    "form.setup,Template Setup",
	    "form.basic,Basic Info",
	    "form.detailed,Detailed Info",
	    "form.dataFormats,File Upload",
	    "form.onlineResourcesAndRestrictions,Resources",
	    "form.temporalExtent,Temporal Data",
	    "form.spatialExtent,Spatial Data",
	    "form.contacts,Contacts",
	    "form.optionsAndDisclaimer,Disclaimer",
	    "form.review,Review"
	];

 	//List to populate possible buttons for dublin core form wizard.
	//String has two values split at the "," value that are both put in
	//the "dublinButton" object from the services.js file.
	$scope.dublinFormList = [];
	var dublinButtonList = [];
 	var dublinButtonInit = [
	    "dublinForm.setup,Template Setup",
	    "dublinForm.basic,Basic Info",
	    "dublinForm.dataFormats,File Upload",
	    "dublinForm.onlineResourcesAndRestrictions,Resources",
	    "dublinForm.temporalExtent,Temporal Data",
	    "dublinForm.contacts,Contacts",
	    "dublinForm.optionsAndDisclaimer,Disclaimer",
	    "dublinForm.review,Review"
	];

	//Variable to keep track of current form element "page". Used to index arrays of
	//form names. To modify this value, use either the "getCurrentPage()" function to
	//get value, "setCurrentPage(value)" to set the value of currentPageIndex, and
	//"incrementCurrentPage(shift)" to increment or decrement value.
	var currentPageIndex = 0;

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

	    //Check entire form form completeness to change button colors for
	    //form progress display
	    var url = $location.url();
	    var formType = "";
	    
	    if(url.includes('iso'))
		formType = 'iso';
	    else if(url.includes('dublin'))
		formType = 'dublin';
	    
	    checkFormAll(formType);
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
	    //console.log("Printing value in reviewFields: " + value);

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
		    //console.log("Printing object's attributes!!!! <<<<<<>>>>>>>>>>>>>>>>> " + key + " : " + value[key]);
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
	$scope.setFormType = function(type, form) {
	    if(type == "iso"){
		$location.path("/iso");
		$scope.createNewRecord();

		//Reset button colors to grey
		greyButtonBackgrounds('iso');
		
		if(form != null)
		    form.$valid = false;
	    }else if(type == "dublin"){
		$location.path("/dublin");
		$scope.createNewDublinRecord();

		//Reset button colors to grey
		greyButtonBackgrounds('dublin');
		
		if(form != null)
		    form.$valid = false;
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
	    return $scope.searchableOnDataOne;
	}

	function initScopeValues(){
	    $scope.agreeTermsConditions = false;
	    $scope.rightToPublish = false;
	    $scope.noSensitiveInformation = false;
	    //$scope.metadataForm.$setUntouched();

	    var formType = getFormType();

	    //Reset isValid form variables for use in form validation
	    if(formType == 'iso'){
		for(var i = 0; i < $scope.isoFormList.length; i++){
		    $scope.isoFormList[i].isValid = false;
		}
	    }else if(formType == 'dublin'){
		for(var i = 0; i < $scope.dublinFormList.length; i++){
		    $scope.dublinFormList[i].isValid = false;
		}
	    }
	    
	    if($scope.currentRecord.data_one_search == "true")
		$scope.searchableOnDataOne = true;
	    else if($scope.currentRecord.data_one_search == "false")
		$scope.searchableOnDataOne = false;
	    else{
		//For error handling
		//console.log("Error: tried to set $scope.searchableOnDataOne to unsupported value. Options are boolean.");
	    }
	}

	//Checks if $scope.agreeTermsConditions, $scope.rightToPublish, and $scope.noSensitiveInformation are true. If so, will return true.
	$scope.canPublish = function() {
	    if(($scope.agreeTermsCondiditons == true)
	       && ($scope.rightToPublish == true)
	       && ($scope.noSensitiveInformation == true)){
		return true;
	    }else
		return false;
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

	for(var i = 0; i < isoButtonInit.length; i++){
	    var scopeButton = recordService.getFreshFormElement();
	    var data = isoButtonInit[i].split(",");
	    scopeButton.form_name = data[0];
	    scopeButton.label = data[1];
	    scopeButton.buttonStyle = backgroundColor;

	    if(i > 0)
		scopeButton.saveOnClick = "submitDraftRecord();";
	    
	    var buttonName = data[0];

	    //Add button object to Scope list and string to controller list
	    $scope.isoFormList.push(scopeButton);
	    isoButtonList.push(buttonName);
	}
	
	for(var i = 0; i < dublinButtonInit.length; i++){
	    var scopeButton = recordService.getFreshFormElement();
	    var data = dublinButtonInit[i].split(",");
	    
	    scopeButton.form_name = data[0];
	    scopeButton.label = data[1];
	    scopeButton.buttonStyle = backgroundColor;
	    
	    if(i > 0)
		scopeButton.saveOnClick = "submitDraftRecord();";

	    var buttonName = data[0];

	    //Push buttons onto controller and scope lists
	    $scope.dublinFormList.push(scopeButton);
	    dublinButtonList.push(buttonName);
	}

	function getInitialButtonBackground(){
	    return backgroundColor;
	}

	function addDublinButton(buttonName, buttonLabel){
	    var dublinButton = recordService.getFreshFormElement();
	    dublinButton.form_name = buttonName;
	    dublinButton.label = buttonLabel;
	    dublinButton.buttonStyle = backgroundColor;
	    
	    //Object variable to store current form element's $valid value
	    dublinButton.isValid = false;

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

	$scope.saveForm = function(formName) {
	    if(formName.includes("setup") !== true){
		$scope.submitDraftRecord();
	    }
	}

	//Check is current form element is valid. form.$valid resets every time $stateProvider changes
	//states, so we can check each form element individually, but we want to check the form a a whole.
	$scope.formIsValid = function(formType, isValid){

	    if(formType == 'iso'){
		$scope.isoFormList[getCurrentPage()].isValid = isValid;
	    }else if(formType == 'dublin'){
		$scope.dublinFormList[getCurrentPage()].isValid = isValid;
	    }else
		console.log("Error: tried to set object variable on unsupported form type.");
	}

	function getFormType(){
	    var url = $location.url();
	    
	    if(url.includes('iso')){
		return "iso";
	    }else if(url.includes('dublin')){
		return "dublin";
	    }
	    else{
		//For error handling
		//console.log("Error: form is an unsupported type.");
	    }
	    return "";
	}

	$scope.checkAllValid = function(){
	    var url = $location.url();
	    
	    if(url.includes('iso')){

		//Check all forms except review and template setup page (first and last)
		for(var i = 1; i < $scope.isoFormList.length-1; i++){
		    if($scope.isoFormList[i].isValid == false){
			console.log("iso is false~!!! i = " + i);
			return false;
		    }
		}
		return true;
	    }else if(url.includes('dublin')){
		//Check all forms except review and template setup page (first and last)
		for(var i = 1; i < $scope.dublinFormList.length-1; i++){
		    if($scope.dublinFormList[i].isValid == false){
			console.log("dublin is false~!!! i = " + i);	
			return false;
		    }
		}
		return true;
	    }else
		console.log("Error: not in a supported form type.");

	    console.log("Unsupported is false~!!!");
	    return false;
	}
	
	//Jump to page (state) and set currentPageIndex to page index to keep arrow buttons and button list indecies the same. 
	$scope.jumpToPage = function(index, formType) {
	    if(formType == 'iso'){
		//Check index against array bounds
		if((index >= 0) || (index < isoButtonList.length)){
		    $state.go(isoButtonList[index]);
		    setCurrentPage(index);

		    //Set selected page's button to blue
		    highlightCurrentPage("iso");
		}
	    }else if(formType == 'dublin'){
		//Check index against array bounds
		if((index >= 0) || (index < isoButtonList.length)){
		    $state.go(dublinButtonList[index]);
		    setCurrentPage(index);
		    
		    //Set selected page's button to blue
		    highlightCurrentPage("dublin");

		}
	    }else
		console.log("Tried to index non-supported record type.");
	}

	//Reset background color to grey and hide both x and checkmark icons
	function greyButtonBackgrounds(formType){
	    if(formType == 'iso'){
		for(var i = 0; i < $scope.isoFormList.length; i++){
		    $scope.isoFormList[i].buttonStyle = backgroundColor;
		    $scope.isoFormList[i].dotIconStyle = false;
		    $scope.isoFormList[i].checkIconStyle = false;
		    $scope.isoFormList[i].xIconStyle = false;
		    //Reset right arrow's background color next to button too. isoButtonList has list of button id names,
		    //so use that to find element. Psuedo-elements are not on DOM list, so cant access directly though
		    //ng-style, so have to find afterwards and add and remove classes to get desired functionality.
		    var result = document.getElementById(isoButtonList[i]);
		    angular.element(result).removeClass("complete");
		    angular.element(result).removeClass("not-complete");
		    angular.element(result).removeClass("selected");

		    angular.element(result).addClass("initial");
		}
	    }else if(formType == 'dublin'){
		for(var i = 0; i < $scope.dublinFormList.length; i++){
		    $scope.dublinFormList[i].buttonStyle = backgroundColor;
		    $scope.dublinFormList[i].dotIconStyle = false;
		    $scope.dublinFormList[i].checkIconStyle = false;
		    $scope.dublinFormList[i].xIconStyle = false;
		    //Reset right arrow's background color next to button too. isoButtonList has list of button id names,
		    //so use that to find element. Psuedo-elements are not on DOM list, so cant access directly though
		    //ng-style, so have to find afterwards and add and remove classes to get desired functionality.
		    var result = document.getElementById(dublinButtonList[i]);
		    angular.element(result).removeClass("complete");
		    angular.element(result).removeClass("not-complete");
		    angular.element(result).removeClass("selected");

		    angular.element(result).addClass("initial");
		}
	    }else
		console.log("Error: tried to reset non-supported form type's button backgrounds.");
	}

	$scope.resetBackground = function(formType) {
	    resetStyle(formType);
	}

	function resetStyle(formType){
	    if(formType == 'iso'){
		$scope.isoFormList[getCurrentPage()].buttonStyle = {};
	    }else if(formType == 'dublin'){
		$scope.dublinFormList[getCurrentPage()].buttonStyle = {};
	    }else
		console.log("Error: tried to reset background color of button of unsupported form type.");
	}

	$scope.checkFormPartial = function(formType){
	    checkFormElement(formType);
	}

	//Checks all form sections for completeness on load of existing record

	function checkFormAll(formType){
	    setCurrentPage(0);
	    if(formType == 'iso'){
		for(var i = 0; i < isoButtonList.length; i++){
		    resetStyle(formType);
		    checkFormElement(formType);
		    setCurrentPage(i);
		}
	    }else if(formType == 'dublin'){
		for(var i = 0; i < dublinButtonList.length; i++){
		    resetStyle(formType);
		    checkFormElement(formType);
		    setCurrentPage(i);
		}
	    }
	    setCurrentPage(0);
	}

	function getCurrentPage(index){
	    return currentPageIndex;
	}

	function setCurrentPage(index){
	    if(typeof index === 'number')
		currentPageIndex = index;
	    else
		console.log("Tried to set currentPageIndex to non-number.");
	}

	function incrementCurrentPage(i){
	    if(typeof i === 'number'){
		currentPageIndex += i;
	    }else
		console.log("Error: failed to increment current page.");
	}

	//Checks to see if visited form section has been completed. If not, then turns corresponding form button red
	function checkFormElement(formType){
	    var formComplete = true;

	    //Get part of form name after "." in name. EX: "form.detailed" returns "detailed".
	    //var parsedName = formName.split(".")[1];
	    var parsedName = "";
	    
	    if(formType == 'iso')
		parsedName = isoButtonList[getCurrentPage()].split(".")[1];
	    else if(formType == 'dublin')
		parsedName = dublinButtonList[getCurrentPage()].split(".")[1];

	    switch(parsedName){
	    case "setup":
		break;
	    case "basic":
		//Check if user has filled out fields on "Basic Information"
		if(($scope.currentRecord.title == null)
		   || ($scope.currentRecord.summary == null)
		   || ($scope.currentRecord.first_pub_date == null)
		   || ($scope.currentRecord.place_keywords == null)
		   || ($scope.currentRecord.thematic_keywords == null)
		   || ($scope.currentRecord.topic_category[0] == null)){

		    formComplete = false;
		    break;
		}
		if(($scope.currentRecord.title.length == 0)
		   || ($scope.currentRecord.summary.length == 0)
		   || ($scope.currentRecord.first_pub_date == 0)
		   || ($scope.currentRecord.place_keywords.length == 0)
		   || ($scope.currentRecord.thematic_keywords.length == 0)
		   ||($scope.currentRecord.topic_category[0].length == 0)){
		    formComplete = false;
		}
		
		break;
	    case "detailed":
		//Check if user has filled out fields on "Detailed Information"
		if(($scope.currentRecord.status == null)
		   || ($scope.currentRecord.update_frequency == null)
		   || ($scope.currentRecord.spatial_dtype == null)
		   || ($scope.currentRecord.hierarchy_level == null)){
		    formComplete = false;
		    break;
		}
		
		if(($scope.currentRecord.status.length == 0)
		   || ($scope.currentRecord.update_frequency.length == 0)
		   || ($scope.currentRecord.spatial_dtype.length == 0)
		   || ($scope.currentRecord.hierarchy_level.length == 0)){
		    formComplete = false;
		}
		
		break;
	    case "dataFormats":
		//Check if user has specified data format yet.
		if(($scope.currentRecord.data_format == null)
		   || ($scope.currentRecord.attachments.length == null)){
		    formComplete = false;

		    //Break out of statement since element is null, and checking length
		    //in following statements will cause error.
		    break;
		}
		
		
		if(($scope.currentRecord.data_format.length == 0)
		   || ($scope.currentRecord.attachments.length == null)){
		    formComplete = false;
		}
 		
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
		   || ($scope.currentRecord.start_date.hours == null)
		   || ($scope.currentRecord.start_date.minutes == null)
		   || ($scope.currentRecord.start_date.seconds == null)
		   || ($scope.currentRecord.end_date == null)
		   || ($scope.currentRecord.end_date.hours == null)
		   || ($scope.currentRecord.end_date.minutes == null)
		   || ($scope.currentRecord.end_date.seconds == null)){
		    formComplete = false;
		    break;
		}
		
		if(($scope.currentRecord.start_date.length == 0)
		   || ($scope.currentRecord.start_date.hours.length == 0)
		   || ($scope.currentRecord.start_date.minutes.length == 0)
		   || ($scope.currentRecord.start_date.seconds.length == 0)
		   || ($scope.currentRecord.end_date.length == 0)
		   || ($scope.currentRecord.end_date.hours.length == 0)
		   || ($scope.currentRecord.end_date.minutes.length == 0)
		   || ($scope.currentRecord.end_date.seconds.length == 0))
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

	    case "optionsAndDisclaimer":
		//If data_one_search or doi_ark_request are null, then break
		if(($scope.currentRecord.doi_ark_request == null)
		   || ($scope.currentRecord.data_one_search == null)){
		    formComplete = false;
		    break;
		}
		
		if(($scope.currentRecord.doi_ark_request.length == 0)
		   || ($scope.currentRecord.data_one_search.length == 0))
		    formComplete = false;
		

		//Check to see user has agreed to terms, record does not have sensitive information,
		//and the the user has the right to publish.

		if(($scope.agreeTermsConditions == false)
		   || ($scope.noSensitiveInformation == false)
		   || ($scope.rightToPublish == false))
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
		    //If the current form partial is not complete, then set the background of
		    //the breadcrumb button to red.
		    $scope.isoFormList[index].buttonStyle = notCompleteColor;
		    //Arrows on right side of breadcrumbs buttons are psuedo-elements, so they are
		    //not part of the DOM. So, we have to find their parent, and add a new class to
		    //override the :after class psuedo-element to change the color. 
		    var result = document.getElementById(isoButtonList[getCurrentPage()]);
		    //Remove the class that makes the button "green"
		    angular.element(result).removeClass("complete");
		    angular.element(result).addClass("not-complete");
		    $scope.isoFormList[index].checkIconStyle = false;
		    $scope.isoFormList[index].xIconStyle = true;
		    $scope.isoFormList[index].dotIconStyle = false;
		}else if(formComplete == true){
		    //Set button to green because it has been completed
		    $scope.isoFormList[index].buttonStyle = completeColor;
		    var result = document.getElementById(isoButtonList[getCurrentPage()]);
		    //Remove the class that makes the button "red"
		    angular.element(result).removeClass("not-complete");
		    angular.element(result).addClass("complete");
		    $scope.isoFormList[index].checkIconStyle = true;
		    $scope.isoFormList[index].xIconStyle = false;
		    $scope.isoFormList[index].dotIconStyle = false;
		}
	    }else if(formType == 'dublin'){
		var index = 0;
		for(var i = 0; i < $scope.dublinFormList.length; i++){
		    if($scope.dublinFormList[i].form_name.includes(parsedName))
			index = i;
		}

		if(formComplete == false){
		    //Change border to square, red, display x, and hide checkmark
		    $scope.dublinFormList[index].buttonStyle = notCompleteColor;
		    var result = document.getElementById(dublinButtonList[getCurrentPage()]);
		    //Remove the class that makes the button "green"
		    angular.element(result).removeClass("complete");
		    angular.element(result).addClass("not-complete");
		    $scope.dublinFormList[index].checkIconStyle = false;
		    $scope.dublinFormList[index].xIconStyle = true;
		    $scope.dublinFormList[index].dotIconStyle = false;
		}else if(formComplete == true){
		    //Set button to green because it has been completed
		    $scope.dublinFormList[index].buttonStyle = completeColor;
		    var result = document.getElementById(dublinButtonList[getCurrentPage()]);
		    //Remove the class that makes the button "red"
		    angular.element(result).removeClass("not-complete");
		    angular.element(result).addClass("complete");
		    $scope.dublinFormList[index].checkIconStyle = true;
		    $scope.dublinFormList[index].xIconStyle = false;
		    $scope.dublinFormList[index].dotIconStyle = false;
		}
	    }
	    else
		console.log("Error: tried to set background-color of unsupported form type.");
	    
	}

	//Using index of current page, decide what next page and previous page should be for forwards and
	//backwards buttons should be.
	$scope.prevPage;
	$scope.nextPage;

	function highlightCurrentPage(formType){
	    if(formType == "iso"){
		$scope.isoFormList[getCurrentPage()].buttonStyle = selectedColor;
		var result = document.getElementById(isoButtonList[getCurrentPage()]);
		angular.element(result).removeClass("not-complete");
		angular.element(result).removeClass("complete");
		angular.element(result).addClass("selected");

		//Put dot above button text to symbolize it is selected
		$scope.isoFormList[getCurrentPage()].dotIconStyle = true;
		$scope.isoFormList[getCurrentPage()].checkIconStyle = false;
		$scope.isoFormList[getCurrentPage()].xIconStyle = false;
		
	    }else if(formType == "dublin"){
		$scope.dublinFormList[getCurrentPage()].buttonStyle = selectedColor;

		var result = document.getElementById(dublinButtonList[getCurrentPage()]);
		angular.element(result).removeClass("not-complete");
		angular.element(result).removeClass("complete");
		angular.element(result).addClass("selected");

		//Put dot above button text to symbolize it is selected
		$scope.dublinFormList[getCurrentPage()].dotIconStyle = true;
		$scope.dublinFormList[getCurrentPage()].checkIconStyle = false;
		$scope.dublinFormList[getCurrentPage()].xIconStyle = false;
		
	    }else
		console.log("Error: tried to set background color of unsupported record type's button.");
	}
	
	$scope.setCurrentPage = function(shift, formType) {

	    if(formType == "iso"){
		checkFormElement("iso");
		incrementCurrentPage(shift);
		
		if((getCurrentPage()) <= 0){
		    setCurrentPage(0);
		    
		}else if((getCurrentPage()) >= isoButtonList.length){
		    setCurrentPage(isoButtonList.length-1);
		}

		//Check to see if on disclaimer page or terms and conditions page.
		//Must return to disclaimer page if arrow buttons are pressed on
		//that page.
		if(($state.is("form.termsConditions")) || ($state.is("form.sensitiveInformation"))){ 
		    $state.go(isoButtonList[isoButtonList.indexOf("form.optionsAndDisclaimer")]);
		    setCurrentPage(isoButtonList.indexOf("form.optionsAndDisclaimer"));
		    highlightCurrentPage("iso");
		}else{
		    //Set selected page's button to blue
		    highlightCurrentPage("iso");

		    $state.go(isoButtonList[getCurrentPage()]);
		}

	    }else if(formType == "dublin"){
		checkFormElement("dublin");
		incrementCurrentPage(shift);
		
		if((getCurrentPage()) <= 0){
		    setCurrentPage(0);
		    
		}else if((getCurrentPage()) >= dublinButtonList.length){
		    setCurrentPage(dublinButtonList.length-1);
		}
		if(($state.is("dublinForm.termsConditions")) || ($state.is("dublinForm.sensitiveInformation"))){
		    $state.go(dublinButtonList[dublinButtonList.indexOf("dublinForm.optionsAndDisclaimer")]);
		    setCurrentPage(dublinButtonList.indexOf("dublinForm.optionsAndDisclaimer"));
		    highlightCurrentPage("dublin");
		}else{
		    //Set selected page's button to blue
		    highlightCurrentPage("dublin");
		    
		    $state.go(dublinButtonList[getCurrentPage()]);
		}
		

	    }else{
		console.log("Tried to use unsupported form type.")
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
