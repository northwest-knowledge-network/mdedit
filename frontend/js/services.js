'use strict';

/* Services */

metadataEditorApp
.factory('sessionId', function()
{
	var session_id = '';

	// first see if we have any user information given to us (from Drupal)
    if (typeof(window.session_id) === 'undefined')
    {
      var session_id = 'local';
    }
    else
    {
      var session_id = window.session_id;
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
.factory('updateForms', function()
{
	return function(scope, record)
	{
	   /* place and thematic keywords come as a list from the server */
       record.place_keywords =
         record.place_keywords.join(', ');

       record.thematic_keywords =
         record.thematic_keywords.join(', ');

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
})
/**
 * Fetch the record with recordId and update the form to display it.
 *
 * Intended for use in conjunction with the Edit buttons in the records list
 */
.factory('editRecordService', 
	['$http', 'sessionId', 'hostname', 'updateForms',
	function($http, sessionId, hostname, updateForms)
	{
		return function(scope, recordId)
		{
			scope.newRecord = false;

		    $http.post('//' + hostname + '/api/metadata/' + recordId,
		               {'session_id': sessionId})
		         .success(function(data) {
		            var record = data.record;
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
		             updateForms(scope, record);
           });
		}
	}
])
.factory('createNewRecordService', 
	['$http', 'hostname', 'EMPTY_CONTACT', 'updateForms',
	function($http, hostname, EMPTY_CONTACT, updateForms)
    {
	    return function(scope) {

	        scope.newRecord = true;
      
      	    $http.get('//' + hostname + '/api/metadata/placeholder')
      	         .success(function(data) {
         	        var placeholderRec = data.record;
           	        var emptyRec = JSON.parse(JSON.stringify(placeholderRec));
      
      	            // clear out placeholder values
      	            for (var field in emptyRec)
      	            {
      	              if (['citation', 'access'].indexOf(field) > -1)
      	              {
      	                emptyRec[field] = [JSON.parse(JSON.stringify(EMPTY_CONTACT))];
      	              }
      	              else if (
      	                ['place_keywords', 'thematic_keywords',
      	                 'data_format', 'online'].indexOf(field) > -1)
      	              {
      	                emptyRec[field] = [""];
      	              }
      	              else if (['_cls', '_id', 'start_date', 'end_date', 'last_mod_date',
      	                        'first_pub_date'].indexOf(field) == -1)
      	              {
      	                emptyRec[field] = "";
      	              }
      	            }
      	            emptyRec.start_date = {$date: new Date(2010, 1, 1)};
      	            emptyRec.end_date = {$date: new Date()};
      	            emptyRec.end_date.$date.setHours(0);
      	            emptyRec.end_date.$date.setMinutes(0);
      	            emptyRec.end_date.$date.setSeconds(0);
      
      	            scope.currentRecord = emptyRec;
      
      	            // iso data formats come from a pre-defined list to from ISO std
      	            scope.dataFormats = {
      	              iso: [''],
      	              // aux, ie auxiliary, is a single text input write-in
      	              aux: ''
      	            };
      
      	            updateForms(scope, scope.currentRecord);
      	           });
		}
    }
 ]
);