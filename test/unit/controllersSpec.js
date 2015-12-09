'use strict';

/* jasmine specs for controllers go here */

var testScope = {
    currentRecord: {
        title: 'Fernan Lake Data 2010 - 2011',
        description: 'Limnology data',

    }
};

describe('createNewRecord', function() {

    beforeEach(module('metadataEditor'));

    var recordService, emptyContact, testCtrl;

    beforeEach(
        inject(function($injector, $controller) {
            recordService = $injector.get('recordService');
            testCtrl = $controller('BaseController', {$scope: testScope});
        })
    );

    it('should clear all data in scope and replace with blanks or placeholder dates',
        function () {
            // even though testScope had a title and description,
            // createNewRecord is called on creation of the BaseController
            expect(testScope.currentRecord.title).toEqual('');

            testScope.currentRecord.title = 'new title';

            testScope.currentRecord.last_mod_date.$date = new Date(2014, 1, 1);
            testScope.currentRecord.start_date.$date = new Date(2014, 4, 2);

            testScope.currentRecord.end_date.$date = new Date(2015, 1, 1);
            testScope.currentRecord.first_pub_date.$date = new Date(2013, 4, 2);


            expect(testScope.currentRecord.last_mod_date.$date)
                .toEqual(new Date(2014, 1, 1));

            expect(testScope.currentRecord.start_date.$date)
                .toEqual(new Date(2014, 4, 2));

            expect(testScope.currentRecord.end_date.$date)
                .toEqual(new Date(2015, 1, 1));

            expect(testScope.currentRecord.first_pub_date.$date)
                .toEqual(new Date(2013, 4, 2));

            expect(testScope.currentRecord.title).toEqual('new title');

            testScope.createNewRecord();

            // createNewRecord has cleared all fields that had been assigned
            expect(testScope.currentRecord.title).toEqual('');

            expect(testScope.currentRecord.start_date.$date)
                .toEqual(new Date(2010, 0, 1));

            expect(testScope.currentRecord.last_mod_date.$date)
                .toEqual(new Date(2010, 0, 1));

            expect(testScope.currentRecord.end_date.$date.getTime() -
                   new Date().getTime() <
                   100)
                .toBeTruthy();

            expect(testScope.currentRecord.first_pub_date.$date.getTime() -
                   new Date().getTime()
                   < 100)
                .toBeTruthy();
        }
    );

    it('MILES defaults should only replace fields that it contains',
        function () {
        testScope.currentRecord.title = 'Fernan Lake Data';
        testScope.currentRecord.description = 'Limnology variables observed 2001 - 2003';
        testScope.currentRecord.start_date.$date = new Date(2001, 9, 1);
        testScope.currentRecord.end_date.$date = new Date(2003, 8, 30);

        testScope.currentRecord.citation = [{'name': 'Matty Fatty', 'city': 'Moscow'}];

        testScope.loadDefaultMILES();

        var rec = testScope.currentRecord;
        expect(rec.title).toEqual('Fernan Lake Data');
        expect(rec.description).toEqual('Limnology variables observed 2001 - 2003');
        expect(rec.start_date.$date).toEqual(new Date(2001, 9, 1));
        expect(rec.end_date.$date).toEqual(new Date(2003, 8, 30));
        expect(rec.place_keywords).toEqual(['USA', 'Idaho']);
        expect(rec.thematic_keywords).toEqual(['IIA-1301792', 'MILES', 'EPSCoR']);

        expect(rec.citation).toEqual(
            [{
                'name': 'Matty Fatty',
                'city': 'Moscow',
                'country': 'USA',
                'state': 'Idaho'
            }]
        );

        expect(rec.access).toEqual(
            [{
                "address": "875 Perimeter Dr. MS 2358",
                "city": "Moscow",
                "country": "USA",
                "name": "Northwest Knowledge Network",
                "email": "info@northwestknowledge.net",
                "org": "University of Idaho",
                "phone": "208-885-2080",
                "state": "Idaho",
                "zipcode": "83844-2358"
            }]
        );

        expect(rec.online).toEqual(['https://www.idahoecosystems.org']);

        expect(rec.west_lon).toEqual(-117.2413657);
        expect(rec.east_lon).toEqual(-111.043495);
        expect(rec.south_lat).toEqual(41.9880051);
        expect(rec.north_lat).toEqual(49.0011461);

        expect(rec.use_restrictions).toEqual(
            "Access constraints: Data will be provided to all who agree to appropriately acknowledge the National Science Foundation (NSF), Idaho EPSCoR and the individual investigators responsible for the data set. By downloading these data and using them to produce further analysis and/or products, users agree to appropriately  acknowledge the National Science Foundation (NSF), Idaho  EPSCoR and the individual investigators responsible for the data set. Use constraints: Acceptable uses of data provided by Idaho EPSCoR include any academic, research, educational, governmental, recreational, or other not-for-profit activities. Any use of data provided by the Idaho EPSCoR must acknowledge Idaho EPSCoR and the funding source(s) that contributed to the collection of the data. Users are expected to inform the Idaho EPSCoR Office and the PI(s) responsible for the data of any work or publications based on data provided. Citation: The appropriate statement to be used when citing these data is 'data were provided by (Name, University Affiliation) through the support of the NSF Idaho EPSCoR Program and by the National Science Foundation under award number IIA-1301792.' More information about EPSCoR Research Data can be found at http://www.idahoepscor.org/"
        );
    });
});