'use strict';


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

        browser.get('/frontend/index.html');

        element.all(by.css('.contact-input')).sendKeys('aaaaa');
        element.all(by.css('.contact-email')).sendKeys('a@aaaa.com');

        var addContact = element(by.css('[ng-click="addContactAccess()"]'));

        addContact.click();

        var accessContacts =
            element.all(by.repeater('contact in currentRecord.access'));

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
            element.all(by.repeater('contact in currentRecord.citation'));

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

    describe('Edit existing record', function () {
        beforeEach(function () {
            element(by.model('currentRecord.title')).sendKeys('Record One');
            element(by.css('[ng-click="submitDraftRecord()"]')).click();

            element(by.css('[ng-click="createNewRecord()"]')).click();

            element(by.model('currentRecord.title')).sendKeys('Record Two');
            element(by.css('[ng-click="submitDraftRecord()"]')).click();
        });

        afterEach(function() {
            // remove records from the database
        })

        it('should show the records that have been saved as draft', function () {
            var recordListElements = element.all(by.css('.record-list-actions'));

            expect(recordListElements.count()).toEqual(2);
        });

        it('should load the appropriate record when Edit is clicked', function () {
            var editRecordButtons = element.all(by.css('a.record-list-edit'));

            editRecordButtons.get(0).click();

            expect(element(by.id('record-title')).getText()).toEqual('Editing Existing: Record One');

            editRecordButtons.get(1).click();

            expect(element(by.id('record-title')).getText()).toEqual('Editing Existing: Record Two');
        });
    });

    describe('Create new metadata record', function () {
        it('should clear any information that has been input', function () {

            element(by.model('currentRecord.title')).sendKeys('Record One');
            element(by.model('currentRecord.summary')).sendKeys('A record of some stuff');

            element(by.model('currentRecord.north_lat')).sendKeys('46.8');
            element(by.model('currentRecord.south_lat')).sendKeys('35.5');
            element(by.model('currentRecord.east_lon')).sendKeys('-115.0');
            element(by.model('currentRecord.west_lon')).sendKeys('-120.0');

            element(by.css('[ng-click="submitDraftRecord()"]')).click();

            element(by.css('[ng-click="createNewRecord()"]')).click();

            element(by.model('currentRecord.title')).toEqual('');
            element(by.model('currentRecord.summary')).sendKeys('A record of some stuff');

            expect(element(by.model('currentRecord.north_lat')).getText()).toEqual('');
            expect(element(by.model('currentRecord.south_lat')).getText()).toEqual('');
            expect(element(by.model('currentRecord.east_lon')).getText()).toEqual('');
            expect(element(by.model('currentRecord.west_lon')).getText()).toEqual('');
        });
    });
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
