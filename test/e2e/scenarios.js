'use strict';

var mongo = require('mongodb');

var mongocl = mongo.MongoClient;

var MD_COLLECTION = 'metadata';
var MD_TEST_DB = 'mdedit_test';
var MONGO_HOST = 'mongodb://localhost:27017/';


mongocl.connect('mongodb://localhost:27017/' + MD_TEST_DB, function (err, db) {

    console.log('Connected to server');

    var coll = db.collection(MD_COLLECTION);


    coll.drop({});

    coll.find({}).toArray(function(err, docs) {
        console.log("\n**** This should be empty: ****\n");
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

        element(by.id('record-options-dropdown')).click();
        element(by.css('[href="#/dublin"]')).click();

        browser.getLocationAbsUrl().then(function(url) {
            expect(url).toEqual('/dublin');
        });
    });
});


describe('Adding and removing contacts using buttons', function () {

    it('should add/remove access contacts when the add/remove citation ' +
       'button is pressed', function () {

        browser.get('/frontend/index.html');

        element.all(by.css('.contact-input')).sendKeys('aaaaa');
        element.all(by.css('.contact-email')).sendKeys('a@aaaa.com');

        var addContact = element(by.css('[ng-click="addContactAccess()"]'));

        addContact.click();

        var accessContacts =
            element.all(by.repeater('(contactIdx, contact) in currentRecord.access'));

        expect(accessContacts.count()).toEqual(2);

        addContact.click();

        expect(accessContacts.count()).toEqual(3);

        var removeContact = element(by.css('[ng-click="cancelAddContactAccess()"]'));

        removeContact.click();

        expect(accessContacts.count()).toEqual(2);

        removeContact.click();

        expect(accessContacts.count()).toEqual(1);

        removeContact.click();

        expect(accessContacts.count()).toEqual(1);
    });

    it('should add/remove citation contacts when the add/remove citation ' +
       'button is pressed', function () {

        browser.get('/frontend/index.html');

        element.all(by.css('.contact-input')).sendKeys('aaaaa');
        element.all(by.css('.contact-email')).sendKeys('a@aaaa.com');

        var addContact = element(by.css('[ng-click="addContactCitation()"]'));

        addContact.click();

        var citationContacts =
            element.all(by.repeater('(contactIdx, contact) in currentRecord.citation'));

        expect(citationContacts.count()).toEqual(2);

        addContact.click();

        expect(citationContacts.count()).toEqual(3);

        var removeContact = element(by.css('[ng-click="cancelAddContactCitation()"]'));

        removeContact.click();

        expect(citationContacts.count()).toEqual(2);

        removeContact.click();

        expect(citationContacts.count()).toEqual(1);

        removeContact.click();

        expect(citationContacts.count()).toEqual(1);

    });
});

