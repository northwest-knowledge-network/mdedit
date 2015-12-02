'use strict';

/* Services */

metadataEditorApp
.factory('sessionId', function()
{
    var sessionId = '';

    // first see if we have any user information given to us (from Drupal)
    if (typeof(window.sessionId) === 'undefined')
    {
        var sessionId = 'local';
    }
    else
    {
        var sessionId = window.sessionId;
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
        if (typeof record.place_keywords !== 'string' 
            && typeof record.place_keywords !== 'object')
        {
                record.place_keywords = 
                    record.place_keywords.join(', ');
        }


        if (typeof record.thematic_keywords !== 'string'
            && typeof record.thematic_keywords !== 'object')
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
    }
}])
/**
 * Fetch the record with recordId and update the form to display it.
 *
 * Intended for use in conjunction with the Edit buttons in the records list
 */
.factory('editRecordService', 
    ['$http', '$q', 'sessionId', 'hostname', 'updateForms',
    function($http, $q, sessionId, hostname, updateForms)
    {
        return function(recordId) 
        {
            var deferred = $q.defer();

            $http.post('//' + hostname + '/api/metadata/' + recordId,
                       {'session_id': sessionId})
                 .then(
                    function(data) 
                    {
                        var record = data.data.record;
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

                        deferred.resolve(record);
                    },
                    function(error)
                    {
                        deferred.reject({error: "Error accessing existing record to edit"});
                    }
            );

            return deferred;
        };
    }
])
.value('emptyRecord', 
{
    title: '',
    summary: '',
    last_mod_date: '',
    first_pub_date: '',

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

    start_date: '',
    end_date: ''
})
.value('milesFields',
{

})
.service('recordService', ['$http', '$q', 'hostname', 'EMPTY_CONTACT', 'emptyRecord',
    function($http, $q, hostname, EMPTY_CONTACT, emptyRecord)
    {
        var copyObj = function(obj) { return JSON.parse(JSON.stringify(obj)); }; 

        var getFreshRecord = function() {
            var freshy = copyObj(emptyRecord);
            freshy.citation.push(copyObj(EMPTY_CONTACT));
            freshy.access.push(copyObj(EMPTY_CONTACT));
            return freshy;
        };

        return {
            getFreshRecord: getFreshRecord
        };
    }
 ])
.factory('defaultMilesService', ['$http', 'hostname', 'updateForms',
    function($http, hostname, updateForms)
    {
            return function(scope)
            {
                    scope.newRecord = true;

                  $http.get('//' + hostname + '/api/metadata/defaultMILES')
                       .success(function(data) {

                     var milesRec = data.record;

                     for (var key in milesRec)
                     {
                       if (milesRec.hasOwnProperty(key))
                       {
                          // only want to overwrite country and state for MILES
                          if (key === "citation")
                          {
                            scope.currentRecord[key][0].country = milesRec[key][0].country;
                            scope.currentRecord[key][0].state = milesRec[key][0].state;
                          }
                          else
                          {
                            if (key !== "data_format")
                            {
                              scope.currentRecord[key] = milesRec[key];
                            }
                          }
                       }
                     }

                     updateForms(scope, scope.currentRecord);

               });
        }; 
    }
])
.factory('prepareCurrentScopedRecord', 
        function()
        {
            return function(scope)
            {
                scope.currentRecord.start_date.$date.setHours(
                  scope.currentRecord.start_date.hours,
                  scope.currentRecord.start_date.minutes,
                  scope.currentRecord.start_date.seconds
                );

                scope.currentRecord.end_date.$date.setHours(
                  scope.currentRecord.end_date.hours,
                  scope.currentRecord.end_date.minutes,
                  scope.currentRecord.end_date.seconds
                );

                var current = JSON.parse(JSON.stringify(scope.currentRecord));

                current.place_keywords = 
                    scope.currentRecord.place_keywords.split(', ');
                
                current.thematic_keywords = 
                    scope.currentRecord.thematic_keywords.split(', ');

                current.data_format = scope.dataFormats.iso;

                if (scope.dataFormats.aux)
                {
                  var auxList = scope.dataFormats.aux.split(',')
                                     .map(function(el){ return el.trim(); });

                  current.data_format = current.data_format.concat(auxList);
                }

                current.last_mod_date =
                  {$date: scope.currentRecord.last_mod_date.$date.getTime()};
                current.start_date =
                  {$date: scope.currentRecord.start_date.$date.getTime()};
                current.end_date =
                  {$date: scope.currentRecord.end_date.$date.getTime()};

                current.first_pub_date =
                  {$date: scope.currentRecord.first_pub_date.$date.getTime()};

                return current;
            };
        })
