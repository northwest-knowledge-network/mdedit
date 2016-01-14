'use strict';

var mongo = require('mongodb');
var fs = require('fs');

var mongocl = mongo.MongoClient;

var MD_COLLECTION = 'metadata';
var MD_TEST_DB = 'mdedit_test';
var MONGO_HOST = 'mongodb://localhost:27017/';

var clearCollection = function () {
    mongocl.connect(MONGO_HOST + MD_TEST_DB, function (err, db) {

        var coll = db.collection(MD_COLLECTION);

        coll.drop({});
    });
};


clearCollection();


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


describe('Delete a metadata record', function() {

    beforeEach( function () {
        browser.get('/frontend/index.html');

        element(by.model('currentRecord.title')).sendKeys('¡Pollo Loco!');
        element(by.model('currentRecord.summary')).sendKeys('mmmm....chicken');

        element(by.id('record-options-dropdown')).click();
        element(by.css('[ng-click="submitDraftRecord()"]')).click();
    });

    afterEach(clearCollection);

    it('should delete the saved record even if current record has no id (i.e. has not yet been saved as draft)',
        function () {

        var recordsList = element.all(by.repeater('record in allRecords'));
        expect(recordsList.count()).toEqual(1);

        element(by.id('manage-your-metadata-dropdown')).click();
        element(by.id('delete-record-0')).click();

        recordsList = element.all(by.repeater('record in allRecords'));
        expect(recordsList.count()).toEqual(0);
    });

    it('should delete current record and load fresh form when record deleted', function() {
        element(by.id('manage-your-metadata-dropdown')).click();
        element(by.id('delete-record-0')).click();

        element(by.model('currentRecord.title')).getAttribute('value').then( (val) => {
            expect(val.trim()).toBe('');
        });
        element(by.model('currentRecord.summary')).getAttribute('value').then( (val) => {
            expect(val.trim()).toBe('');
        });
    });

    it('should delete non-current record while leaving currently loaded record intact', function () {
        element(by.id('record-options-dropdown')).click();
        element(by.id('create-new-dataset')).click();

        element(by.model('currentRecord.title')).sendKeys('KFC');
        var summary = 'Trust the colonel, you\'ll need a colonoscopy after a lifetime of eating KFC';
        element(by.model('currentRecord.summary')).sendKeys(summary);

        element(by.id('manage-your-metadata-dropdown')).click();
        element(by.id('delete-record-0')).click();

        expect(element(by.model('currentRecord.title')).getAttribute('value'))
            .toBe('KFC');
        expect(element(by.model('currentRecord.summary')).getAttribute('value'))
            .toBe(summary);
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

        west_lon: '-116.15',
        east_lon: '-110.675',
        north_lat: '46.5',
        south_lat: '35.44',

        start_date: {$date: new Date(2002, 0, 1)},
        end_date: {$date: new Date(2012, 11, 31)}
    };

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
                    var data;
                    if (['first_pub_date', 'start_date',
                         'end_date'].indexOf(key) === -1)
                    {
                        element(by.model(model)).sendKeys(newRecord[key]);
                    }
                }
            }
        }

        element(by.css('[label="netCDF"]')).click();

        //element(by.model('currentRecord.start_date.$date')).sendKeys('01-01-2002');
        element(by.id('start-date')).clear().sendKeys('01/01/2002').sendKeys(protractor.Key.TAB);
        // search.sendKeys(protractor.Key.TAB);
        element(by.id('end-date')).clear().sendKeys('12/31/2012').sendKeys(protractor.Key.TAB);
    });

    afterEach(clearCollection);

    it('should have two citation contacts and one access contact from beforeEach', function () {

        var citationContacts =
            element.all(by.repeater('(contactIdx, contact) in currentRecord.citation'));
        expect(citationContacts.count()).toEqual(2);

        var accessContacts =
            element.all(by.repeater('(contactIdx, contact) in currentRecord.access'));

        expect(accessContacts.count()).toEqual(1);
    });

    it('should save the new record when the save option is selected, then faithfully re-load', function () {

        element(by.id('record-options-dropdown')).click();
        element(by.css('[ng-click="submitDraftRecord()"')).click();

        element(by.id('manage-your-metadata-dropdown')).click();

        var recRows = element.all(by.repeater('record in allRecords'));
        expect(recRows.count()).toEqual(1);

        element(by.id('manage-your-metadata-dropdown')).click();

        expect(element(by.id('record-list-title-0')).getAttribute("innerText"))
            .toEqual('Record One');

        // get a list of metadata records
        element(by.id('manage-your-metadata-dropdown')).click();
        // click the first one in the list
        element(by.id('edit-record-0')).click();
        // check the title
        expect(
            element(by.css('#record-title[ng-show="!newRecord"]'))
                .getText()
        )
        .toEqual('Editing Existing: Record One');

        // check contacts
        var ccExpected = newRecord.citation;
        var caExpected = newRecord.access;

        for (var ccIdx = 0; ccIdx < 2; ccIdx++)
        {
            for (var ccKey in ccExpected[ccIdx])
            {
                expect(
                    element(by.id('citation-' + ccKey + '-' + ccIdx))
                        .getAttribute('value')
                )
                .toEqual(ccExpected[ccIdx][ccKey]);
            }
        }
        for (var caKey in caExpected[0])
        {
            expect(element(by.id('access-' + caKey + '-0')).getAttribute('value'))
                .toEqual(caExpected[0][caKey]);
        }

        // check spatial extent
        var compareBboxVal = function (dir) {
            var valPromise =
                element(by.model('currentRecord.' + dir)).getAttribute('value');

            valPromise.then(el => {

                var val = parseFloat(el);
                expect(val - parseFloat(newRecord[dir]))
                    .toBeLessThan(0.000001);
            });
        };
        compareBboxVal('north_lat');
        compareBboxVal('south_lat');
        compareBboxVal('east_lon');
        compareBboxVal('west_lon');

        // check dates
        expect(element(by.model('currentRecord.start_date.$date')).getAttribute('value'))
            .toEqual('01/01/2002');

        expect(element(by.model('currentRecord.end_date.$date')).getAttribute('value'))
            .toEqual('12/31/2012');

        // check the rest
        expect(element(by.id('format-selector')).getAttribute('value'))
            .toEqual('string:netCDF');
    });

    it('should clear any information that has been input when creating a new record', function () {

        element(by.id('record-options-dropdown')).click();
        element(by.css('[ng-click="submitDraftRecord()"')).click();

        element(by.id('record-options-dropdown')).click();
        element(by.css('[ng-click="createNewRecord()"]')).click();

        element(by.model('currentRecord.title')).sendKeys('Record Two');
        element(by.model('currentRecord.summary')).sendKeys('Another record of some other stuff');

        element(by.model('currentRecord.north_lat')).sendKeys('46.8');
        element(by.model('currentRecord.south_lat')).sendKeys('35.5');
        element(by.model('currentRecord.east_lon')).sendKeys('-115.0');
        element(by.model('currentRecord.west_lon')).sendKeys('-120.0');

        element(by.id('record-options-dropdown')).click();
        element(by.css('[ng-click="submitDraftRecord()"]')).click();

        var recordListElements = element.all(by.css('.record-list-actions'));

        expect(recordListElements.count()).toEqual(2);

        element(by.id('record-options-dropdown')).click();
        element(by.css('[ng-click="createNewRecord()"]')).click();

        expect(element(by.model('currentRecord.title')).getText()).toEqual('');

        expect(element(by.model('currentRecord.north_lat')).getText()).toEqual('');
        expect(element(by.model('currentRecord.south_lat')).getText()).toEqual('');
        expect(element(by.model('currentRecord.east_lon')).getText()).toEqual('');
        expect(element(by.model('currentRecord.west_lon')).getText()).toEqual('');
    });
});


