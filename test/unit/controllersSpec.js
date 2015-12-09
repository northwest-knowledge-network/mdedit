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

    var recordService, emptyContact, emptyRecord, testCtrl;

    beforeEach(
        inject(function($injector, $controller) {
            recordService = $injector.get('recordService');
            emptyContact = $injector.get('emptyContact');
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
        });
});