.factory('updateRecordsList', ['$http', 'hostname', 'sessionId',
        function($http, hostname, sessionId)
        {
                return function(scope)
                {
                        $http.post('//' + hostname + '/api/metadata',
                 {'session_id': sessionId})
                     .success(function(data){
                       scope.allRecords = data.results;
                     });
                }
        }])
.factory('submitDraftRecordService', 
        ['$http', 'prepareCurrentScopedRecord', 'hostname', 'sessionId', 
         'updateForms', 'updateRecordsList',
        function($http, prepareCurrentScopedRecord, hostname, sessionId, 
                 updateForms, updateRecordsList)
        {
            return function(scope)
            {
                // the start and end dates currently have hours and minutes zero;
                // grab the hours and minutes and append them. Confusingly JS
                // uses setHours to set minutes and seconds as well
                var current = prepareCurrentScopedRecord(scope);
                if (scope.newRecord)
                {
                    $http.put('//' + hostname + '/api/metadata',
                              {'record': current, 'session_id': sessionId})
                         .success(function(data) {
                             updateForms(scope, data.record);
                             scope.newRecord = false;
                             scope.addedContacts =
                             {
                                 'access': 0,
                                 'citation': 0
                             };
                             updateRecordsList(scope);
                         })
                         .error(function(data) { $log.log(data.record); });
                }
                else
                {
                    $http.put('//' + hostname + '/api/metadata/' + current._id.$oid,
                              {'record': current, 'session_id': sessionId})
                         .success(function(data) {
                             updateForms(scope, data.record);
                             scope.addedContacts =
                             {
                              'access': 0,
                              'citation': 0
                             };
                             updateRecordsList(scope);
                         });
                }
            };
         }])
.factory('publishRecordService', 
        ['$http', 'hostname', 'prepareCurrentScopedRecord', 
         'updateForms', 'updateRecordsList',
        function($http, hostname, prepareCurrentScopedRecord, 
                         updateForms, updateRecordsList)
        {
                return function(scope)
                {
                    var current = prepareCurrentScopedRecord(scope);
                    // if the record is totally new, we first want to save the draft of it
                    if (scope.newRecord)
                    {
                      $http.post('//' + hostname + '/api/metadata', current)
                           .success(function(data) {
                               updateForms(scope, data.record);
                               scope.newRecord = false;
                               scope.addedContacts =
                               {
                                  'access': 0,
                                  'citation': 0
                               };
                               updateRecordsList(scope);
                            })
                            .error(function(data) { $log.log(data.record); });
                    }
                    // if the record already existed as a draft, we update the draft
                    else
                    {
                      $http.put('//' + hostname + '/api/metadata/' + current._id.$oid,
                                current)
                           .success(function(data) {
                               updateForms(scope, data.record);
                                scope.addedContacts =
                                {
                                  'access': 0,
                                  'citation': 0
                                };
                                updateRecordsList(scope);
                            });
                    }

                    var currentId = scope.currentRecord._id.$oid;

                $http.post('//' + hostname + '/api/metadata/' +
                           currentId + '/publish',
                           current)
                          .success(function(data) {
                               updateForms(scope, data.record);
                               scope.addedContacts =
                               {
                                 'access': 0,
                                 'citation': 0
                               };

                            updateRecordsList(scope);
                        });
                }
        }])
;
