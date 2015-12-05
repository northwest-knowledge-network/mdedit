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
        $log.log(record);
        /* place and thematic keywords come as a list from the server */
        if (typeof record.place_keywords !== 'string' &&
            typeof record.place_keywords !== 'object')
        {
                record.place_keywords =
                    record.place_keywords.join(', ');
        }


        if (typeof record.thematic_keywords !== 'string' &&
            typeof record.thematic_keywords !== 'object')
        {
            record.thematic_keywords =
                record.thematic_keywords.join(', ');
        }

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

        scope.currentRecord = record;
        // This seems to be only for loading from the server.
        // If we are saving updates, this will just overwrite updates with
        // whatever came from the server, again, which is fine for loading from
        // the server, but we must first set record.data_format above
        scope.dataFormats.aux =
            record.data_format.filter(function (f) {
                return scope.knownDataFormats.indexOf(f) === -1;
        }).join(', ');

        scope.dataFormats.iso =
            record.data_format.filter(function (f) {
                return scope.knownDataFormats.indexOf(f) > -1;
        });

        if (!scope.currentRecord.online) {
            record.online = [""];
        }
    };
}])
/**
 * Fetch the record with recordId and update the form to display it.
 *
 * Intended for use in conjunction with the Edit buttons in the records list
 */
// .factory('editRecordService',
//     ['$http', '$q', 'sessionId', 'hostname', 'updateForms',
//     function($http, $q, sessionId, hostname, updateForms)
//     {
//         return function(recordId)
//         {
//             var deferred = $q.defer();

//             $http.post('//' + hostname + '/api/metadata/' + recordId,
//                        {'session_id': sessionId})
//                  .then(
//                     function(data)
//                     {
//                         var record = data.data.record;
//                         if (typeof record.start_date == "undefined") {
//                             record.start_date = {$date: new Date(2010, 1, 1)};
//                         }
//                         if (typeof record.end_date == "undefined") {
//                             record.end_date = {$date: new Date()};
//                         }
//                         if (typeof record.last_mod_date == "undefined") {
//                             record.last_mod_date = {$date: new Date()};
//                         }
//                         if (typeof record.first_pub_date == "undefined") {
//                             record.first_pub_date = {$date: new Date()};
//                         }

//                         deferred.resolve(record);
//                     },
//                     function(error)
//                     {
//                         deferred.reject({error: "Error accessing existing record to edit"});
//                     }
//             );

