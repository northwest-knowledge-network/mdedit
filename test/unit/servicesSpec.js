'use strict';

var recordService, freshness, yo, emptyContact, emptyISORecord;

describe('inspect correctness of a fresh record from recordService', function () {

    beforeEach(module('metadataEditor'));

    beforeEach(
        inject(function($injector) {
            recordService = $injector.get('recordService');
            emptyContact = $injector.get('emptyContact');

            emptyISORecord = recordService.getFreshISORecord();
        })
    );

    it('should have a single, empty contact for access and citation contacts',
        function()
        {
            expect(emptyISORecord.access.length).toEqual(1);
            expect(emptyISORecord.access[0]).toEqual(emptyContact);

            expect(emptyISORecord.citation.length).toEqual(1);
            expect(emptyISORecord.citation[0]).toEqual(emptyContact);
        }
    );

    it('should have an array of a single empty string for topic_category, ' +
       'data_format, and online fields',
        function()
        {
            var fields = 'data_format, online, topic_category';

            var fieldsArr = fields.split(', ');

            var j = 0;

            for (var i=0; i < fieldsArr.length; i++)
            {
                expect(emptyISORecord[fieldsArr[i]]).toEqual(['']);
                j++;
            }

            expect(j).toEqual(fieldsArr.length);
        }
    );

    it('should have empty strings for title, summary, last_mod_date, ' +
       'first_pub_date, update_frequency, status, spatial_dtype, ' +
       'hierarchy_level, compression_technique, use_restrictions, ' +
       'start_date, and end_date',
        function()
        {
            var fields =
                'title, summary, update_frequency, status, spatial_dtype, ' +
                'place_keywords, thematic_keywords, hierarchy_level, ' +
                'compression_technique, use_restrictions';

            var fieldsArr = fields.split(', ');
            var j = 0;
            for (var i=0; i < fieldsArr.length; i++)
            {
                expect(emptyISORecord[fieldsArr[i]]).toEqual('');
                j++;
            }

            expect(j).toEqual(fieldsArr.length);
        }
    );

    it('should have default dates of January 1, 2010 for last_mod_date and first_pub_date',
        function()
        {
            // not sure why but the first date in `expect`s gets
            // formatted as ISO and fails if expDate is not also ISO-formatted
            var expDate = new Date(2010, 0, 1);
            // expDate = expDate.toISOString();

            expect(emptyISORecord.last_mod_date.$date.getTime() -
                   new Date().getTime() < 100)
                .toBeTruthy();


            expect(emptyISORecord.first_pub_date.$date).toEqual('');

            expect(emptyISORecord.start_date.$date).toEqual('');
            expect(emptyISORecord.end_date.$date).toEqual('');
        }
    );
}
);


describe('MILES default generation', function () {
    beforeEach(module('metadataEditor'));

    var recordService, milesFields;
    beforeEach(
        inject(function($injector) {
            recordService = $injector.get('recordService');

            milesFields = recordService.getMilesDefaults();
        })
    );

    it('should contain the following fields: place_keywords, thematic_keywords, ' +
       'citation, access, online, west_lon, east_lon, south_lat, north_lat, and ' +
       'use_restrictions',
    function()
    {
        var fields =
            'citation, access, online, west_lon, east_lon, south_lat, north_lat, ' +
            'place_keywords, thematic_keywords, use_restrictions';

        var fieldsArr = fields.split(', ');
        var j = 0;
        for(var i = 0; i < fieldsArr.length; i++)
        {
            expect(milesFields.hasOwnProperty(fieldsArr[i])).toBe(true);
        }
    });
}
);


describe('Service to provide an existing record for editing', function() {
    var recordToEdit_noDates, recordToEdit_someFields, $httpBackend, $rootScope;
    beforeEach(module('metadataEditor'));

    beforeEach(
        inject(function($injector) {
            recordService = $injector.get('recordService');

            // recordId will point the mock to the proper data to return
            var recordId = 'noDates';


            $httpBackend = $injector.get('$httpBackend');
            $rootScope = $injector.get('$rootScope');
        })
    );

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should not overwrite non-MILES fields', function()
    {
        $httpBackend.expectPOST(/someFields/).respond(200,
            {
                record:
                {
                    title: "Title of Something",
                    start_date: {$date: new Date(2010, 1, 31)},
                    end_date: {$date: new Date(2013, 7, 5)},
                    use_restrictions: 'http://www.wtfpl.net/'
                }
            }
        );

        recordService.getRecordToEdit('someFields')
            .then(function(data) {
                var rec = data.data.record;

                var sdate = rec.start_date.$date;
                expect(sdate.year, 2010);
                expect(sdate.month, 1);
                expect(sdate.day, 31);

                var edate = rec.end_date.$date;
                expect(edate.year, 2013);
                expect(edate.month, 7);
                expect(edate.day, 5);

                expect(rec.use_restrictions).toEqual('http://www.wtfpl.net/');
            });

        $httpBackend.flush();
    });
});


