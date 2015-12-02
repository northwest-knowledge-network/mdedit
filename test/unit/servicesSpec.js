'use strict';

/* jasmine specs for services go here */
var recordService, freshness, yo, EMPTY_CONTACT;
describe('inspect correctness of a fresh record from recordService', function() {

    beforeEach(module('metadataEditor'));

    beforeEach(
        inject(function($injector) {
            recordService = $injector.get('recordService');
            EMPTY_CONTACT = $injector.get('EMPTY_CONTACT');
        })
    );

    //);

    it('should have a single, empty contact for access and citation contacts', 
        function()
        {
            var f1 = recordService.getFreshRecord();

            expect(f1.access.length).toEqual(1);
            expect(f1.access[0]).toEqual(EMPTY_CONTACT);

            expect(f1.citation.length).toEqual(1);
            expect(f1.citation[0]).toEqual(EMPTY_CONTACT);
        }
    );
});