describe('MILES Defaults', function () {

    it('should load the correct fields with correct data', function () {

        element(by.id('defaults-dropdown')).click();
        element(by.css('[ng-click="loadDefaultMILES()"]')).click();

        expect(element(by.model('currentRecord.place_keywords')).getAttribute('value'))
            .toBe('USA, Idaho');

        expect(element(by.model('currentRecord.thematic_keywords')).getAttribute('value'))
            .toBe('IIA-1301792, MILES, EPSCoR');

        // check spatial extent
        var expectedBboxValues = {
            north_lat: 49.0011461,
            south_lat: 41.9880051,
            west_lon: -117.2413657,
            east_lon: -111.043495
        };
        var compareBboxVal = function (dir) {
            var valPromise =
                element(by.model('currentRecord.' + dir)).getAttribute('value');

            valPromise.then(el => {

                var val = parseFloat(el);
                expect(val - expectedBboxValues[dir])
                    .toBeLessThan(0.000001);
            });
        };
        compareBboxVal('north_lat');
        compareBboxVal('south_lat');
        compareBboxVal('east_lon');
        compareBboxVal('west_lon');

        expect(element(by.id('access-name-0')).getAttribute('value'))
            .toBe('Northwest Knowledge Network');

        expect(element(by.id('access-email-0')).getAttribute('value'))
            .toBe('info@northwestknowledge.net');

        expect(element(by.id('access-org-0')).getAttribute('value'))
            .toBe('University of Idaho');

        expect(element(by.id('access-address-0')).getAttribute('value'))
            .toBe('875 Perimeter Dr. MS 2358');

        expect(element(by.id('access-city-0')).getAttribute('value'))
            .toBe('Moscow');

        expect(element(by.id('access-state-0')).getAttribute('value'))
            .toBe('Idaho');

        expect(element(by.id('access-zipcode-0')).getAttribute('value'))
            .toBe('83844-2358');

        expect(element(by.id('access-country-0')).getAttribute('value'))
            .toBe('USA');

        expect(element(by.id('access-phone-0')).getAttribute('value'))
            .toBe('208-885-2080');
    });

    it('should not overwrite fields that are already present in a new record', function () {

        element(by.id('record-options-dropdown')).click();
        element(by.id('create-new-dataset')).click();

        element(by.model('currentRecord.title')).sendKeys('Record Two');
        element(by.model('currentRecord.summary')).sendKeys('Another record of some other stuff');

        element(by.id('defaults-dropdown')).click();
        element(by.css('[ng-click="loadDefaultMILES()"]')).click();

        expect(element(by.model('currentRecord.title')).getAttribute('value'))
            .toBe('Record Two');

        expect(element(by.model('currentRecord.summary')).getAttribute('value'))
            .toBe('Another record of some other stuff');
    });
});