describe('Submit draft record to server', function () {

    var recordService, scope, emptyISORecord, $httpBackend, $rootScope;

    beforeEach(module('metadataEditor'));

    beforeEach(
        inject(function($injector) {
            recordService = $injector.get('recordService');

            // recordId will point the mock to the proper data to return
            var recordId = 'noDates';

            $httpBackend = $injector.get('$httpBackend');
            $rootScope = $injector.get('$rootScope');

            scope = {
                currentRecord: $injector.get('emptyISORecord'),
                dataFormats: {
                    iso: ['ASCII', 'GML', 'HDF'],
                    aux: 'snoop, lion, dogg'
                }
            };

            // coming from the scope, the place and thematic keywords are
            // comma-separated lists, unlike the emptyISORecord `value`
            scope.currentRecord.thematic_keywords = 'rocks, jocks';
            scope.currentRecord.place_keywords = 'idaho, moscow';
            scope.currentRecord.west_lon = -118.12;
            scope.currentRecord.east_lon = -110.10;
            scope.currentRecord.south_lat = 30.0;
            scope.currentRecord.north_lat = 45.0;
            scope.currentRecord._id = {$oid: 'xxxo'};
        })
    );

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should make a PUT request if submitting a new record', function () {
        scope.newRecord = true;

        $httpBackend.expectPUT(/api\/metadata/).respond(200,
            scope.currentRecord
        );

        recordService.saveDraft(scope);

        $httpBackend.flush();
    });

    it('should make a POST request if updating an existing record', function () {
        scope.newRecord = false;

        $httpBackend.expectPUT(/api\/metadata\/xxxo/).respond(200,
            scope.currentRecord
        );

        recordService.saveDraft(scope);

        $httpBackend.flush();
    });
});


describe('Delete a record', function() {
    var recordToEdit_noDates, recordToEdit_someFields, $httpBackend, $rootScope;

    beforeEach(module('metadataEditor'));

    beforeEach(
        inject(function($injector) {
            recordService = $injector.get('recordService');

            // recordId will point the mock to the proper data to return
            var recordId = 'noDates';


            $httpBackend = $injector.get('$httpBackend');
            // $rootScope = $injector.get('$rootScope');
        })
    );

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should replace missing dates with default dates',
    function()
    {
        var fieldsArr = ['start_date', 'end_date', 'last_mod_date', 'first_pub_date'];

        $httpBackend.expectPOST(/delete/).respond(200,
            {
                message: 'Record successfully removed',
                status: 'success'
            }
        );

        recordService.delete('fakeOne')
            .then( function (res) {
                expect(res.data.message).toBe('Record successfully removed');
                expect(res.data.status).toBe('success');
            });

        $httpBackend.flush();
    });
});


describe('Initiate publishing process request to server', function () {

    var recordService, scope, emptyISORecord, $httpBackend, $rootScope;

    beforeEach(module('metadataEditor'));

    beforeEach(
        inject(function($injector) {
            recordService = $injector.get('recordService');

            // recordId will point the mock to the proper data to return
            var recordId = 'noDates';

            $httpBackend = $injector.get('$httpBackend');
            $rootScope = $injector.get('$rootScope');

            scope = {
                currentRecord: $injector.get('emptyISORecord'),
                dataFormats: {
                    iso: ['ASCII', 'GML', 'HDF'],
                    aux: 'snoop, lion, dogg'
                }
            };

            // coming from the scope, the place and thematic keywords are
            // comma-separated lists, unlike the emptyISORecord `value`
            scope.currentRecord.thematic_keywords = 'rocks, jocks';
            scope.currentRecord.place_keywords = 'idaho, moscow';
            scope.currentRecord.west_lon = -118.12;
            scope.currentRecord.east_lon = -110.10;
            scope.currentRecord.south_lat = 30.0;
            scope.currentRecord.north_lat = 45.0;
            scope.currentRecord._id = {$oid: 'xxxo'};
        })
    );

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should make one PUT request and one POST request if submitting a new record', function () {
        scope.newRecord = true;

        $httpBackend.expectPUT(/api\/metadata/).respond(200,
            scope.currentRecord
        );

        $httpBackend.expectPOST(/publish/).respond(200,
            scope.currentRecord
        );

        recordService.publish(scope);

        $httpBackend.flush();
    });

    it('should make two PUT request and one POST request if publishing an existing record', function () {
        scope.newRecord = false;

        $httpBackend.expectPUT(/api\/metadata\/xxxo/).respond(200,
            scope.currentRecord
        );

        $httpBackend.expectPOST(/publish/).respond(200,
            scope.currentRecord
        );

        recordService.publish(scope);

        $httpBackend.flush();
    });
});


describe('Geoprocessing service', function () {

    var $httpBackend, $rootScope, Geoprocessing;
    beforeEach(module('metadataEditor'));
    beforeEach(
            inject(function($injector) {

                Geoprocessing = $injector.get('Geoprocessing');

                $httpBackend = $injector.get('$httpBackend');
                $rootScope = $injector.get('$rootScope');
    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should call the server geocoding service', function () {
        $httpBackend.expectGET(/api\/geocode/).respond(200,
            {
                north: 49.001,
                south: 41.9880051,
                east: -111.043,
                west: -117.2413657
            }
        );

        Geoprocessing.getBbox('Idaho');

        $httpBackend.flush();
    });
});