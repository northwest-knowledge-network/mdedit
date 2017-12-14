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
/**
 *  Construct Elasticsearch record. This is a subset of the total record attributes.
 */
.factory('makeElasticsearchRecord', ['$log', function($log){
    return function(scope, record, elasticsearchRecord){

	elasticsearchRecord.abstract = record.summary;

	//set all the identifiers
	for(let i = 0; i < record.identifiers.length; i++){
		if(i == 0)		
	    		elasticsearchRecord.identifiers[i] = record.identifiers[i].type + " : " + record.identifiers[i].id; 
		else
			elasticsearchRecord.identifiers.push(record.identifiers[i].type + " : " + record.identifiers[i].id); 
	}

	//First, put all the access contacts' names in to elasticsearchRecord's contact array. 
	for(var i = 0, x = record.access.length; i < x; i++){
	    //Services initializes first value of array to empty string ('') so we can't push
	    //onto array this first value or else the first value will be empty string. 
	    if((i == 0) && (record.access[i] == ''))
		elasticsearchRecord.contacts[i] = record.access[i].name;
	    else
		elasticsearchRecord.contacts.push(record.access[i].name);
	}

	//Now push citation contacts onto list
	for(let i = 0, x = record.citation.length; i < x; i++){
	    //Services initializes first value of array to empty string ('') so we can't push
	    //onto array this first value or else the first value will be empty string. 
	    if((i == 0) && (record.citation[i] == ''))
		elasticsearchRecord.contacts[i] = record.citation[i].name;
	    else
		elasticsearchRecord.contacts.push(record.citation[i].name);
	}
 
	//Get all keywords (from thematic_keyworks and place_keywords lists) and put them in same list.
	//First, get thematic_keyworks.
	for(let i = 0, x = record.thematic_keywords.length; i < x; i++){
	    //Services initializes first value of array to empty string ('') so we can't push
	    //onto array this first value or else the first value will be empty string. 
	    if((i == 0) && (record.thematic_keywords[i] == ''))
		elasticsearchRecord.keywords[i] = record.thematic_keywords[i];
	    else
		elasticsearchRecord.keywords.push(record.thematic_keywords[i]);
	}

	//Now, get place_keywords
	for(let i = 0, x = record.place_keywords.length; i < x; i++){
	    //Services initializes first value of array to empty string ('') so we can't push
	    //onto array this first value or else the first value will be empty string. 
	    if((i == 0) && (record.place_keywords[i] == ''))
		elasticsearchRecord.keywords[i] = record.place_keywords[i];
	    else
		elasticsearchRecord.keywords.push(record.place_keywords[i]);
	}

	//Put topic_category in the keywords list too
	for(let i = 0, x = record.topic_category.length; i < x; i++){
	    //Services initializes first value of array to empty string ('') so we can't push
	    //onto array this first value or else the first value will be empty string. 
	    if((i == 0) && (record.topic_category[i] == ''))
		elasticsearchRecord.keywords[i] = record.topic_category[i];
	    else
		elasticsearchRecord.keywords.push(record.topic_category[i]);
	}

	//Set record type to 'iso', and change if record is actually dublin core. Used for url building.
	var recordType = 'iso';

	if (record.schema_type.indexOf("Non-Dataset (Dublin Core)") > -1)
	    recordType = 'dc';

	//Put the path to XML representation of data in Elasticsearch record.
	elasticsearchRecord.mdXmlPath = "http://www.northwestknowledge.net/data/" + record._id.$oid + "/metadata.xml";

	//Set lat and lon coordinates 
 	elasticsearchRecord.sbeast = record.east_lon;
	elasticsearchRecord.sbnorth = record.north_lat;
	elasticsearchRecord.sbsouth = record.south_lat;
	elasticsearchRecord.sbwest = record.west_lon;

	//Set title and ID
	elasticsearchRecord.title = record.title;
	elasticsearchRecord.uid = record._id.$oid;

	//Assign created elasticsearch object to scope object
	scope.elasticsearchRecord = elasticsearchRecord;
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
	//online was the original string array, and we needed to make an array of objects later for the 
	//data in online_descriptions related to the url stored in "online" but we can't update 
	//the MongoDB in place to convert the "online" strings to JSON objects. This extra array is a byproduct
	//of scope-creep. And we can't just change to array of objects because it will break
	//compatibility with existing records already in the system. 
    online: [''],
    online_description: [
	{
	    "type":"",
	    "description":"",
	    "file_size":"",
	    "size_unit":""		
	}
    ],

    use_restrictions: '',
    user_defined_use_restrictions: false,
    
    citation: [{
      'name': '', 'email': '', 'org': '', 'address': '',
      'city': '', 'state': '', 'zipcode': '', 'country': '', 'phone': '',
	  'resource_url': [''], 'resource_url_description': [{"type":"","description":"","file_size":"","size_unit":""}]
    }],
    access: [{
      'name': '', 'email': '', 'org': '', 'address': '',
      'city': '', 'state': '', 'zipcode': '', 'country': '', 'phone': '',
	  'resource_url': [''], 'resource_url_description': [{"type":"","description":"","file_size":"","size_unit":""}]	
    }],

    west_lon: '',
    east_lon: '',
    north_lat: '',
    south_lat: '',

    start_date: {$date:''},
    
    end_date: {$date:''},
    
    references_existing_data: false,

    doi_ark_request: 'neither',
    assigned_doi_ark: '',
    data_one_search: 'false',
    reference_system: '',
    attachments: [],
    uploaded_file_size:'',
    uploaded_file_size_unit:'',
    uploaded_file_description:'',
    published: 'false',
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
    online_description: [
	{
	    "type":"",
	    "description":"",
	    "file_size":"",
	    "size_unit":""
	}
    ],
    use_restrictions: '',
    user_defined_use_restrictions: false,

    citation: [{
      'name': '', 'email': '', 'org': '', 'address': '',
      'city': '', 'state': '', 'zipcode': '', 'country': '', 'phone': '',
	  'resource_url': [''], 'resource_url_description': [{"type":"","description":""}]
    }],
    access: [{
      'name': '', 'email': '', 'org': '', 'address': '',
      'city': '', 'state': '', 'zipcode': '', 'country': '', 'phone': '',
	  'resource_url': [''], 'resource_url_description': [{"type":"","description":""}]
    }],

    west_lon: '',
    east_lon: '',
    north_lat: '',
    south_lat: '',

    start_date: {$date:''},
    
    end_date: {	$date:''},
    
    references_existing_data: false,

    doi_ark_request: 'neither',
    assigned_doi_ark: '',
    data_one_search: 'false',
    reference_system: '',
    attachments: [],
    uploaded_file_size:'',
    uploaded_file_size_unit:'',
    uploaded_file_description:'',
    published: 'false',
})
//This record is a reduced set of attributes used by Elasticsearch. 
.value('elasticsearchRecord', {
    abstract:'',
    contacts: [''],
    collection: '',
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
	  'emptyISORecord', 'emptyDCRecord', 'elasticsearchRecord', 'milesFields', 'nkn', 'formElement', 'envService',
	  function($http, $q, $log, $location, hostname, session_id,
		   emptyISORecord, emptyDCRecord, elasticsearchRecord, milesFields, nkn, formElement, envService)
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
            if ((record.hasOwnProperty('start_date'))
		 && (record.start_date.$date != '')
                && (typeof record.start_date.$date !== "undefined")
		&& (typeof record.start_date.$date !== "number"))
            {
                serverReady.start_date.$date =
                    record.start_date.$date.getTime();
            }

            else
            {
                delete serverReady.start_date;
            }

            if ((record.hasOwnProperty('end_date'))
		 && (record.end_date.$date != '')
                 && (typeof record.end_date.$date !== "undefined")
		&& (typeof record.end_date.$date !== "number"))

            {

                serverReady.end_date.$date =
                    record.end_date.$date.getTime();
            }

            else
            {
                delete serverReady.end_date;
            }

            if ((record.hasOwnProperty('first_pub_date'))
		&& (record.first_pub_date.$date != '')
                && (typeof record.first_pub_date.$date !== "undefined")
		&& (typeof record.first_pub_date.$date !== "number"))

		{
                serverReady.first_pub_date.$date =
                    record.first_pub_date.$date.getTime();
            }

            else
            {
                delete serverReady.first_pub_date;
            }

            if ((record.hasOwnProperty('md_pub_date')) 
		&& (record.md_pub_date.$date != '')
		&& (typeof record.md_pub_date.$date !== "undefined")
		&& (typeof record.md_pub_date.$date !== "number")){

		    serverReady.md_pub_date.$date = new Date().getTime();
            }else{
		delete serverReady.md_pub_date;
	    }
	    
	    
            serverReady.last_mod_date.$date = new Date().getTime();

	    //Sanitize HTML in record to be sent to database
	    for(var key in serverReady){
		if(serverReady[key] != null){
		    //If element in record is an array, then loop through the array and sanitize each element
		    if(Array.isArray(serverReady[key])){
			for(var i = 0, x = serverReady[key].length; i < x; i++){
			    //If array element is an object, then loop though the object's attributes
			    if(typeof serverReady[key][i] === 'object'){
				for(var nestedKey in serverReady[key][i]){
				    //If object's type is string, then return sanitized version of string
				    if(typeof serverReady[key][i][nestedKey] === 'string')
					serverReady[key][i][nestedKey] = sanitizeInput(serverReady[key][i][nestedKey]);
				}
			    }
			    //If the array element is a string, then return a sanitized version of that string
			    else if(typeof serverReady[key][i] === 'string'){
				//If element in array is a string, then check for HTML
				serverReady[key][i] = sanitizeInput(serverReady[key][i]);
			    }
			}
		    }
		    //If attribute is not an array, but is a string, then return a sanitized version of that string.
		    else if(typeof serverReady[key] === 'string'){
			//If value of serverReady record is a string, then check for HTML
			serverReady[key] = sanitizeInput(serverReady[key]);
		    }
		}
	    }

            return serverReady;
        };

	/**
	 *  Checks string to see if it has an HTML or PHP tag in it. If so, then remove it
	 *  @param {string} value
	 *  @return {string} 
	 */
	function sanitizeInput(recordString) {
	    //Perform HTML sanitization for user input.
	    var htmlPattern = /((<){1}(!--)?(\/)?[a-zA-Z]{1}([a-zA-Z0-9 ])*([ \n\t])*([a-zA-Z])*([a-zA-Z]*(=){1}(\"){1}.*(\"){1}([a-zA-Z \n\t])*)*([a-zA-Z0-9 \n\t])*(\/)?(-){0,2}(>){1})*(<!--)*(-->)*/g;
	    var phpPattern = /((<\?php){1}(.|\n)*(\?>){1}([ \n\t])*)*/g;

	    //Replace any html or PHP in string with "" and return. Removes HTML and PHP from string.
	    if((recordString != null)
	       && (typeof recordString === 'string')){
		return recordString.replace(htmlPattern, "").replace(phpPattern, "");
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
	
	/**
	 *  Get new Dublin Core object
	 *  @param {none} none
	 *  @return {object} freshyDC
	 */
        var getFreshDCRecord = function() {

            var freshyDC = angular.copy(emptyDCRecord);

            return freshyDC;
        };

	/**
	 *  Get reduced set record that is used in Elasticsearch (for search performance optimization).
	 *  We don't want to index the entire index: that would decrease search efficiency.  
	 *  @param {none} none
	 *  @return {object} freshyElasticsearch
	 */
	var getFreshElasticsearchRecord = function(){
	    var freshyElasticsearch = angular.copy(elasticsearchRecord);

	    return freshyElasticsearch;
	};

	/**
	 *  Get MILES default values
	 *  @param {none} none
	 *  @return {none} milesy
	 */
        var getMilesDefaults = function() {

            var milesy = angular.copy(milesFields);

            return milesy;
        };

	/**
	 *  Return default values if NKN is a data distributor
	 *  @param {none} none
	 *  @return {object} nkn
	 */
        var getNKNAsDistributor = function() {
            var nknContact = angular.copy(nkn);

            return nkn;
        };
	
	/**
	 *  Get a new object that represents a form element in the progress bar
	 *  @param {none} none
	 *  @return {object} freshFormElement
	 */
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
	 *  When an admin needs to edit someone else's record, then they 
	 *  will use this route in the backend. It athenicates only admins.
	 *  @param {number} recordId
	 *  @return {Promise} $http.post 
	 */
	var adminGetUsersRecord = function(recordId)
        {
            var record = {};

            return $http.post('//' + hostname + '/api/metadata/load-record/' + recordId,
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
	 *  @param {number} pageNumber
	 *  @param {number} recordsPerPage
	 *  @param {string} sortBy
	 *  @param {string} publishState
	 *  @return {Promise} $http.post 
	 */
	var getAllRecords = function(pageNumber, recordsPerPage, sortBy, publishState) {
	    var record = {};
	    return $http.post('//' + hostname + '/api/metadata/admin/' + pageNumber + '/' + recordsPerPage + '/' + sortBy + '/' + publishState,
				      {'session_id': session_id}).success(function(data){
					  record = data.record;
				      });
	};

	/**
	 *  Search all records for a record matching the search term. Sort by the selected attribute. And search records already
	 *  published, waiting to be reviewed, or not yet submitted for review. 
	 *  @param {string} searchTerm
	 *  @param {number} pageNumber
	 *  @param {number} recordsPerPage
	 *  @param {string} sortBy
	 *  @param {string} recordState
	 *  @return {Promise} $http.post 
	 */
	var searchAllRecords = function(searchTerm, pageNumber, recordsPerPage, sortBy, recordState) {
	    var record = {};
	    return  $http.post(
                '//' + hostname + '/api/metadata/admin/search/' + searchTerm + "/" + pageNumber + "/" + recordsPerPage + "/" + sortBy,
	        {'session_id': session_id,
		'record_state': recordState
		}).success(function(data){
		    record = data.record;
		});
	};

	/** 
	 *  Get records that want a DOI or ARK associated with them
	 *  @param {number} pageNumber
	 *  @param {number} recordsPerPage
	 *  @param {string} sortBy
	 *  @return {Promise} $http.post 
	 */
	var getDoiArkRequests = function(pageNumber, recordsPerPage, sortBy) {
	    var record = {};
	    return $http.post(
                '//' + hostname + '/api/metadata/doiark/' + pageNumber + '/' + recordsPerPage + '/' + sortBy,
                {'session_id': session_id}).success(function(data){
		    record = data.record;
		});
	};

	/** 
	 *  Get records that want a DOI or ARK associated with them
	 *  @param {string} searchTerm
         *  @param {number} pageNumber
         *  @param {number} recordsPerPage
         *  @param {string} sortBy
         *  @return {Promise} $http.post
	 */
	var searchDoiArkRequests = function(searchTerm, pageNumber, recordsPerPage, sortBy) {
	    var record = {};

	    return $http.post(
                '//' + hostname + '/api/metadata/doiark/search/' + searchTerm + "/" + pageNumber + "/" + recordsPerPage + "/" + sortBy,
                {'session_id': session_id}).success(function(data){
		    record = data.record;
		});
	};

	/**
	 *  This function publishes the record to Elasticsearch and the production directory by the admin.
	 *  @param {number} recordID
         *  @param {object} elasticsearchRecord
         *  @param {object} scope
         *  @return {Promise} $http.post
	 */
	var adminApprovePublish = function(recordID, elasticsearchRecord, scope){
		saveDraft(scope);

	    	return $http.post(
	                   '//' + hostname + '/api/metadata/' + recordID + '/admin-publish',
		           {'session_id':session_id,
			    'elasticsearch_record': elasticsearchRecord,
			    'schema_type': scope.currentRecord.schema_type
			   }
	    );
	};

	/** 
 	 * Check if current user is admin by authenticating admin though backend route
	 *  @param {none} none
         *  @return {Promise} $http.post
 	 */
	var authenticateAdmin = function(){
		return $http.post(
	                   '//' + hostname + '/api/authenticate-admin/',
		           {'session_id':session_id}
		);
	};

	/**
	 *  Unpublish a record
	 *  @param {number} recordID
         *  @param {object} scope
         *  @return {none} none
	 */
	var unpublishRecord = function(recordID, scope){
		scope.currentRecord.published = "pending";
		//Call backend route to move file from production to pre-production.
	};

	/**
	 *  Check if response object from backend authenticated the user correctly. 
	 *  If not, then return false.
	 *  @param {number} status
	 *  @return {none} none
	 */
	var checkAdmin = function(status){
	    if((status == 401)
	     || (status == 403)){
		/* Change page to ISO record because
		 *  the user was not authenticated as an admin. Either the
		 * response came from the wrong url, or the response code 
		 * was not 200.
		 */
		$location.path('/iso');
	    }
	};

	/**
	 *  Sends post request to backend to check if user is admin user or not
	 *  @param {none} none
	 *  @return {Promose} $http.post
	 */
	var authenticateAdmin = function() {
	    var record = {};
	    return $http.post(
                '//' + hostname + '/api/metadata/authenticate-admin',
	        {'session_id': session_id});
	};


        /**
         * Remove a draft record from the server. Does not effect published
         * records.
         *
         * @param {String} _oid ObjectID of the record to be removed
         * @returns {Promise}
         */
        var delete_ = function (recordId) {
            $log.log('record deleted: ' + recordId);
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
         * Publish metadata, meaning request a data curator to review metadata
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

	    //Change record's 'published' attribute to 'pending' to allow for search by admin
	    record.published = "pending";

            var serverReady = angular.copy(record);

            // do this sync (1/26 um.. what? -mt)
            saveDraft(scope).then(function(){

		    var currentId = scope.currentRecord._id.$oid;
		    
		    return $http.post('//' + hostname + '/api/metadata/' + currentId + '/publish',
			              {'record': record, 'session_id': session_id});
		});
        };

        return {
	    adminApprovePublish: adminApprovePublish,
	    adminGetUsersRecord: adminGetUsersRecord,
	    authenticateAdmin: authenticateAdmin,
	    checkAdmin: checkAdmin,
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
	    envService.set('development');
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
	    
	    /**
	     *  Upload a file to the Backend API
	     *  @param {file} file
	     *  @param {number} recordId
	     *  @return {Promise} $http.post
	     */
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
	    
	    /**
	     *  Attach a file with the given URL. We create a URI for this
	     *  file and store it.
	     *  @param {string} attachmentUrl
	     *  @param {number} recordId
	     *  @return {Promise} $http.post
	     */
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
	     * deletion
	     * @param {number} attachmentId
	     * @param {number} recordId
	     * @return {Promise} $http.post
	     */
	    var detachFile = function(attachmentId, recordId) {
		var attachRoute =
		attachBaseRoute + recordId + '/attachments/' + attachmentId;
		return $http.post(attachRoute, 
	    {'session_id':session_id});
	    };
	    
	    return {
		    uploadFile: uploadFile,
		    attachFile: attachFile,
		    detachFile: detachFile
	    };
	}]);