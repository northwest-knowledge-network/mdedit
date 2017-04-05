'use strict';

/* Services */

metadataEditorApp
.factory('session_id', function()
{
    var session_id = '';

    // first see if we have any user information given to us (from Drupal)
    if (typeof(window.session_id) === 'undefined')
    {
        session_id = 'local';
    }
    else
    {
        session_id = window.session_id;
    }

    return session_id;
})
.factory('hostname', function()
{
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

    return hostname;
})
.factory('partialsPrefix', ['hostname', function(hostname)
{
    var ret = hostname.includes('localhost') ? '' : '/frontend/';
    return ret;
}])

/// TODO: fix this terrible comment ///
/**
 * Assign a record to the scope's current record. Not totatlly sure of its use.
 *
 * Mostly I think it's used to update the form with an existing record or with a
 * brand new record. One important thing is to make sure the date fields are
 * date-like in the sense that most humans expect, not Unix epochs.
 *
 * Args:
 *  (Object) actual record
 */
.factory('updateForms', ['$log', function($log)
{
    return function(scope, record)
    {
       /*
        * Need to do $scope with dates because our service returns them as
        * epoch seconds.
        */
        var dateFields =
            ['start_date', 'end_date', 'last_mod_date', 'first_pub_date', 'md_pub_date'];

        for (var idx = 0; idx < dateFields.length; idx++)
        {
            if (record.hasOwnProperty(dateFields[idx]))
            {
                record[dateFields[idx]].$date =
                    new Date(record[dateFields[idx]].$date);
            }
        }

        // these hours, minutes, seconds get put into broken out select boxes

        if (record.hasOwnProperty('start_date') && record.start_date.$date != '')
        {
	    
            record.start_date.$date.hours = record.start_date.$date.getHours();

            record.start_date.$date.minutes = record.start_date.$date.getMinutes();

            record.start_date.$date.seconds = record.start_date.$date.getSeconds();
        }

        if (record.hasOwnProperty('end_date') && record.end_date.$date != '')
        {
            record.end_date.$date.hours = record.end_date.$date.getHours();

            record.end_date.$date.minutes = record.end_date.$date.getMinutes();

            record.end_date.$date.seconds = record.end_date.$date.getSeconds();
        }

        scope.currentRecord = record;
        // This seems to be only for loading from the server.
        // If we are saving updates, this will just overwrite updates with
        // whatever came from the server, again, which is fine for loading from
        // the server, but we must first set record.data_format above
        scope.dataFormats.aux =
            record.data_format.filter(
                function(format) {
                    return scope.knownDataFormats.indexOf(format) === -1;
                }
            )
            .join(', ');

        scope.dataFormats.iso =
            record.data_format.filter(
                function (format) {
                    return scope.knownDataFormats.indexOf(format) > -1;
                }
        );

        if (!scope.currentRecord.online) {
            record.online = [""];
        }

        scope.currentRecord.place_keywords = record.place_keywords.join(', ');
	//Had to get rid of trailing witespace after comma because save after every page
	//change was adding extra whitespaces between words.
        scope.currentRecord.thematic_keywords = record.thematic_keywords.join(',');
    };
}])
.factory('updateAdmin', ['$log', function($log){
    return function(scope, record){
	//Contstruct empty record to display text that no results found. Don't want ng-repeat loop in partials/allRecords to try and
	//print variable that is not defined.
	var noResultsRecord = {"results":{}};
	noResultsRecord.results = [{"title":"No results!", "summary":"", "citation":[{"name":""}], "md_pub_date":""}];

	console.log("Printing inside updateAdmin: ");
	console.log(record);
	console.log("Printing record: " + record.results.length);
	if(record.results.length == 0)
	    scope.recordsList = noResultsRecord;
	else
	    scope.recordsList = record;
	scope.pageNumbers = [];
	var numbers = [];
	if(scope.recordsList.num_entries == 0){
	    numbers.push(1);
	}else{
	    for(var i = 0; i <= scope.recordsList.num_entries; i++){
		numbers.push(i+1);
	    }
	}
	scope.pageNumbers = numbers;
    }
}])
.factory('makeElasticsearchRecord', ['$log', function($log){
	    return function($scope, elasticsearchRecord){
	
	completeRecord = $scope.currentRecord;

	elasticsearchRecord.abstract = completeRecord.summary;

	//set all the identifiers
	for(var i = 0; i < completeRecord.identifiers.length; i++){
	    elasticsearchRecord.identifiers[i] = completeRecord.identifiers[i].type + " : " + completeRecord.identifiers[i].id; 
	}

	//First, put all the access contacts' names in to elasticsearchRecord's contact array. 
	for(var i = 0; i < completeRecord.access.length; i++){
	    //Services initializes first value of array to empty string ('') so we can't push
	    //onto array this first value or else the first value will be empty string. 
	    if((i == 0) && (completeRecord.access[i] == ''))
		elasticsearchRecord.contacts[i] = completeRecord.access[i].name;
	    else
		elasticsearchRecord.contacts.push(completeRecord.access[i].name);
	}

	//Now push citation contacts onto list
	for(var i = 0; i < completeRecord.citation.length; i++){
	    //Services initializes first value of array to empty string ('') so we can't push
	    //onto array this first value or else the first value will be empty string. 
	    if((i == 0) && (completeRecord.citation[i] == ''))
		elasticsearchRecord.contacts[i] = completeRecord.citation[i].name;
	    else
		elasticsearchRecord.contacts.push(completeRecord.citation[i].name);
	}

	//Get all keywords (from thematic_keyworks and place_keywords lists) and put them in same list.
	//First, get thematic_keyworks.
	for(var i = 0; i < completeRecord.thematic_keywords.length; i++){
	    //Services initializes first value of array to empty string ('') so we can't push
	    //onto array this first value or else the first value will be empty string. 
	    if((i == 0) && (completeRecord.thematic_keywords[i] == ''))
		elasticsearchRecord.keywords[i] = completeRecord.thematic_keywords[i];
	    else
		elasticsearchRecord.keywords.push(completeRecord.thematic_keywords[i]);
	}

	//Now, get place_keywords
	for(var i = 0; i < completeRecord.place_keywords.length; i++){
	    //Services initializes first value of array to empty string ('') so we can't push
	    //onto array this first value or else the first value will be empty string. 
	    if((i == 0) && (completeRecord.place_keywords[i] == ''))
		elasticsearchRecord.keywords[i] = completeRecord.place_keywords[i];
	    else
		elasticsearchRecord.keywords.push(completeRecord.place_keywords[i]);
	}

	//Not really sure how Geoportal is constructing urls. Could be using _id??  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<Not sure if this is correct! Need to talk to Ed to see what new url schema should be.

	//Set record type to 'iso', and change if record is actually dublin core. Used for url building.
	var recordType = 'iso';

	if (completeRecord.schema_type.indexOf("Non-Dataset (Dublin Core)") > -1)
	    recordType = 'dc';
	
	elasticsearchRecord.mdXmlPath = "https://nknportal.nkn.uidaho.edu/api/metadata/" + completeRecord._id.$oid + "/" + recordType;

	//Set lat and lon coordinates 
 	elasticsearchRecord.sbeast = completeRecord.east_lon;
	elasticsearchRecord.sbnorth = completeRecord.north_lat;
	elasticsearchRecord.sbsouth = completeRecord.south_lat;
	elasticsearchRecord.sbwest = completeRecord.west_lon;

	//Set title and ID
	elasticsearchRecord.title = completeRecord.title;
	elasticsearchRecord.uid = completeRecord._id.$oid;

	$scope.elasticsearchRecord = elasticsearchRecord;
    }
}])
.value('formElement', {
    form_name: '',
    label: '',
    buttonStyle: {},
    checkIconStyle: false,
    xIconStyle: false,
    dotIconStyle: false,
    isValid: false
})

