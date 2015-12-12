'use strict';

describe('ISO and Dublin Core editing views', function() {

    it('should redirect /index.html to index.html#/iso', function() {

        browser.get('/frontend/index.html');

        browser.getLocationAbsUrl().then(function(url) {
            expect(url).toEqual('/iso');
        });

    });

    it('should go to #/dublin when the dublin core button is pressed', function () {
        element(by.css('[href="#/dublin"')).click();

        browser.getLocationAbsUrl().then(function(url) {
            expect(url).toEqual('/dublin');
        });

    });
});