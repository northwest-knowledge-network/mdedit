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
