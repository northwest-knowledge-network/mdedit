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
	
	//Variable to check if user wants record to be searchable on DataONE.
	$scope.searchableOnDataOne = false;

	//Scope variable used to add or subtract "spatialExtents.html" partial to dublin form list
	//in "setup.html" checkbox.
	$scope.hasSpatialData = false;
	//Scope variable to check if map on spatialExtent.html is visible
	$scope.hasMap = true;
	//Scope variable to show or hide the "coordinate system" input in the "spatialExtent.html" partial.
	$scope.coordinateInputVisible = false;

	//Scope variable that hides the start-date and end-date inputs in temporalExtents.html
	$scope.hasTemporalData = false;
	
	//Scope variable to track if user has agreed to terms and conditions of using metadata editor.
	//Used to allow publishing of record, but not saved in the database.
	$scope.agreeTermsConditions = false;
	//Scope variable used to track if user has the right to publish their data.
	//Used to allow publishing of record, but not saved in the database.
	$scope.rightToPublish = false;
	//Scope variable to track if user has agreed that there is no sensitive information in their data.
	//Used to allow publishing of record, but not saved in the database.
	$scope.noSensitiveInformation = false;

	//Objects for background colors of buttons used in ng-style tags in iso.html and dublin.html 
	var backgroundColor = {"background-color": "#cccccc"};
	var selectedColor = {"background-color": "#00BC8C"};
	var notCompleteColor = {"background-color": "#FF471A"};
	var completeColor = {"background-color": "#00E600"};
	
	/* List to populate possible buttons for iso form wizard.
	   stateName is name of state in js/app.js file, and buttonLabel is the text displayed for the button 
	   when the page is rendered.
	*/
	$scope.isoFormList = [];
	var isoButtonList = [];
 	var isoButtonInit = [
	    {"stateName":"form.setup", "buttonLabel":"Setup"},
	    {"stateName":"form.basic", "buttonLabel":"Basic Info"},
	    {"stateName":"form.detailed","buttonLabel":"Detailed Info"},
	    {"stateName":"form.minimalTemporal","buttonLabel":"Temporal"},
	    {"stateName":"form.spatialExtent","buttonLabel":"Spatial"},
	    {"stateName":"form.contacts","buttonLabel":"Contacts"},
	    {"stateName":"form.dataFormats","buttonLabel":"Upload"},
	    {"stateName":"form.onlineResourcesAndRestrictions","buttonLabel":"Resources"},
	    {"stateName":"form.optionsAndDisclaimer","buttonLabel":"Disclaimer"},
	    {"stateName":"form.review","buttonLabel":"Review"}
	];

 	/* List to populate possible buttons for dublin core form wizard.
	   stateName is name of state in js/app.js file, and buttonLabel is the text displayed for the button 
	   when the page is rendered.
	*/
	$scope.dublinFormList = [];
	var dublinButtonList = [];
 	var dublinButtonInit = [
	    {"stateName":"dublinForm.setup","buttonLabel":"Setup"},
	    {"stateName":"dublinForm.basic","buttonLabel":"Basic Info"},
	    {"stateName":"dublinForm.minimalTemporal","buttonLabel":"Temporal"},
	    {"stateName":"dublinForm.contacts","buttonLabel":"Contacts"},
	    {"stateName":"dublinForm.dataFormats","buttonLabel":"Upload"},
	    {"stateName":"dublinForm.onlineResourcesAndRestrictions","buttonLabel":"Resources"},
	    {"stateName":"dublinForm.optionsAndDisclaimer","buttonLabel":"Disclaimer"},
	    {"stateName":"dublinForm.review","buttonLabel":"Review"}
	];

	//Initalize button lists and scope values for fresh record
	initFormLists();

	//Jump to "setup" form element on page load
	defaultState();

	//Variable to keep track of current form element "page". Used to index arrays of
	//form names. To modify this value, use either the "getCurrentPage()" function to
	//get value, "setCurrentPage(value)" to set the value of currentPageIndex, and
	//"incrementCurrentPage(shift)" to increment or decrement value by an integer value (shift).
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


		    //If start date and end date are not null, then check $date attributes inside them
		    if(($scope.currentRecord.start_date != null)
		       && ($scope.currentRecord.end_date != null)){
			//If either start date or end date are not empty strings, and the start and end date
			//inputs have not been added to the form already, then, add them.
			if(($scope.currentRecord.start_date.$date !== '')
			   || ($scope.currentRecord.start_date.$date !== '')){
			    if(!$scope.hasTemporalData)
				toggleTemporal();
			}
			//If start and end dates are empy strings, and their inputs are already in the
			//Temporal Extent section, then remove the start and end date inputs.
			else if(($scope.currentRecord.start_date.$date === '')
				&& ($scope.currentRecord.end_date.$date === '')){
			    if($scope.hasTemporalData)
				toggleTemporal();
			}
		    }else{
			/* If currentRecord.start_date is null and the previous record had
			   temporal data, then we need to remove start_date and end_date inputs by
		   calling the toggleTemporal function.
			*/
			if($scope.hasTemporalData){
			    toggleTemporal();
			    console.log("Removing temporal from null record with hasTemporalData true");
			}
		    }
                })
                .error(function (error) {
                    $scope.errors.push("Error in loading record to edit");
                });
            //set geocode write-in box to be blank
            $scope.options.bboxInput = '';
	    
	    //Reset scope variables used in disclaimer.html checkboxes
	    initScopeValues()
	    
        };

        /**
         * On submit of metadata form, submitRecord. This both updates the server
         * and makes sure the form is current.
         */
        $scope.submitDraftRecord = function() {
	    //Remove all HTML tags from currentRecord
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
            if (schemaType.indexOf('Dataset (ISO)') > -1)
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

	//Functions that return colors for breadcrumb button states: Complete,
	//not complete, selected, and default background color.
	
	//Get background color
	function getBackgroundColor(){
	    return backgroundColor;
	}

	//Get selected color
	function getSelectedColor(){
	    return selectedColor;
	}

	//get color for button of completed form element
	function getCompleteColor(){
	    return completeColor;
	}

	//get color for button of not completed form element
	function getNotCompleteColor(){
	    return notCompleteColor;
	}

	//Reset form buttons to default color (currently grey). Used on load of existing record in partials/appHeader.html.
	$scope.resetFormButtons = function(formType) {
	    if((formType.indexOf("iso") > -1)
	       || (formType.indexOf("dublin") > -1))
		greyButtonBackgrounds(formType);
	    else
		console.log("Error: tried to reset button backgrounds on unsupported form type");
	}
	
	//Sets form to Iso or Dublin core by modifying address path to either /iso or /dublin. Used when new
	//form type is selected in setup.html page.
	$scope.setFormType = function(type, form) {
	    if(type.indexOf("iso") > -1){
		$location.path("/iso");
		$scope.createNewRecord();

		//Reset button colors to grey
		greyButtonBackgrounds('iso');
	    }else if(type.indexOf("dublin") > -1){
		$location.path("/dublin");
		$scope.createNewDublinRecord();

		//Reset button colors to grey
		greyButtonBackgrounds('dublin');
	    }
	    else
		console.log("Error: tried to set path to unsupported url.");
	}

	//Add or remove Spatial Extent form element to Dublin form
	$scope.setSpatialForm = function(buttonName, buttonLabel) {
	    $scope.hasSpatialData = !$scope.hasSpatialData;
	    //Make sure map is not visible if coordinate system has been added, but map has not been added
	    if(($scope.hasSpatialData == false)
	       && ($location.url().indexOf("dublin") > -1))
		$scope.hasMap = false;
	    else if(($scope.hasSpatialData == true)
		    && ($location.url().indexOf("dublin") > -1))
		$scope.hasMap = true;
	    
	    //If spatial data checkbox in setup.html form partial has been selected, then add button to dublin form.
	    if(($scope.hasSpatialData)
	       && ($location.url().indexOf("dublin") > -1)){
		addDublinButton(buttonName, buttonLabel);
	    }else if ((!$scope.hasSpatialData)
		      && (!$scope.coordinateInputVisible)
		      && ($location.url().indexOf("dublin") > -1)){
		removeDublinButton(buttonName);
	    }
	}

	$scope.toggleTemporalData = function() {
	    toggleTemporal();
	}

	//Need to be able to toggle temporal data from inside and outside the controller, so split up functionality
	//to allow for access inside and outside
	function toggleTemporal(){
	    $scope.hasTemporalData = !$scope.hasTemporalData;
	    if(getFormType().indexOf('iso') > -1){
		if($scope.hasTemporalData)
		    addIsoButton("form.temporalExtent", "Temporal");
		else if(!$scope.hasTemporalData)
		    addIsoButton("form.minimalTemporal", "Temporal");
		
		console.log("Added to iso!");
	    }else if(getFormType().indexOf('dublin') > -1){
		if($scope.hasTemporalData)
		    addDublinButton("dublinForm.temporalExtent", "Temporal");
		else if(!$scope.hasTemporalData)
		    addDublinButton("dublinForm.minimalTemporal", "Temporal");
		
		console.log("Added to dublin!");
	    }
	}

	//Check currentRecord if reference_system attribute is null or length 0.
	//If not, then make coordinateInputVisible true to show reference system input
	//in spatialExtent.html. Useful on new record load.
	$scope.checkCoordinateInput = function(){
	    if($scope.currentRecord.reference_system != null){
		if($scope.currentRecord.reference_system.length > 0){
		    $scope.coordinateInputVisible = true;
		  
		    //Add "spatialExtent.html" to form since that is where the "Reference System" form input is.
		    addDublinButton("dublinForm.spatialExtent", "Spatial");
		}
	    }
	}

	//Adds and subtracts spatialExtent.html partial from form if user clicks checkbox stating that they
	//have a coordinate system. This form input is on the spatialExtent.html form state.
	$scope.toggleCoordinateInput = function() {
	    $scope.coordinateInputVisible = !$scope.coordinateInputVisible;
	    //Add Spatial Data form element to dublin form if not already present.
	    if(($location.url().indexOf("dublin") > -1)
	       && ($scope.coordinateInputVisible == true))
		addDublinButton("dublinForm.spatialExtent", "Spatial");
	    else if(($location.url().indexOf("dublin") > -1)
		    && ($scope.coordinateInputVisible == false)
		    && ($scope.hasSpatialData == false))
		removeDublinButton("dublinForm.spatialExtent");

	    //If only the reference system has been added, and the form type is dublin, then make the
	    //map visible. The map must always be visible on iso, but can be subtracted from dublin's
	    //Spatial Extent section
	    if(($scope.hasSpatialData == false)
	       && ($scope.coordinateInputVisible == true)
	       && ($location.url().indexOf("dublin") > -1))
		$scope.hasMap = false;
	    else
		$scope.hasMap = true;
	}
	 
	//Request either DOI or ARK: sets currentRecord.doi_ark_request to either "DOI", "ARK", or "".
	$scope.applyForDOI = function(type) {
	    //Check type to see if it is one of the supported types.
	    //If not, output error message.
	    if(type.indexOf("DOI") > -1){
		$scope.currentRecord.doi_ark_request = type;
	    }else if(type.indexOf("ARK") > -1){
		$scope.currentRecord.doi_ark_request = type;
	    }else if(type.indexOf("neither") > -1){
		$scope.currentRecord.doi_ark_request = type;
	    }else{
		console.log("Error: tried to set DOI/ARK request to unsupported value: options are \"DOI\", \"ARK\", or \"neither\"");
	    }
	}

	//Check if user wants data searchable on dataONE, then translates boolean value to string value for currentRecord attribute.
	$scope.checkSearchableDataOne = function() {
	    //Initialize variable to current record variable for searchable on DataOne
	    //Check if string in currentRecord.data_one_search is equal to "true". 
	    if($scope.currentRecord.data_one_search.indexOf("true") > -1){
		$scope.searchableOnDataOne = true;
		return true;
	    }
	    //Check if string in currentRecord.data_one_search is equal to "false". 
	    else if($scope.currentRecord.data_one_search.indexOf("false") > -1){
		$scope.searchableOnDataOne = false;
		return false;
	    }
	    //Check if string in currentRecord.data_one_search is equal to "". 
	    else if($scope.currentRecord.data_one_search.indexOf("") > -1){
		$scope.searchableOnDataOne = false;
		return false;
	    }
	    else{
		console.log("Error: $scope.currentRecord.data_one_search set to a string other than \"true\" or \"false\".");
		$scope.searchableOnDataOne = false;
		return false;
	    }
	}

	//Toggle boolean value of $scope.searchableOnDataOne.
	function toggleSearchableDataOne(){
	    $scope.searchableOnDataOne = !$scope.searchableOnDataOne;
	}

	//Toggle if searchable on data one, and return boolean value
	$scope.setSearchableDataOne = function() {
	    toggleSearchableDataOne();
	    $scope.currentRecord.data_one_search = $scope.searchableOnDataOne.toString();
	    return $scope.searchableOnDataOne;
	}

	//Initializes scope variables used in controller, but not stored in the database,
	//to determine if user has agreed to terms & conditions, has the right to publish,
	// and their data has no sensitive information. Called on page load.
	function initScopeValues(){
	    $scope.agreeTermsConditions = false;
	    $scope.rightToPublish = false;
	    $scope.noSensitiveInformation = false;

	    $scope.hasMap = true;
	    $scope.hasSpatialData = false;
	    $scope.coordinateInputVisible = false;

	    //Reset form validity 
	    resetFormValidity();
	    
	    if($scope.currentRecord != null){
		if($scope.currentRecord.data_one_search != null){
		    if($scope.currentRecord.data_one_search.indexOf("true") > -1)
			$scope.searchableOnDataOne = true;
		    else if($scope.currentRecord.data_one_search.indexOf("false") > -1)
			$scope.searchableOnDataOne = false;
		    else{
			//For error handling
			//console.log("Error: tried to set $scope.searchableOnDataOne to unsupported value. Options are boolean.");
		    }
		}else
		    $scope.searchableOnDataOne = false;
	    }
	}

	//Resets all variables in list of objects that track if each form section is complete ($valid was true: all required
	//inputs were filled out)
	function resetFormValidity(){
	    var formType = getFormType();
	    
	    //Reset isValid form variables for use in form validation
	    if(formType.indexOf('iso') > -1){
		for(var i = 0; i < $scope.isoFormList.length; i++){
		    $scope.isoFormList[i].isValid = false;
		}
	    }else if(formType.indexOf('dublin') > -1){
		for(var i = 0; i < $scope.dublinFormList.length; i++){
		    $scope.dublinFormList[i].isValid = false;
		}
	    }
	}

	//Initialize iso and dublin form lists
	function initFormLists(){
	    //List to populate buttons for ISO. ISO has more default form
	    //fields than Dublin.

	    for(var i = 0; i < isoButtonInit.length; i++){
		var scopeButton = recordService.getFreshFormElement();
		scopeButton.form_name = isoButtonInit[i].stateName;
		scopeButton.label = isoButtonInit[i].buttonLabel;
		scopeButton.buttonStyle = getBackgroundColor();

		//Add button object to Scope list and string to controller list
		$scope.isoFormList.push(scopeButton);
		isoButtonList.push(isoButtonInit[i].stateName);
	    }
	    
	    for(var i = 0; i < dublinButtonInit.length; i++){
		var scopeButton = recordService.getFreshFormElement();
		scopeButton.form_name = dublinButtonInit[i].stateName;
		scopeButton.label = dublinButtonInit[i].buttonLabel;
		scopeButton.buttonStyle = getBackgroundColor();
		
		//Push buttons onto controller and scope lists
		$scope.dublinFormList.push(scopeButton);
		dublinButtonList.push(dublinButtonInit[i].stateName);
	    }

	    //Reset the form validity variables in list of form sections
	    resetFormValidity();
	}

	/*
	  On page load, this function will redirect to the first form element in either
	  the "iso" or "dublin" form by detecting if "iso" or "dublin" is in the URL, then
	  using $state to move to the first state in the appropriate list of possible
	  states (form elements). Current first state in either list is the "setup" form element.
	*/
	function defaultState() {
	    var url = $location.url();
	    var formType = "";
	    
	    if(url.indexOf('iso') > -1)
		formType = 'iso';
	    else if(url.indexOf('dublin') > -1)
		formType = 'dublin';

	    setCurrentPage(0);
	    if(formType.indexOf("iso") > -1)
		$state.go(isoButtonList[getCurrentPage()]);
	    else if(formType.indexOf("dublin") > -1)
		$state.go(dublinButtonList[getCurrentPage()]);
	    else if(formType == ""){
		//Angular router will redirect to "iso" if blank.
		$state.go(isoButtonList[getCurrentPage()]);
	    }else
		console.log("Error: tried to set page to unsupported type. Supported types are \"iso\" and \"dublin\".");
	}

	//Adds button to the dublinForm list in this controller. Used to add
	//form elements as needed to button list used to navigate through form.
	function addDublinButton(buttonName, buttonLabel){
	    //Get new dublinButton object
	    var dublinButton = recordService.getFreshFormElement();
	    
	    dublinButton.form_name = buttonName;
	    dublinButton.label = buttonLabel;
	    dublinButton.buttonStyle = getBackgroundColor();
	    
	    //Object variable to store current form element's $valid value
	    dublinButton.isValid = false;

	    //If form does not currently have button, then add
	    if(dublinButtonList.indexOf(buttonName) == -1){
		//If button is "Spatial" then put it after "Temporal"
		if(buttonLabel.indexOf('Spatial') > -1){

		    //Figure out which temporal extent is loaded in the breadcrumb bar
		    if(dublinButtonList.indexOf("dublinForm.temporalExtent") > -1)
			var index = dublinButtonList.indexOf("dublinForm.temporalExtent");
		    else if(dublinButtonList.indexOf("dublinForm.minimalTemporal") > -1)
			var index = dublinButtonList.indexOf("dublinForm.minimalTemporal");
		    else
			var index = dublinButtonList.indexOf("dublinForm.temporalExtent");
		    
		    dublinButtonList.splice(index+1, 0, dublinButton.form_name);
		    $scope.dublinFormList.splice(index+1, 0, dublinButton);
		}else if(buttonLabel.indexOf('Temporal') > -1){
		    //If button is "Temporal" then change HTML page that button points to so that "start-date"
		    //and "end-date" will go away.
		    if(dublinButtonList.indexOf("dublinForm.temporalExtent") > -1){
			var index = dublinButtonList.indexOf("dublinForm.temporalExtent");
			$scope.dublinFormList[index].form_name = "dublinForm.minimalTemporal";
			dublinButtonList[index] = "dublinForm.minimalTemporal";

			/* Reset start_date and end_date to empty strings to make sure user cannot
			   remove start and end dates after they have filled them out, and they 
			   would be submitted with the record anyway.
			*/
			resetDates();
		    }else if(dublinButtonList.indexOf("dublinForm.minimalTemporal") > -1){
			var index = dublinButtonList.indexOf("dublinForm.minimalTemporal");
			$scope.dublinFormList[index].form_name = "dublinForm.temporalExtent";
			dublinButtonList[index] = "dublinForm.temporalExtent";
		    }
		}else{
		    console.log("adding in new spatial section");
		    dublinButtonList.splice((dublinButtonList.length - 2), 0, buttonLabel);
		    $scope.dublinFormList.splice((dublinButtonList.length - 2), 0, dublinButton);
		}
	    }
	}

	function addIsoButton(buttonName, buttonLabel){
	    //Get new isoButton object
	    var isoButton = recordService.getFreshFormElement();
	    
	    isoButton.form_name = buttonName;
	    isoButton.label = buttonLabel;
	    isoButton.buttonStyle = getBackgroundColor();
	    
	    //Object variable to store current form element's $valid value
	    isoButton.isValid = false;

	    //If form does not currently have button, then add
	    if(isoButtonList.indexOf(buttonName) == -1){
		if(buttonLabel.indexOf('Temporal') > -1){
		    if(isoButtonList.indexOf("form.temporalExtent") > -1){
			var index = isoButtonList.indexOf("form.temporalExtent");
			$scope.isoFormList[index].form_name = "form.minimalTemporal";
			isoButtonList[index] = "form.minimalTemporal";
			
			/* Reset start_date and end_date to empty strings to make sure user cannot
			   remove start and end dates after they have filled them out, and they 
			   would be submitted with the record anyway.
			*/
			resetDates();
		    }else if(isoButtonList.indexOf("form.minimalTemporal") > -1){
			var index = isoButtonList.indexOf("form.minimalTemporal");
			$scope.isoFormList[index].form_name = "form.temporalExtent";
			isoButtonList[index] = "form.temporalExtent";
		    }
		}else{
		    isoButtonList.splice((isoButtonList.length - 2), 0, buttonLabel);
		    $scope.isoFormList.splice((isoButtonList.length - 2), 0, isoButton);
		}
	    }
	}

	//Reset start_date and end_date to empty strings.
	function resetDates(){
	    if($scope.currentRecord != null){
		if($scope.currentRecord.start_date != null)
		    $scope.currentRecord.start_date.$date = '';
		if($scope.currentRecord.end_date != null)
		    $scope.currentRecord.end_date.$date = '';
	    }
	}
	
	//Removes button from the dublinForm list in this controller. Used to remove
	//form elements as needed to button list used to navigate through form.
	function removeDublinButton(buttonName){
	    if(dublinButtonList.indexOf(buttonName) > -1){
		var index = dublinButtonList.indexOf(buttonName);
		dublinButtonList.splice(index, 1);
		$scope.dublinFormList.splice(index, 1);
	    }
	}

	//Scope variable used to save form on every form element except the setup page.
	$scope.saveForm = function(formName) {
	    if(formName.indexOf('setup') == -1){
		$scope.submitDraftRecord();
	    }
	}

	//Check is current form element is valid. form.$valid resets every time $stateProvider changes
	//states, so we can check each form element individually, but we want to check the form a a whole on the review page.
	$scope.formIsValid = function(formType, form){
	    if(formType.indexOf('iso') > -1){
		$scope.isoFormList[getCurrentPage()].isValid = form.$valid;
	    }else if(formType.indexOf('dublin') > -1){
		$scope.dublinFormList[getCurrentPage()].isValid = form.$valid;
	    }else
		console.log("Error: tried to set object variable on unsupported form type.");

	    checkFormElement(formType, form.$valid);
	}

	function getFormType(){
	    var url = $location.url();
	    
	    if(url.indexOf('iso') > -1){
		return "iso";
	    }else if(url.indexOf('dublin') > -1){
		return "dublin";
	    }
	    else{
		//For error handling
		//console.log("Error: form is an unsupported type.");
	    }
	    return "";
	}

	//Checks if $scope.agreeTermsConditions, $scope.rightToPublish, and $scope.noSensitiveInformation are true. If so, will return true.
	function canPublish() {
	    if(($scope.agreeTermsConditions == true)
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

	/* Checks if all form elements of current form list are valid (complete), and if user has
	   agreed to the terms & conditions, record doesn't have sensitive information, and they have
	   the right to publish the information. Used in review.html for publish button.
	*/
	$scope.checkAllFormsValid = function(){
	    var url = $location.url();
	    
	    if(url.indexOf('iso') > -1){

		//Check all forms except review and template setup page (first and last)
		for(var i = 1; i < $scope.isoFormList.length-1; i++){
		    if($scope.isoFormList[i].isValid == false){
			return false;
		    }
		}
		//Check scope variables that user checks to agree to terms & conditions, record does not have
		//sensitive information, and they have the right to publish the information
		if(canPublish())
		    return true;
		else
		    return false;
	    }else if(url.indexOf('dublin') > -1){
		//Check all forms except review and template setup page (first and last)
		for(var i = 1; i < $scope.dublinFormList.length-1; i++){
		    if($scope.dublinFormList[i].isValid == false){
			return false;
		    }
		}

		//Check scope variables that user checks to agree to terms & conditions, record does not have
		//sensitive information, and they have the right to publish the information
		if(canPublish())
		    return true;
		else
		    return false;
	    }else
		console.log("Error: not in a supported form type.");

	    return false;
	}
	
	//Jump to form element (state in app.js) and set currentPageIndex to state index to keep "Back" and "Next" buttons and button list indecies the same. 
	$scope.jumpToPage = function(index, formType) {
	    if(formType.indexOf('iso') > -1){
		//Check index against array bounds
		if((index >= 0) || (index < isoButtonList.length)){
		    $state.go(isoButtonList[index]);
		    setCurrentPage(index);

		    //Set selected page's button to blue
		    highlightCurrentPage("iso");

		    //Hide button until animation is finished
		    hideButtonForAnimation();
		}
	    }else if(formType.indexOf('dublin') > -1){
		//Check index against array bounds
		if((index >= 0) || (index < isoButtonList.length)){
		    $state.go(dublinButtonList[index]);
		    setCurrentPage(index);
		    
		    //Set selected page's button to blue
		    highlightCurrentPage("dublin");

		    //Hide button until animation is finished
		    hideButtonForAnimation();

		}
	    }else
		console.log("Tried to index non-supported record type.");
	}

	//Reset background color to grey and hide both x and checkmark icons
	function greyButtonBackgrounds(formType){
	    if(formType.indexOf('iso') > -1){
		for(var i = 0; i < $scope.isoFormList.length; i++){
		    //Set button style variable in selected iso form object to what is stored in "backgroundColor" variable.
		    $scope.isoFormList[i].buttonStyle = getBackgroundColor();

		    //Set all icons that appear above breadcrumb button labels to not visible. Boolean values are used in ng-show tags.
		    $scope.isoFormList[i].dotIconStyle = false;
		    $scope.isoFormList[i].checkIconStyle = false;
		    $scope.isoFormList[i].xIconStyle = false;

		    //Reset right arrow's background color next to button too. isoButtonList has list of button id names,
		    //so use that to find element. Psuedo-elements are not on DOM list, so cant access directly though
		    //ng-style, so have to find afterwards and add and remove classes to get desired functionality.
		    var result = document.getElementById(isoButtonList[i]);
		    //Remove red, green, or dark green color classes if present.
		    angular.element(result).removeClass("complete");
		    angular.element(result).removeClass("not-complete");
		    angular.element(result).removeClass("selected");

		    angular.element(result).addClass("initial");
		}
	    }else if(formType.indexOf('dublin') > -1){
		for(var i = 0; i < $scope.dublinFormList.length; i++){
		    //Set button style variable in selected iso form object to what is stored in "backgroundColor" variable.
		    $scope.dublinFormList[i].buttonStyle = getBackgroundColor();

		    //Set all icons that appear above breadcrumb button labels to not visible. Boolean values are used in ng-show tags.
		    $scope.dublinFormList[i].dotIconStyle = false;
		    $scope.dublinFormList[i].checkIconStyle = false;
		    $scope.dublinFormList[i].xIconStyle = false;
		    
		    //Reset right arrow's background color next to button too. isoButtonList has list of button id names,
		    //so use that to find element. Psuedo-elements are not on DOM list, so cant access directly though
		    //ng-style, so have to find afterwards and add and remove classes to get desired functionality.
		    var result = document.getElementById(dublinButtonList[i]);
		    //Remove red, green, or dark green color classes if present.
		    angular.element(result).removeClass("complete");
		    angular.element(result).removeClass("not-complete");
		    angular.element(result).removeClass("selected");

		    angular.element(result).addClass("initial");
		}
	    }else
		console.log("Error: tried to reset non-supported form type's button backgrounds.");
	}

	//Get the index of the current form element 
	function getCurrentPage(index){
	    return currentPageIndex;
	}

	//Set the index of the current form element
	function setCurrentPage(index){
	    if(typeof index === 'number')
		currentPageIndex = index;
	    else
		console.log("Tried to set currentPageIndex to non-number.");
	}

	//Increment the current page index
	function incrementCurrentPage(i){
	    if(typeof i === 'number'){
		currentPageIndex += i;
	    }else
		console.log("Error: failed to increment current page. Input value was not a number");
	}

	//Checks to see if visited all of the current form section's elements has been completed.
	//If not, then turns corresponding form button red
	function checkFormElement(formType, formComplete){

	    //Get part of form name after "." in name. EX: "form.basic" returns "basic".
	    var parsedName = "";
	    
	    if(formType.indexOf('iso') > -1)
		parsedName = isoButtonList[getCurrentPage()].split(".")[1];
	    else if(formType.indexOf('dublin') > -1)
		parsedName = dublinButtonList[getCurrentPage()].split(".")[1];

	    /*
	      Function checks if $valid parameter passed in is true. If it is true, then all inputs with "required" tags
	      have been filled out. We need a little extra functionality though since $valid only works on elements with "required"
	      tags AND have ng-model elements bound to them. For example, file attachments are handled though a service, and are not
	      bound to currentRecord directly, so $valid will not work on that input.
	    */
	    switch(parsedName){
	    case "basic":
		//$valid does not work on this select elements with multiple select tag. So check manually here.
		if($scope.currentRecord.topic_category[0] == null){
		    formComplete = false;
		    break;
		}else if($scope.currentRecord.topic_category[0].length == 0){
		    formComplete = false;
		}
		break;
	    case "dataFormats":
		//If attachments array in currentRecord is null, then form for "dataFormats" is not complete
		if($scope.currentRecord.attachments == null){
		    formComplete = false;
		    break;
		}
		//If attachments array's length in currentRecord is 0 (i.e. no files have been attached),
		//then form for "dataFormats" is not complete.
		else if($scope.currentRecord.attachments.length == 0)
		    formComplete = false;
		
		break;
	    default:
		break;
	    }
	    
	    //If form element was not finished, then set corresponding button red. If it was, set corresponding
	    //button to green.
	    
	    if(formType.indexOf('iso') > -1){
		var index = 0;
		for(var i = 0; i < $scope.isoFormList.length; i++){
		    if($scope.isoFormList[i].form_name.indexOf(parsedName) > -1){
			index = i;
		    }
		}
		if(formComplete == false){
		    //If the current form partial is not complete, then set the background of
		    //the breadcrumb button to red.
		    $scope.isoFormList[index].buttonStyle = getNotCompleteColor();

		    //Triangles on right side of breadcrumbs buttons are psuedo-elements, so they are
		    //not part of the DOM. So, we have to find their parent, and add a new class to
		    //override the :after class psuedo-element to change the color. 
		    var result = document.getElementById(isoButtonList[getCurrentPage()]);

		    //Remove the class that makes the button "green"
		    angular.element(result).removeClass("complete");
		    angular.element(result).addClass("not-complete");

		    //Set "X" icon to visible, and others to not visible
		    $scope.isoFormList[index].checkIconStyle = false;
		    $scope.isoFormList[index].xIconStyle = true;
		    $scope.isoFormList[index].dotIconStyle = false;
		}else if(formComplete == true){
		    //Set button to green because it has been completed
		    $scope.isoFormList[index].buttonStyle = getCompleteColor();

		    //Triangles on right side of breadcrumbs buttons are psuedo-elements, so they are
		    //not part of the DOM. So, we have to find their parent, and add a new class to
		    //override the :after class psuedo-element to change the color. 
		    var result = document.getElementById(isoButtonList[getCurrentPage()]);

		    //Remove the class that makes the button "red" if present
		    angular.element(result).removeClass("not-complete");
		    //add class that makes the button's psuedo element "green" for complete.
		    angular.element(result).addClass("complete");

		    //Set checkmark icon to visible, and others to invisible.
		    $scope.isoFormList[index].checkIconStyle = true;
		    $scope.isoFormList[index].xIconStyle = false;
		    $scope.isoFormList[index].dotIconStyle = false;
		}
	    }else if(formType.indexOf('dublin') > -1){
		var index = 0;
		for(var i = 0; i < $scope.dublinFormList.length; i++){
		    if($scope.dublinFormList[i].form_name.indexOf(parsedName) > -1)
			index = i;
		}

		if(formComplete == false){
		    //Change button color to red, display x, and hide checkmark
		    $scope.dublinFormList[index].buttonStyle = getNotCompleteColor();

		    //Triangles on right side of breadcrumbs buttons are psuedo-elements, so they are
		    //not part of the DOM. So, we have to find their parent, and add a new class to
		    //override the :after class psuedo-element to change the color. 
		    var result = document.getElementById(dublinButtonList[getCurrentPage()]);
		    
		    //Remove the class that makes the button "green"
		    angular.element(result).removeClass("complete");
		    //Add class that makes button's psuedo element "red".
		    angular.element(result).addClass("not-complete");

		    //Set "X" icon to visible and others to not visible.
		    $scope.dublinFormList[index].checkIconStyle = false;
		    $scope.dublinFormList[index].xIconStyle = true;
		    $scope.dublinFormList[index].dotIconStyle = false;
		}else if(formComplete == true){
		    //Set button to green because it has been completed
		    $scope.dublinFormList[index].buttonStyle = getCompleteColor();

		    //Triangles on right side of breadcrumbs buttons are psuedo-elements, so they are
		    //not part of the DOM. So, we have to find their parent, and add a new class to
		    //override the :after class psuedo-element to change the color. 
		    var result = document.getElementById(dublinButtonList[getCurrentPage()]);
		    
		    //Remove the class that makes the button "red"
		    angular.element(result).removeClass("not-complete");
		    //Add class to button's psuedo element that makes it "green"
		    angular.element(result).addClass("complete");

		    //Set checkmark icon to visible, and set other icons to not visible.
		    $scope.dublinFormList[index].checkIconStyle = true;
		    $scope.dublinFormList[index].xIconStyle = false;
		    $scope.dublinFormList[index].dotIconStyle = false;
		}
	    }
	    else
		console.log("Error: tried to set background-color of unsupported form type.");
	}

	//Set background of selected button to selectedColor color. 
	function highlightCurrentPage(formType){
	    if(formType.indexOf("iso") > -1){
		$scope.isoFormList[getCurrentPage()].buttonStyle = getSelectedColor();
		var result = document.getElementById(isoButtonList[getCurrentPage()]);
		angular.element(result).removeClass("not-complete");
		angular.element(result).removeClass("complete");
		angular.element(result).addClass("selected");

		//Put dot above button text to symbolize it is selected
		$scope.isoFormList[getCurrentPage()].dotIconStyle = true;
		$scope.isoFormList[getCurrentPage()].checkIconStyle = false;
		$scope.isoFormList[getCurrentPage()].xIconStyle = false;
		
	    }else if(formType.indexOf("dublin") > -1){
		$scope.dublinFormList[getCurrentPage()].buttonStyle = getSelectedColor();

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

	//Set current form state to current state plus shift amount. Also returns to disclaimer state if back
	//or Save & Continue buttons pressed on "Terms & Conditions" or "Sensitive Information" states.
	$scope.setCurrentFormElement = function(shift, formType) {
	    if(formType.indexOf("iso") > -1){
		incrementCurrentPage(shift);

		//Hide button until animation is finished
		hideButtonForAnimation();

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

	    }else if(formType.indexOf("dublin") > -1){
		incrementCurrentPage(shift);

		//Hide button until animation is finished
		hideButtonForAnimation();
		
		if((getCurrentPage()) <= 0){
		    setCurrentPage(0);
		    
		}else if((getCurrentPage()) >= dublinButtonList.length){
		    setCurrentPage(dublinButtonList.length-1);
		}
		if(($state.is("form.termsConditions")) || ($state.is("form.sensitiveInformation"))){
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
	};

	/*
	  Return string copies of currentRecord keys and values for use in review.html. 
	  "access", "citation", "cls", and "id" key values are skipped because they are
	  displayed after ng-repeat loop of rest of values since the values of "access", and 
	  "citation" are arrays of objects, and they must be parsed individually to avoid
	  nesting problems.
	*/
	$scope.reviewFields = function(value, type){

	    //If value is array, then return strings joined with ", "
	    if((Array.isArray(value))
	       && (typeof value[0] === 'string')){
		return value.join(', ');
	    }

	    //If input value is the attachment url, get file name out of url (file name is from last "/" character to end of string.
	    //Unless the user uses Mac's ability to name files with a "/" character.
	    if(Array.isArray(value)){
		if(typeof value[0] === 'object'){
		    var completeValue = "";
		    for(var i = 0; i < value.length; i++){
			for(var key in value[i]){
			    if(key.indexOf("id") == -1)
				if(key.indexOf("url") > -1){
				    //Get name of file, which has been added on to end of URL.
				    //Get text from last "/" character.
				    completeValue = completeValue + value[i][key].substr(value[i][key].lastIndexOf("/")+1) + ", ";
				}
			}
		    }
		    return completeValue;
		}
	    }

	    //If value is date object, then return date string out of object
	    if(typeof value === 'object'){
		var completeValue = "";
		for(var key in value){
		    if(key.indexOf("$oid") > -1)
			return "";
		    if(key.indexOf("$date") > -1)
			completeValue = completeValue + value[key];
		    else
			completeValue = completeValue + key + " : " + value[key] + " | ";
		}
		return completeValue;
	    }

	    //Else, if value is a number or string, then return values converted into more
	    //human readable formats.
	    if(typeof value === 'number'){
		return value.toString();
	    }else if(value != null){
		var response = checkLength(value, type);
		return response;
	    }else{
		var response = checkNull(value, type);
		return response;
	    }
	}

	/* Change key variable name into more human readable format for review page. Used on currentRecord.
	   E.X.: data_format -> data format
	*/
	function translateKey(key, type){
	    key = key + "";
	    var delimString = key.split("_");
	    var parsedString = "";
	    for(var i = 0; i < delimString.length; i++){
		if(type.indexOf("key-string") > -1){
		    switch(delimString[i]){
		    case "mod":
			parsedString = parsedString + "Modification ";
			break;
		    case "pub":
			parsedString = parsedString + "Publication ";
			break;
		    case "org":
			parsedString = parsedString + "Organization ";
			break;
		    case "lat":
			parsedString = parsedString + "Latitude ";
			break;
		    case "lon":
			parsedString = parsedString + "Longitude ";
			break;
		    case "spatial":
			parsedString = parsedString + "Data ";
			break;
		    case "dtype":
			parsedString = parsedString + "Type";
			break;
		    case "status":
			parsedString = parsedString + "Update Status";
			break;
		    case "online":
			parsedString = parsedString + "URL ";
			break;
		    default:
			//Capitalize first character of each key
			parsedString = parsedString + delimString[i].charAt(0).toUpperCase() + delimString[i].slice(1) + " ";
			break;
		    }
		}else if(type.indexOf("value-string") > -1){
		    switch(delimString[i]){
		    case "true":
			parsedString = parsedString + "Yes ";
			break;
		    case "false":
			parsedString = parsedString + "No ";
			break;
		    default:
			//Return string with "_" characters replaced with " " (whitespace) characters.
			parsedString = parsedString + delimString[i] + " ";
			break;
		    }
		}
	    }
	    return parsedString;
	};

	/* Check if variable length is 0 (initialized with string of 
	   length 0 in services.js). If so, return empty string. 
	*/
	function checkLength(fieldName, type){
	    if(fieldName.length > 0)
		return translateKey(fieldName, type);
	    
	    return "";
	};

	// Check if variable is null. If so, return empty string.
	function checkNull(fieldName){
	    if(fieldName != null)
		return translateKey(fieldName, type);
		    
	    return "";
	};

	//Set display to none for "Back" and "Save & Continue" buttons for duration of
	//slide in animation of form.
	$scope.showButton = {};
	function hideButtonForAnimation() {
	    $scope.showButton = {"display": "none"};
	    //Wait for animation to finish, then change display back to show
	    $timeout(function(){
		$scope.showButton = {};
	    }, 700);
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