//             return deferred;
//         };
//     }
// ])
.value('emptyRecord',
{
    title: '',
    summary: '',
    last_mod_date: {$date: new Date(2010, 0, 1)},
    first_pub_date: {$date: new Date(2010, 0, 1)},

    update_frequency: '',
    status: '',
    spatial_dtype: '',
    hierarchy_level: '',
    topic_category: [''],
    place_keywords: [''],
    thematic_keywords: [''],

    data_format: [''],
    compression_technique: '',
    online: [''],
    use_restrictions: '',

    citation: [],
    access: [],

    west_lon: 0.0,
    east_lon: 0.0,
    north_lat: 0.0,
    south_lat: 0.0,

    start_date: {$date: new Date(2010, 1, 1)},
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
        "https://www.idahoecosystems.org/"
    ],
    west_lon: "-117.2413657",
    east_lon: "-111.043495",
    south_lat: "41.9880051",
    north_lat: "49.0011461",
    use_restrictions: "Access constraints: Data will be provided to all who agree to appropriately acknowledge the National Science Foundation (NSF), Idaho EPSCoR and the individual investigators responsible for the data set. By downloading these data and using them to produce further analysis and/or products, users agree to appropriately  acknowledge the National Science Foundation (NSF), Idaho  EPSCoR and the individual investigators responsible for the data set. Use constraints: Acceptable uses of data provided by Idaho EPSCoR include any academic, research, educational, governmental, recreational, or other not-for-profit activities. Any use of data provided by the Idaho EPSCoR must acknowledge Idaho EPSCoR and the funding source(s) that contributed to the collection of the data. Users are expected to inform the Idaho EPSCoR Office and the PI(s) responsible for the data of any work or publications based on data provided. Citation: The appropriate statement to be used when citing these data is 'data were provided by (Name, University Affiliation) through the support of the NSF Idaho EPSCoR Program and by the National Science Foundation under award number IIA-1301792.' More information about EPSCoR Research Data can be found at http://www.idahoepscor.org/"
})
.service('recordService',
    ['$http', '$q', '$log', 'hostname', 'sessionId', 'emptyContact',
            'emptyRecord', 'milesFields',
    function($http, $q, $log, hostname, sessionId,
             emptyContact, emptyRecord, milesFields)
    {
        /**
         * Private functions that will not be exposed to controller
         */

        // shorthand for this standard way to copy a javascript object
        var copyObj = function(obj) { return JSON.parse(JSON.stringify(obj)); };


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

            // the scope contains
            var record = scope.currentRecord;
            var dateFields = ['start_date', 'end_date',
                              'last_mod_date',  'first_pub_date'];

            for (var i = 0; i < dateFields.length; i++)
            {
                var date = record[dateFields[i]].$date;
                $log.log(typeof(date));
                if (typeof(date) === 'string')
                {
                    $log.log(date);
                    record[dateFields[i]].$date = Date.parse(date);
                    $log.log(record[dateFields[i]].$date);
                    $log.log(typeof(record[dateFields[i]].$date));
                }
            }

            $log.log(record);
            record.start_date.$date.setHours(
              record.start_date.hours,
              record.start_date.minutes,
              record.start_date.seconds
            );

            record.end_date.$date.setHours(
              record.end_date.hours,
              record.end_date.minutes,
              record.end_date.seconds
            );
            $log.log(record);
            var serverReady = JSON.parse(JSON.stringify(record));

            // serverReady.place_keywords =
            //     record.place_keywords.split(', ');

            // serverReady.thematic_keywords =
            //     record.thematic_keywords.split(', ');

            serverReady.data_format = scope.dataFormats.iso;

            if (scope.dataFormats.aux)
            {
              var auxList = scope.dataFormats.aux.split(',')
                                 .map(function(el){ return el.trim(); });

              serverReady.data_format = serverReady.data_format.concat(auxList);
            }

            for (var i = 0; i < dateFields.length; i++)
            {
                var date = record[dateFields[i]].$date;
                $log.log(typeof(date));
                if (typeof(date) === 'string')
                {
                    $log.log(date);
                    serverReady[dateFields[i]].$date = Date.parse(date);
                    $log.log(record[dateFields[i]].$date);
                    $log.log(typeof(record[dateFields[i]].$date));
                }
            }

            // serverReady.last_mod_date =
            //   {$date: record.last_mod_date.$date.getTime()};
            // serverReady.start_date =
            //   {$date: record.start_date.$date.getTime()};
            // serverReady.end_date =
            //   {$date: record.end_date.$date.getTime()};

            // serverReady.first_pub_date =
            //   {$date: record.first_pub_date.$date.getTime()};

            $log.log('\n\nServer Ready:\n');
            $log.log(serverReady);
            return serverReady;
        };


        /**
         * These functions are exposed by the service to the controllers.
         */
        var getFreshRecord = function() {

            var freshy = copyObj(emptyRecord);
            freshy.citation.push(copyObj(emptyContact));
            freshy.access.push(copyObj(emptyContact));

            return freshy;
        };

        var getMilesDefaults = function() {
            var milesy = copyObj(milesFields);
            for (var key in milesFields)
            {
                if (milesFields.hasOwnProperty(key))
                {
                    // only want to overwrite country and state for MILES
                    if (key === "citation")
                    {
                        milesy[key][0].country =
                            milesFields[key][0].country;

                        milesy[key][0].state =
                            milesFields[key][0].state;
                    }
                    else
                    {
                        if (key !== "data_format")
                        {
                            milesy[key] = milesFields[key];
                        }
                    }
                }
            }

            return milesy;
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

            draftQ = saveDraft(scope);

            // this is a little wasteful to send the record back to server,
            // but probably not consequential
            draftQ.success( () => {
                console.log(scope.currentRecord);
                var currentId = scope.currentRecord._id.$oid;

                publishQ = $http.post(
                    '//' + hostname + '/api/metadata/' +
                        currentId + '/publish',
                    current);
            })
            .error( () =>
                { publishQ = draftQ; }
            );

            return publishQ;
        };

        return {
            getFreshRecord: getFreshRecord,
            getMilesDefaults: getMilesDefaults,
            getRecordToEdit: getRecordToEdit,
            saveDraft: saveDraft,
            list: list,
            publish: publish
        };
    }
]);







// .factory('defaultMilesService', ['$http', 'hostname', 'updateForms',
//     function($http, hostname, updateForms)
//     {
//             return function(scope)
//             {
//                     scope.newRecord = true;

//                   $http.get('//' + hostname + '/api/metadata/defaultMILES')
//                        .success(function(data) {

//                      var milesRec = data.record;

//                      for (var key in milesRec)
//                      {
//                        if (milesRec.hasOwnProperty(key))
//                        {
//                           // only want to overwrite country and state for MILES
//                           if (key === "citation")
//                           {
//                             scope.currentRecord[key][0].country =
//                                 milesRec[key][0].country;

//                             scope.currentRecord[key][0].state =
//                                 milesRec[key][0].state;
//                           }
//                           else
//                           {
//                             if (key !== "data_format")
//                             {
//                               scope.currentRecord[key] = milesRec[key];
//                             }
//                           }
//                        }
//                      }

//                      updateForms(scope, scope.currentRecord);

//                });
//         };
//     }
// ])
// .factory('prepareCurrentScopedRecord',
//         function()
//         {
//             return function(scope)
//             {
//                 scope.currentRecord.start_date.$date.setHours(
//                   scope.currentRecord.start_date.hours,
//                   scope.currentRecord.start_date.minutes,
//                   scope.currentRecord.start_date.seconds
//                 );

