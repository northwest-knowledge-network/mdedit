'use strict';

/* Services */

metadataEditorApp
.factory('sessionId', function()
{
    var sessionId = '';

    // first see if we have any user information given to us (from Drupal)
    if (typeof(window.sessionId) === 'undefined')
    {
        sessionId = 'local';
    }
    else
    {
        sessionId = window.sessionId;
    }

    return sessionId;
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
            ['start_date', 'end_date', 'last_mod_date', 'first_pub_date'];

        for (var idx = 0; idx < dateFields.length; idx++)
        {
            record[dateFields[idx]].$date =
                new Date(record[dateFields[idx]].$date);
        }

        // these hours, minutes, seconds get put into broken out select boxes
        record.start_date.hours = record.start_date.$date.getHours();
        record.end_date.hours = record.end_date.$date.getHours();

        record.start_date.minutes = record.start_date.$date.getMinutes();
        record.end_date.minutes = record.end_date.$date.getMinutes();

        record.start_date.seconds = record.start_date.$date.getSeconds();
        record.end_date.seconds = record.end_date.$date.getSeconds();

        scope.currentRecord = record;
        // This seems to be only for loading from the server.
        // If we are saving updates, this will just overwrite updates with
        // whatever came from the server, again, which is fine for loading from
        // the server, but we must first set record.data_format above
        scope.dataFormats.aux =
            record.data_format.filter(
                format =>
                    scope.knownDataFormats.indexOf(format) === -1
            )
            .join(', ');

        scope.dataFormats.iso =
            record.data_format.filter(
                format =>
                    scope.knownDataFormats.indexOf(format) > -1
        );

        if (!scope.currentRecord.online) {
            record.online = [""];
        }

        scope.currentRecord.place_keywords = record.place_keywords.join(', ');
        scope.currentRecord.thematic_keywords = record.thematic_keywords.join(', ');
    };
}])
.value('emptyRecord',
{
    title: '',
    summary: '',
    last_mod_date: {$date: new Date(2010, 0, 1)},
    first_pub_date: {$date: new Date()},

    update_frequency: '',
    status: '',
    spatial_dtype: '',
    hierarchy_level: '',
    topic_category: [''],
    place_keywords: '',
    thematic_keywords: '',

    data_format: [''],
    compression_technique: '',
    online: [''],
    use_restrictions: '',

    citation: [{
      'name': '', 'email': '', 'org': '', 'address': '',
      'city': '', 'state': '', 'zipcode': '', 'country': '', 'phone': ''
    }],
    access: [{
      'name': '', 'email': '', 'org': '', 'address': '',
      'city': '', 'state': '', 'zipcode': '', 'country': '', 'phone': ''
    }],

    west_lon: '',
    east_lon: '',
    north_lat: '',
    south_lat: '',

    start_date: {$date: new Date(2010, 0, 1)},
    end_date: {$date: new Date()}
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

    access: [{
        "address": "875 Perimeter Dr. MS 2358",
        "city": "Moscow",
        "country": "USA",
        "name": "Northwest Knowledge Network",
        "email": "info@northwestknowledge.net",
        "org": "University of Idaho",
        "phone": "208-885-2080",
        "state": "Idaho",
        "zipcode": "83844-2358"
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
    ['$http', '$q', '$log', 'hostname', 'sessionId',
            'emptyRecord', 'milesFields', 'nkn',
    function($http, $q, $log, hostname, sessionId,
             emptyRecord, milesFields, nkn)
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
            serverReady.place_keywords =
                serverReady.place_keywords.split(',')
                    .map(el => el.trim());

            serverReady.thematic_keywords =
                serverReady.thematic_keywords.split(',')
                    .map(el => el.trim());

            serverReady.data_format = scope.dataFormats.iso;

            if (scope.dataFormats.aux)
            {
              var auxList = scope.dataFormats.aux.split(',')
                                 .map(el => el.trim());

              serverReady.data_format =
                serverReady.data_format.concat(auxList);
            }

            // getTime returns Unix epoch seconds (or ms, don't remember)
            serverReady.start_date.$date =
                record.start_date.$date.getTime();

            serverReady.end_date.$date =
                record.end_date.$date.getTime();

            serverReady.first_pub_date.$date =
                record.first_pub_date.$date.getTime();

            serverReady.last_mod_date.$date = new Date().getTime();
                // record.last_mod_date.$date.getTime();

            return serverReady;
        };


        /**
         * These functions are exposed by the service to the controllers.
         */

        /**
         * Return a cleared, newly instantiated
         * @return {[type]} [description]
         */
        var getFreshRecord = function() {

            var freshy = angular.copy(emptyRecord);

            return freshy;
        };

        var getMilesDefaults = function() {

            var milesy = angular.copy(milesFields);

            return milesy;
        };

        var getNKNAsDistributor = function() {
            var nknContact = angular.copy(nkn);

            return nkn;
        };


        /**
         * @param {string} recordId ID of the record to be edited
         * @returns {Object} the record, ready for scope for editing
         */
        var getRecordToEdit = function(recordId)
        {
            var record = {};

            return $http.post('//' + hostname + '/api/metadata/' + recordId,
                              {'session_id': sessionId})

                    .success(function(data)
                    {
                        record = data.record;
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
                    }
            );
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
                           'session_id': sessionId}
                );

            }
            else
            {
                var currentId = scope.currentRecord._id.$oid;

                q = $http.put('//' + hostname + '/api/metadata/' +
                        currentId,
                          {'record': prepareRecordForSave(scope),
                           'session_id': sessionId}
                );
            }

            return q;
        };

        var list = function () {
            return $http.post('//' + hostname + '/api/metadata',
                              {'session_id': sessionId});
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

            // there are two promises to work with:
            var draftQ;  // save draft promise
            var publishQ;  // publish promise, returned from `publish` call
            var q;

            draftQ = saveDraft(scope);

            // this is a little wasteful to send the record back to server,
            // but probably not consequential
            // draftQ
            //     .success(() => {
                    var currentId = scope.currentRecord._id.$oid;

                    q = $http.post(
                        '//' + hostname + '/api/metadata/' +
                            currentId + '/publish',
                        current);
                // });
                // .error(() => { $log.log('error!!!'); publishQ = draftQ; });

            return q;
        };

        return {
            getFreshRecord: getFreshRecord,
            getMilesDefaults: getMilesDefaults,
            getNKNAsDistributor: getNKNAsDistributor,
            getRecordToEdit: getRecordToEdit,
            saveDraft: saveDraft,
            list: list,
            publish: publish
        };
    }
])
.service('Geoprocessing', ['$http', '$q', 'hostname', function($http, $q, hostname) {
    var getBbox = function(placeName) {
        var baseUrl = '//' + hostname + '/api/geocode/';
        var fullUrl = baseUrl + placeName;

        return $http.get(fullUrl);
    };

    return {
        getBbox: getBbox
    };
}]);
