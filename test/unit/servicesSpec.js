'use strict';

/* jasmine specs for services go here */
var getFreshRecord, freshness;
describe('get a fresh record', function() {

    beforeEach(module('metadataEditor', ['ngRoute', 'ui.date']));

    beforeEach(

        inject(function($injector) {
            getFreshRecord = $injector.get('getFreshRecord');
            console.log("here!");
    })
    );

    //);

    it('should return lists with for topic_category, place_keywords, ' +
       'thematic_keywords, data_format, online', function() {

        console.log("\nyo!!!!!! ***\n\n*****\n\n***");
        expect(true).toBe(true);
        //var freshness = getFreshRecord("stuffing")[>;<]
        //console.log(getFreshRecord);
        //console.log(freshness);
        //var keys = ['topic_category', 'place_keywords', 'thematic_keywords',
                    //'data_format', 'online'];

        //for (var i = 0; i < keys.length; i++)
        //{
            //expect(freshness[keys[i]]).toBe(['']);
        /*}*/
    });
});