//                 scope.currentRecord.end_date.$date.setHours(
//                   scope.currentRecord.end_date.hours,
//                   scope.currentRecord.end_date.minutes,
//                   scope.currentRecord.end_date.seconds
//                 );

//                 var current = JSON.parse(JSON.stringify(scope.currentRecord));

//                 current.place_keywords =
//                     scope.currentRecord.place_keywords.split(', ');

//                 current.thematic_keywords =
//                     scope.currentRecord.thematic_keywords.split(', ');

//                 current.data_format = scope.dataFormats.iso;

//                 if (scope.dataFormats.aux)
//                 {
//                   var auxList = scope.dataFormats.aux.split(',')
//                                      .map(function(el){ return el.trim(); });

//                   current.data_format = current.data_format.concat(auxList);
//                 }

//                 current.last_mod_date =
//                   {$date: scope.currentRecord.last_mod_date.$date.getTime()};
//                 current.start_date =
//                   {$date: scope.currentRecord.start_date.$date.getTime()};
//                 current.end_date =
//                   {$date: scope.currentRecord.end_date.$date.getTime()};

//                 current.first_pub_date =
//                   {$date: scope.currentRecord.first_pub_date.$date.getTime()};

//                 return current;
//             };
//         })
// .factory('updateRecordsList', ['$http', 'hostname', 'sessionId',
//         function($http, hostname, sessionId)
//         {
//                 return function(scope)
//                 {
//                         $http.post('//' + hostname + '/api/metadata',
//                  {'session_id': sessionId})
//                      .success(function(data){
//                        scope.allRecords = data.results;
//                      });
//                 };
//         }])
// .factory('submitDraftRecordService',
//         ['$http', 'prepareCurrentScopedRecord', 'hostname', 'sessionId',
//          'updateForms', 'updateRecordsList',
//         function($http, prepareCurrentScopedRecord, hostname, sessionId,
//                  updateForms, updateRecordsList)
//         {
//             return function(scope)
//             {
//                 // the start and end dates currently have hours and minutes zero;
//                 // grab the hours and minutes and append them. Confusingly JS
//                 // uses setHours to set minutes and seconds as well
//                 var current = prepareCurrentScopedRecord(scope);
//                 if (scope.newRecord)
//                 {
//                     $http.put('//' + hostname + '/api/metadata',
//                               {'record': current, 'session_id': sessionId})
//                          .success(function(data) {
//                              updateForms(scope, data.record);
//                              scope.newRecord = false;
//                              scope.addedContacts =
//                              {
//                                  'access': 0,
//                                  'citation': 0
//                              };
//                              updateRecordsList(scope);
//                          })
//                          .error(function(data) { $log.log(data.record); });
//                 }
//                 else
//                 {
//                     $http.put('//' + hostname + '/api/metadata/' + current._id.$oid,
//                               {'record': current, 'session_id': sessionId})
//                          .success(function(data) {
//                              updateForms(scope, data.record);
//                              scope.addedContacts =
//                              {
//                               'access': 0,
//                               'citation': 0
//                              };
//                              updateRecordsList(scope);
//                          });
//                 }
//             };
//          }])
// .factory('publishRecordService',
//         ['$http', 'hostname', 'prepareCurrentScopedRecord',
//          'updateForms', 'updateRecordsList',
//         function($http, hostname, prepareCurrentScopedRecord,
//                          updateForms, updateRecordsList)
//         {
//                 return function(scope)
//                 {
//                     var current = prepareCurrentScopedRecord(scope);
//                     // if the record is totally new, we first want to save the draft of it
//                     if (scope.newRecord)
//                     {
//                       $http.post('//' + hostname + '/api/metadata', current)
//                            .success(function(data) {
//                                updateForms(scope, data.record);
//                                scope.newRecord = false;
//                                scope.addedContacts =
//                                {
//                                   'access': 0,
//                                   'citation': 0
//                                };
//                                updateRecordsList(scope);
//                             })
//                             .error(function(data) { $log.log(data.record); });
//                     }
//                     // if the record already existed as a draft, we update the draft
//                     else
//                     {
//                       $http.put('//' + hostname + '/api/metadata/' + current._id.$oid,
//                                 current)
//                            .success(function(data) {
//                                updateForms(scope, data.record);
//                                 scope.addedContacts =
//                                 {
//                                   'access': 0,
//                                   'citation': 0
//                                 };
//                                 updateRecordsList(scope);
//                             });
//                     }

//                     var currentId = scope.currentRecord._id.$oid;

//                 $http.post('//' + hostname + '/api/metadata/' +
//                            currentId + '/publish',
//                            current)
//                           .success(function(data) {
//                                updateForms(scope, data.record);
//                                scope.addedContacts =
//                                {
//                                  'access': 0,
//                                  'citation': 0
//                                };

//                             updateRecordsList(scope);
//                         });
//                 };
//         }])
// ;