.value('emptyISORecord',
{
    schema_type: 'Dataset (ISO)',
    title: '',
    summary: '',
    last_mod_date: {$date: new Date()},
    first_pub_date: {$date:''},
    md_pub_date: {$date: ''},

    update_frequency: '',
    status: '',
    spatial_dtype: '',
    hierarchy_level: '',
    topic_category: [''],
    place_keywords: '',
    thematic_keywords: '',
    research_methods: '',

    identifiers: [
	{type:'nkn',
	 id: ''
	},
	{type:'doi',
	 id: ''
	},
	{type:'ark',
	 id:''
	}
    ],
    
    data_format: [''],
    compression_technique: '',
    online: [''],
    use_restrictions: '',

    citation: [{
      'name': '', 'email': '', 'org': '', 'address': '',
	'city': '', 'state': '', 'zipcode': '', 'country': '', 'phone': '',
	'resource_url': ['']
    }],
    access: [{
      'name': '', 'email': '', 'org': '', 'address': '',
      'city': '', 'state': '', 'zipcode': '', 'country': '', 'phone': '',
	'resource_url': ['']
    }],

    west_lon: '',
    east_lon: '',
    north_lat: '',
    south_lat: '',

    start_date: {$date:''},
    
    end_date: {$date:''},
    
    doi_ark_request: '',
    assigned_doi_ark: '',
    data_one_search: 'false',
    reference_system: '',
    attachments: [],
    published: 'false'
})

