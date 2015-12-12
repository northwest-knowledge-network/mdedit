'use strict';

var mongo = require('mongodb');

var mongocl = mongo.MongoClient;

var MD_COLL = 'metadata';

mongocl.connect('mongodb://localhost:27017/metadata', function (err, db) {

    console.log('Connected to server');

    var coll = db.collection(MD_COLL);

    var all = coll.find({}).toArray(function(err, docs) {
        console.log("\n**** Found these! ****\n");
        console.dir(docs);
    });

});


describe('ISO and Dublin Core editing views', function() {

    it('should redirect /index.html to index.html#/iso', function() {

        browser.get('/frontend/index.html');

        browser.getLocationAbsUrl().then(function(url) {
            expect(url).toEqual('/iso');
        });
    });

    it('should go to #/dublin when the dublin core button is pressed', function () {

        browser.get('/frontend/index.html');

        element(by.css('[href="#/dublin"]')).click();

        browser.getLocationAbsUrl().then(function(url) {
            expect(url).toEqual('/dublin');
        });
    });
});


describe('Adding and removing contacts using buttons', function () {

    it('should add/remove access contacts when the add/remove citation ' +
       'button is pressed', function () {

        expect(true).toBe(false);

    });

    it('should add/remove citation contacts when the add/remove citation ' +
       'button is pressed', function () {

        expect(true).toBe(false);

    });
});