describe('NKN as distributor', function () {

    beforeEach(function () {
        browser.get('/frontend/index.html');
    });

    it('should fill in the distributor as NKN', function() {

        element(by.id('defaults-dropdown')).click();
        element(by.css('[ng-click="loadDefaultNKNAsDistributor()"]')).click();

        expect(element(by.id('access-name-0')).getAttribute('value'))
            .toBe('Northwest Knowledge Network');

        expect(element(by.id('access-email-0')).getAttribute('value'))
            .toBe('info@northwestknowledge.net');

        expect(element(by.id('access-org-0')).getAttribute('value'))
            .toBe('University of Idaho');

        expect(element(by.id('access-address-0')).getAttribute('value'))
            .toBe('875 Perimeter Dr. MS 2358');

        expect(element(by.id('access-city-0')).getAttribute('value'))
            .toBe('Moscow');

        expect(element(by.id('access-state-0')).getAttribute('value'))
            .toBe('Idaho');

        expect(element(by.id('access-zipcode-0')).getAttribute('value'))
            .toBe('83844-2358');

        expect(element(by.id('access-country-0')).getAttribute('value'))
            .toBe('USA');

        expect(element(by.id('access-phone-0')).getAttribute('value'))
            .toBe('208-885-2080');
    });

    it('should not overwrite fields already present in a new record', function () {

        element(by.model('currentRecord.title')).sendKeys('A new record');
        element(by.model('currentRecord.summary')).sendKeys('the summary');

        element(by.id('defaults-dropdown')).click();
        element(by.css('[ng-click="loadDefaultNKNAsDistributor()"]')).click();

        expect(element(by.model('currentRecord.title')).getAttribute('value'))
            .toBe('A new record');

        expect(element(by.model('currentRecord.summary')).getAttribute('value'))
            .toBe('the summary');
    });
});

describe('Show/hide help', function () {

    beforeEach(function () {
        browser.get('/frontend/index.html');
    });

    it('should show \'Show Help', function () {
        expect(element(by.buttonText('Show Help')).isPresent()).toBe(true);
    });

    it('should show the help when \'Show Help\' is clicked', function () {
        element(by.id('showHelp')).click();

        var help = element(by.id('help'));

        var helpH5s = help.all(by.tagName('h5'));
        expect(helpH5s.count()).toBe(2);

        var helpDivs = help.all(by.tagName('div'));
        // includes the help div itself
        expect(helpDivs.count()).toBe(2);

        expect(element(by.buttonText('Hide Help')).isPresent()).toBe(true);
    });

    it('should hide help after \'Hide Help\' is clicked', function () {

        element(by.id('showHelp')).click();

        element(by.id('hideHelp')).click();

        var help = element(by.id('help'));
        expect(help.isDisplayed()).toBe(false);

        expect(element(by.buttonText('Show Help')).isPresent()).toBe(true);
    });
});


describe('Export ISO', function () {

    afterEach(() => {
        clearCollection();
    });

    it('should open a new window properly', function () {

        browser.get('/frontend/index.html');

        element(by.model('currentRecord.title')).sendKeys('¡Pollo Loco!');
        element(by.model('currentRecord.summary')).sendKeys('The craziest tasting Chicken!');

        element(by.id('record-options-dropdown')).click().then( () =>
            element(by.css('[ng-click="submitDraftRecord()"')).click()
        );

        element(by.id('export-dropdown')).click();
        element(by.css('[ng-click="export_(\'iso\')"]')).click();
        expect(browser.driver.getCurrentUrl()).toMatch(/iso/);
    });
});

describe('Export options should show after a record has been saved', function () {
    it('\'Export as...\' should be visible', function () {
        browser.get('/frontend/index.html');

        element(by.model('currentRecord.title')).sendKeys('¡Pollo Loco!');
        element(by.model('currentRecord.summary')).sendKeys('The craziest tasting Chicken!');

        element(by.id('record-options-dropdown')).click().then( () => {
            element(by.css('[ng-click="submitDraftRecord()"')).click();
            expect(element(by.id('export-dropdown')).isDisplayed()).toBeTruthy();
        });
    });
});