.value('emptyDCRecord',
{
    schema_type: 'Non-Dataset (Dublin Core)',
    title: '',
    summary: '',
    last_mod_date: {$date: new Date()},
    first_pub_date: {$date:''},
    md_pub_date: {$date: ''},

    topic_category: [''],
    place_keywords: '',
    thematic_keywords: '',

    identifiers: [
	{type:'nkn',
	 id: ''
	},
	{type:'doi',
	 id: ''
	},
	{type:'ark',
	 id:''
	}
    ],
	
    data_format: [''],
    compression_technique: '',
    online: [''],
    use_restrictions: '',

    citation: [{
      'name': '', 'email': '', 'org': '', 'address': '',
      'city': '', 'state': '', 'zipcode': '', 'country': '', 'phone': '',
	'resource_url': ['']
    }],
    access: [{
      'name': '', 'email': '', 'org': '', 'address': '',
      'city': '', 'state': '', 'zipcode': '', 'country': '', 'phone': '',
	'resource_url': ['']
    }],

    west_lon: '',
    east_lon: '',
    north_lat: '',
    south_lat: '',

    start_date: {$date:''},
    
    end_date: {	$date:''},
    
    doi_ark_request: '',
    assigned_doi_ark: '',
    data_one_search: 'false',
    reference_system: '',
    attachments: [],
    published: 'false'
})
//This record is a reduced set of attributes used by Elasticsearch. 
.value('elasticsearchRecord', {
    abstract:'',
    contacts: [''],
    identifiers:[''],
    keywords: [''],
    mdXmlPath:'',
    sbeast:'',
    sbnorth:'',
    sbsouth:'',
    sbwest:'',
    record_source:'metadata_editor',
    title: '',
    uid:''
})
.value('milesFields',
{
    place_keywords: [
        "USA",
        "Idaho"
    ],

    thematic_keywords: [
        "IIA-1301792",
        "MILES",
        "EPSCoR"
    ],

    citation: [{
        "country": "USA",
        "state": "Idaho"
    }],

    online: [
        "https://www.idahoecosystems.org"
    ],

    west_lon: -117.2413657,
    east_lon: -111.043495,
    south_lat: 41.9880051,
    north_lat: 49.0011461,
    use_restrictions: "Access constraints: Data will be provided to all who agree to appropriately acknowledge the National Science Foundation (NSF), Idaho EPSCoR and the individual investigators responsible for the data set. By downloading these data and using them to produce further analysis and/or products, users agree to appropriately  acknowledge the National Science Foundation (NSF), Idaho  EPSCoR and the individual investigators responsible for the data set. Use constraints: Acceptable uses of data provided by Idaho EPSCoR include any academic, research, educational, governmental, recreational, or other not-for-profit activities. Any use of data provided by the Idaho EPSCoR must acknowledge Idaho EPSCoR and the funding source(s) that contributed to the collection of the data. Users are expected to inform the Idaho EPSCoR Office and the PI(s) responsible for the data of any work or publications based on data provided. Citation: The appropriate statement to be used when citing these data is 'data were provided by (Name, University Affiliation) through the support of the NSF Idaho EPSCoR Program and by the National Science Foundation under award number IIA-1301792.' More information about EPSCoR Research Data can be found at http://www.idahoepscor.org/"
})
.value('nkn', {
        "address": "875 Perimeter Dr. MS 2358",
        "city": "Moscow",
        "country": "USA",
        "name": "Northwest Knowledge Network",
        "email": "info@northwestknowledge.net",
        "org": "University of Idaho",
        "phone": "208-885-2080",
        "state": "Idaho",
        "zipcode": "83844-2358"
})
.service('recordService',
	 ['$http', '$q', '$log', '$location', 'hostname', 'session_id',
     'emptyISORecord', 'emptyDCRecord', 'elasticsearchRecord', 'milesFields', 'nkn', 'formElement',
	  function($http, $q, $log, $location, hostname, session_id,
             emptyISORecord, emptyDCRecord, elasticsearchRecord, milesFields, nkn, formElement)
    {
        /**
         * Private functions that will not be exposed to controller
         */

        /**
         * Prepare record being edited to save to the server. This takes the
         * scope as an argument, but doesn't modify the scope. It only returns
         * the current record ready to save to the server.
         *
         * @param {Object} scope Scope containing the metadata record to save
         *  to server.
         */
        var prepareRecordForSave = function(scope)
        {
            var record = scope.currentRecord;

            var serverReady = angular.copy(record);

            // server requires list of strings

	    if ((typeof record.place_keywords !== "undefined")
		&& ($location.url().indexOf('admin') == -1)){
		    console.log("Printing place_keywords: " + serverReady.place_keywords );
		    serverReady.place_keywords =
			serverReady.place_keywords.split(',')
			.map(function(el) { return el.trim(); });
	    }
	
	    if ((typeof record.thematic_keywords !== "undefined")
		&& ($location.url().indexOf('admin') == -1)){

                serverReady.thematic_keywords =
                    serverReady.thematic_keywords.split(',');
	    }
	    
            if (typeof record.data_format !== "undefined")

                serverReady.data_format = scope.dataFormats.iso;


            if (scope.dataFormats.aux){
                var auxList = scope.dataFormats.aux.split(',')
                                .map(function(el) { return el.trim(); });

                serverReady.data_format =
                    serverReady.data_format.concat(auxList);
            }

            // getTime returns Unix epoch seconds (or ms, don't remember)
            if (record.hasOwnProperty('start_date') && record.start_date.$date != ''
                && typeof record.start_date.$date !== "undefined")
            {
                serverReady.start_date.$date =
                    record.start_date.$date.getTime();
            }

            else
            {
                delete serverReady.start_date;
            }

            if (record.hasOwnProperty('end_date') && record.end_date.$date != ''
                && typeof record.end_date.$date !== "undefined")
            {

                serverReady.end_date.$date =
                    record.end_date.$date.getTime();
            }

            else
            {
                delete serverReady.end_date;
            }

            if (record.hasOwnProperty('first_pub_date') && record.first_pub_date.$date != ''
                && typeof record.first_pub_date.$date !== "undefined")
            {
                serverReady.first_pub_date.$date =
                    record.first_pub_date.$date.getTime();
            }

            else
            {
                delete serverReady.first_pub_date;
            }

            if (record.hasOwnProperty('md_pub_date') && record.md_pub_date.$date != ''
		&& typeof record.md_pub_date.$date !== "undefined"){
		    serverReady.md_pub_date.$date = new Date().getTime();
            }else{
		delete serverReady.md_pub_date;
	    }
	    
	    
            serverReady.last_mod_date.$date = new Date().getTime();

	    //Sanitize HTML in record to be sent to database
	    for(var key in serverReady){
		if(serverReady[key] != null){
		    if((Array.isArray(serverReady[key]))){
			//If value is array, then check each element for HTML
			for(var i = 0; i < serverReady[key].length; i++){
			    if(typeof serverReady[key][i] === 'object'){
				//If element in array is an object, then check each value of object for HTML
				for(var nestedKey in serverReady[key][i]){
				    if(typeof serverReady[key][i][nestedKey] === 'string')
					serverReady[key][i][nestedKey] = sanitizeInput(serverReady[key][i][nestedKey]);
				}
			    }else if(typeof serverReady[key][i] === 'string'){
				//If element in array is a string, then check for HTML
				serverReady[key][i] = sanitizeInput(serverReady[key][i]);
			    }
			}
		    }else if(typeof serverReady[key] === 'string'){
			//If value of serverReady record is a string, then check for HTML
			serverReady[key] = sanitizeInput(serverReady[key]);
		    }
		}
	    }

            return serverReady;
        };

	function sanitizeInput(value) {
	    //Perform HTML sanitization for user input.
	    var htmlPattern = /((<){1}(!--)?(\/)?[a-zA-Z]{1}([a-zA-Z0-9 ])*([ \n\t])*([a-zA-Z])*([a-zA-Z]*(=){1}(\"){1}.*(\"){1}([a-zA-Z \n\t])*)*([a-zA-Z0-9 \n\t])*(\/)?(-){0,2}(>){1})*(<!--)*(-->)*/g;
	    var phpPattern = /((<\?php){1}(.|\n)*(\?>){1}([ \n\t])*)*/g;

	    //Replace any html or PHP in string with "" and return. Removes HTML and PHP from string.
	    if((value != null)
	       && (typeof value !== 'number')){
		return value.replace(htmlPattern, "").replace(phpPattern, "");
	    }else
		return "";
	}

        /**
         * These functions are exposed by the service to the controllers.
         */

        /**
         * Return a cleared, newly instantiated
         * @return {[type]} [description]
         */
        var getFreshISORecord = function() {

            var freshyISO = angular.copy(emptyISORecord);

            return freshyISO;
        };

        var getFreshDCRecord = function() {

            var freshyDC = angular.copy(emptyDCRecord);

            return freshyDC;
        };

	//Get reduced set record that is used in Elasticsearch (for search performance optimization).
	//We don't want to index the entire index: that would decrease search efficiency.  
	var getFreshElasticsearchRecord = function(){
	    var freshyElasticsearch = angular.copy(elasticsearchRecord);

	    return freshyElasticsearch;
	};

        var getMilesDefaults = function() {

            var milesy = angular.copy(milesFields);

            return milesy;
        };

        var getNKNAsDistributor = function() {
            var nknContact = angular.copy(nkn);

            return nkn;
        };
	
	var getFreshFormElement = function() {
	    
            var freshFormElement = angular.copy(formElement);
	    
            return freshFormElement;
        };

        /**
         * @param {string} recordId ID of the record to be edited
         * @returns {Object} the record, ready for scope for editing
         */
        var getRecordToEdit = function(recordId)
        {
            var record = {};

            return $http.post('//' + hostname + '/api/metadata/' + recordId,
                              {'session_id': session_id})

                    .success(function(data)
                    {
                        record = data.record;
                    }
            );
        };
	
	/**
	 * Get all records for admin view. Returns a paginated list: only 10
	 * records at a time, but has access to all records if the user is an admin.
	 */
	var getAllRecords = function(pageNumber, recordsPerPage, sortBy) {
	    var record = {};
	    
	    return $http.post(
                '//' + hostname + '/api/metadata/admin/' + pageNumber + '/' + recordsPerPage + '/' + sortBy,
                {'session_id': session_id}).success(function(data){
		    record = data.record;
		});
	};

	var searchAllRecords = function(searchTerm, pageNumber, recordsPerPage, sortBy) {
	    var record = {};
	    console.log("In searchAllRecords: ");
	    return $http.post(
                '//' + hostname + '/api/metadata/admin/search/' + searchTerm + "/" + pageNumber + "/" + recordsPerPage + "/" + sortBy,
                {'session_id': session_id}).success(function(data){
		    record = data.record;
		});
	};

	/* Get records that want a DOI or ARK associated with them
	 */
	var getDoiArkRequests = function(pageNumber, recordsPerPage, sortBy) {
	    var record = {};
	    
	    return $http.post(
                '//' + hostname + '/api/metadata/doiark/' + pageNumber + '/' + recordsPerPage + '/' + sortBy,
                {'session_id': session_id}).success(function(data){
		    record = data.record;
		});
	};

	/* Get records that want a DOI or ARK associated with them
	 */
	var searchDoiArkRequests = function(searchTerm, pageNumber, recordsPerPage, sortBy) {
	    var record = {};

	    return $http.post(
                '//' + hostname + '/api/metadata/doiark/search/' + searchTerm + "/" + pageNumber + "/" + recordsPerPage + "/" + sortBy,
                {'session_id': session_id}).success(function(data){
		    record = data.record;
		});
	};

	/* This function publishes the record to Elasticsearch and the production directory by the admin.
	 */
	var adminApprovePublish = function(recordID, elasticsearchRecord){
	    return $http.post(
	                   '//' + hostname + '/api/metadata/' + recordID + '/admin-publish',
		           {'session_id':session_id,
			    'elasticsearch_record': elasticsearchRecord
			   }
	           );
	};
	
        /**
         * Remove a draft record from the server. Does not effect published
         * records.
         *
         * @param {String} _oid ObjectID of the record to be removed
         * @returns {Promise}
         */
        var delete_ = function (recordId) {
            $log.log('record deleted');
            return $http.post(
                '//' + hostname + '/api/metadata/' + recordId + '/delete',
                {'session_id': session_id});
        };

        /**
         * Save a draft record to the server.
         *
         * @param {Object} scope Scope object from the controller. No
         * modifications to the scope are made; a promise is returned
         * for use by the controller.
         * @returns {}
         */
        var saveDraft = function (scope) {

            var q;

            if (scope.newRecord)
            {
                $log.log(prepareRecordForSave(scope));
                q = $http.put('//' + hostname + '/api/metadata',
                          {'record': prepareRecordForSave(scope),
                           'session_id': session_id}
                );

            }
            else
            {
                var currentId = scope.currentRecord._id.$oid;

                q = $http.put('//' + hostname + '/api/metadata/' +
                        currentId,
                          {'record': prepareRecordForSave(scope),
                           'session_id': session_id}
                );
            }

            return q;
        };

        var list = function () {
            return $http.post('//' + hostname + '/api/metadata',
                              {'session_id': session_id});
        };


        /**
         * Publish metadata, meaning request a curator to review metadata
         * quality then eventually have their data and metadata publicly
         * discoverable.
         *
         * First the function saves the current version as a draft, then
         * if that Promise (or sth like Angular's specialized Promise, is it
         * called HttpResult?) is successful, send the record to the
         * publishing route on the server.
         *
         * @param  {Object} scope
         * @return {Promise}
         */
        var publish = function(scope)
        {

            var current = prepareRecordForSave(scope);
	    
            var record = current;

	    //md_pub_date has been deleted when saved or else the server will throw an error for an empty string.
	    //MongoDB has a bug for dateTimeField not allowing null or strings of length 0 to construct dateTimeField.
	    //Objects constructed with either of these will be deleted from MongoDB regardless of using dateTimeField(null=True);
	    //So we just add md_pub_date back to the record when publishing and set md_pub_date to the current time.
	    record.md_pub_date = {};
	    var currentDate = new Date().getTime();
            record.md_pub_date.$date = currentDate;

	    scope.md_pub_date = {};
	    scope.md_pub_date = currentDate;

	    //Change record's 'published' attribute to 'true' to allow for search by admin
	    scope.published = 'true';
	    
            var serverReady = angular.copy(record);

            // do this sync (1/26 um.. what? -mt)
            saveDraft(scope);

            var currentId = scope.currentRecord._id.$oid;

            return $http.post(
                '//' + hostname + '/api/metadata/' + currentId + '/publish',
		{'record': current, 'elasticsearch_record': $scope.elasticsearchRecord, 'session_id': session_id}
            );
	    
	    
        };

        return {
	    adminApprovePublish: adminApprovePublish,
            getFreshISORecord: getFreshISORecord,
            getFreshDCRecord: getFreshDCRecord,
	    getFreshElasticsearchRecord: getFreshElasticsearchRecord,
            getMilesDefaults: getMilesDefaults,
            getNKNAsDistributor: getNKNAsDistributor,
            getRecordToEdit: getRecordToEdit,
	    getDoiArkRequests: getDoiArkRequests,
	    getAllRecords: getAllRecords,
	    searchAllRecords: searchAllRecords,
	    searchDoiArkRequests: searchDoiArkRequests,
            saveDraft: saveDraft,
            delete: delete_,
            list: list,
            publish: publish,
	    getFreshFormElement: getFreshFormElement
        };
    }
])
.service('sharedRecord', function(){
	var record;

	return {
	    getRecord: function() {
		return record;
	    },
	    setRecord: function(value) {
		record = value;
	    }
	};
})
.service('Geoprocessing', ['$http', '$q', 'hostname', function($http, $q, hostname) {
    var getBbox = function(placeName) {
        var baseUrl = '//' + hostname + '/api/geocode/';
        var fullUrl = baseUrl + placeName;

        return $http.get(fullUrl);
    };

    return {
        getBbox: getBbox
    };
}])
/**
 * The attachment service must do two things: upload data to the datastore
 * and, if successful, request the download URL be added to the
 */
    .service('AttachmentService', ['$http', '$log', 'hostname', 'session_id', 'envService', function($http, $log, hostname, session_id, envService) {
    //Get Angular enviroment variables
    var environment = envService.get();	
	
    /* use a test uploadUrl for e2e tests.
        comment out following block and uncomment the next block to
        test with NKN resources
    */
	var uploadUrl = envService.read('uploadUrl');

    var attachBaseRoute;
	if (hostname !== 'localhost:4000') {
            attachBaseRoute = 'https://' + hostname + '/api/metadata/';
    }
	else {
            attachBaseRoute = '//' + hostname + '/api/metadata/';
    }

    var uploadFile = function(file, recordId) {

        var fd = new FormData();

        fd.append('uploadedfile', file);
        fd.append('uuid', recordId);
	fd.append('session_id', session_id);
	
        return $http.post(uploadUrl, fd, {
            // transformRequest: angular.identity,
            headers: {'Content-Type': undefined},
	});
    };

    var attachFile = function(attachmentUrl, recordId) {
        var attachRoute = attachBaseRoute + recordId + '/attachments';
        return $http.post(attachRoute, {
	    attachment: attachmentUrl,
	    'session_id': session_id
	});
    };

    /**
     * Detach a file with the given attachmentId. Once an attachment has
     * been created we create a URI for it, which can then be accessed for
     * DELETE
     */
    var detachFile = function(attachmentId, recordId) {
        var attachRoute =
            attachBaseRoute + recordId + '/attachments/' + attachmentId;
        return $http.delete(attachRoute);
    };

    return {
        uploadFile: uploadFile,
        attachFile: attachFile,
        detachFile: detachFile
    };
}]);