describe('Manage your metadata dropdown', function () {

    var newRecord = {

        title: 'Record One',
        summary: 'A good dataset',
        last_mod_date: {$date: new Date(2010, 0, 1)},
        first_pub_date: {$date: new Date(2014, 10, 15)},

        update_frequency: 'monthly',
        status: 'stored in an offline facility',
        spatial_dtype: 'grid',
        hierarchy_level: 'dataset',
        topic_category: ['biota', 'economy'],
        place_keywords: 'Idaho, Treasure Valley',
        thematic_keywords: 'Agriculture, Water',

        data_format: ['netCDF'],
        compression_technique: 'zlib',
        online: ['http://example.com/mynetcdfs/33422525'],
        use_restrictions: 'None',

        citation: [{
          'name': 'Matt', 'email': 'matt@example.com', 'org': 'NKN', 'address': '34 Concord',
          'city': 'Rochester', 'state': 'Idaho', 'zipcode': '83843', 'country': 'USA', 'phone': '555-5555'
        }, {
          'name': 'Rodney Dangerfield', 'email': 'rodang@example.com', 'org': 'FunnyMen.org', 'address': '443 Broadway',
          'city': 'New York', 'state': 'New York', 'zipcode': '10003', 'country': 'USA', 'phone': '202-555-5555'
        }],

        access: [{
          'name': 'Marisa', 'email': 'nkn@example.com', 'org': 'NKN', 'address': '875 Perimeter',
          'city': 'Moscow', 'state': 'Idaho', 'zipcode': '83844', 'country': 'USA', 'phone': '208-555-5555'
        }],

        west_lon: '-116.0',
        east_lon: '-110.0',
        north_lat: '46.5',
        south_lat: '35.0',

        start_date: {$date: new Date(2010, 0, 1)},
        end_date: {$date: new Date(2012, 11, 31)}
    };

    describe('Create New and Edit existing record', function () {

        beforeEach(function () {

            browser.get('/frontend/index.html');

            // add data to contacts
            var addCitationButton =
                element(by.css('[ng-click="addContactCitation()"]'));

            var citationContacts =
                element.all(by.repeater('contact in currentRecord.citation'));

            var accessContacts =
                element.all(by.repeater('contact in currentRecord.access'));

            for (var i = 0; i < 2; i++)
            {
                var c = newRecord.citation[i];
                var contactFieldIdx = 0;
                for (var k in c)
                {
                    element(by.id('citation-' + k + '-' + i)).sendKeys(c[k]);

                }
                if (i === 0)
                {
                    addCitationButton.click();
                }
            }

            var ca = newRecord.access[0];
            for (var ka in ca)
            {
                element(by.id('access-' + ka + '-0')).sendKeys(ca[ka]);
            }

            for (var key in newRecord)
            {
                if (['access', 'citation'].indexOf(key) === -1)
                {
                    if (['topic_category', 'data_format', 'online', 'last_mod_date'].indexOf(key) === -1)
                    {
                        var model = 'currentRecord.' + key;
                        if (['first_pub_date', 'start_date', 'end_date'].indexOf(key) > -1)
                        {
                            model = model + '.$date';
                        }
                        element(by.model(model)).sendKeys(newRecord[key]);
                    }
                }
            }
        });

        afterEach(function() {
            // remove records from the database
        });

        it('should have two citation contacts from beforeEach', function () {
            var citationContacts =
                element.all(by.repeater('(contactIdx, contact) in currentRecord.citation'));
            expect(citationContacts.count()).toEqual(2);
        });

        it('should have two citation contacts from beforeEach', function () {
            var accessContacts =
                element.all(by.repeater('(contactIdx, contact) in currentRecord.access'));

            expect(accessContacts.count()).toEqual(1);
        });

        it('should save the new record when the save option is selected', function () {

            element(by.id('record-options-dropdown')).click();
            element(by.css('[ng-click="submitDraftRecord()"')).click();

            element(by.id('manage-your-metadata-dropdown')).click();

            var recRows = element.all(by.css('.record-dropdown-list-element'));
            expect(recRows.count()).toEqual(1);

            expect(element(by.css('.record-list-title')).getText())
                .toEqual('Record One');
        });

        it('should faithfully re-load all of Record One\'s data when selected for edit', function () {
            browser.get('/frontend/index.html');

            element(by.id('manage-your-metadata-dropdown')).click();

            element(by.id('edit-record-0')).click();

            expect(element(by.css('#record-title[ng-show="!newRecord"]')).getText())
                .toEqual('Editing Existing: Record One');
        });
    });

        //it('should show the records that have been saved as draft', function () {
            //var recordListElements = element.all(by.css('.record-list-actions'));

            //expect(recordListElements.count()).toEqual(2);
        //});

        //it('should load the appropriate record when Edit is clicked', function () {
            //var editRecordButtons = element.all(by.css('a.record-list-edit'));

            //editRecordButtons.get(0).click();

            //expect(element(by.id('record-title')).getText()).toEqual('Editing Existing: Record One');

            //editRecordButtons.get(1).click();

            //expect(element(by.id('record-title')).getText()).toEqual('Editing Existing: Record Two');
        //});
    //});

    //describe('Create new metadata record', function () {
        //it('should clear any information that has been input', function () {

            //element(by.model('currentRecord.title')).sendKeys('Record One');
            //element(by.model('currentRecord.summary')).sendKeys('A record of some stuff');

            //element(by.model('currentRecord.north_lat')).sendKeys('46.8');
            //element(by.model('currentRecord.south_lat')).sendKeys('35.5');
            //element(by.model('currentRecord.east_lon')).sendKeys('-115.0');
            //element(by.model('currentRecord.west_lon')).sendKeys('-120.0');

            //element(by.css('[ng-click="submitDraftRecord()"]')).click();

            //element(by.css('[ng-click="createNewRecord()"]')).click();

            //element(by.model('currentRecord.title')).toEqual('');
            //element(by.model('currentRecord.summary')).sendKeys('A record of some stuff');

            //expect(element(by.model('currentRecord.north_lat')).getText()).toEqual('');
            //expect(element(by.model('currentRecord.south_lat')).getText()).toEqual('');
            //expect(element(by.model('currentRecord.east_lon')).getText()).toEqual('');
            //expect(element(by.model('currentRecord.west_lon')).getText()).toEqual('');
        //});
    //});
});

//describe('MILES Defaults', function () {

    //it('should load the correct fields with correct data', function () {

        //expect(true).toBe(false);

    //});
//});


//describe('Manipulating whole records: ', function() {

    //describe('create a new record', function () {

        //it('should overwrite any data currently in the form', function () {

            //expect(true).toBe(false);

        //});

        //it('should display \'Create new...\' and the title of the new record',
            //function () {

            //expect(true).toBe(false);

        //});
    //});

    //describe('save record as draft', function () {

        //it('should create a new entry in the database if it\'s a a new record',
            //function () {

            //expect(true).toBe(false);

        //});

        //it('should update fields in the database if it\'s an existing record',
            //function (){

            //expect(true).toBe(false);

        //});

        //it('should change the Create New... before the title to Editing...',
            //function () {

            //expect(true).toBe(false);

        //});
    //});

    //describe('publish dataset', function () {

        //it('should add a record of being published to its database representation',
            //function () {

            //expect(true).toBe(false);

        //});

        //it('should save its metadata to file in specified standard ' +
           //'(Dublin Core or ISO 19115)', function () {

            //expect(true).toBe(false);

        //});
    //});
//});
