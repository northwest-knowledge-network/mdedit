'use strict';

var mongo = require('mongodb');

var mongocl = mongo.MongoClient;

var MD_COLLECTION = 'metadata';
var MD_TEST_DB = 'mdedit_test';

mongocl.connect('mongodb://localhost:27017/' + MD_TEST_DB, function (err, db) {

    console.log('Connected to server');

    var coll = db.collection(MD_COLLLECTION);

    var all = coll.find({}).toArray(function(err, docs) {
        console.log("\n**** Found these! ****\n");
        console.dir(docs);
    });

});


describe('ISO and Dublin Core editing views', function () {

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


describe('MILES Defaults', function () {

    it('should load the correct fields with correct data', function () {

        expect(true).toBe(false);

    });
});


describe('Manipulating whole records: ', function() {

    describe('create a new record', function () {

        it('should overwrite any data currently in the form', function () {

            expect(true).toBe(false);

        });

        it('should display \'Create new...\' and the title of the new record',
            function () {

            expect(true).toBe(false);

        });
    });

    describe('save record as draft', function () {

        it('should create a new entry in the database if it\'s a a new record',
            function () {

            expect(true).toBe(false);

        });

        it('should update fields in the database if it\'s an existing record',
            function (){

            expect(true).toBe(false);

        });

        it('should change the Create New... before the title to Editing...',
            function () {

            expect(true).toBe(false);

        });
    });

    describe('publish dataset', function () {

        it('should add a record of being published to its database representation',
            function () {

            expect(true).toBe(false);

        });

        it('should save its metadata to file in specified standard ' +
           '(Dublin Core or ISO 19115)', function () {

            expect(true).toBe(false);

        });
    });
});