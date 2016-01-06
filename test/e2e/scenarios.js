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

        // coll.find({}).toArray(function(err, docs) {
        //     console.log("\n**** This should be empty: ****\n");
        //     console.dir(docs);
        // });
    });
};

clearCollection();

// describe('ISO and Dublin Core editing views', function () {

//     it('should redirect /index.html to index.html#/iso', function() {

//         browser.get('/frontend/index.html');

//         browser.getLocationAbsUrl().then(function(url) {
//             expect(url).toEqual('/iso');
//         });
//     });

//     it('should go to #/dublin when the dublin core button is pressed', function () {

//         browser.get('/frontend/index.html');

//         element(by.id('record-options-dropdown')).click();
//         element(by.css('[href="#/dublin"]')).click();

//         browser.getLocationAbsUrl().then(function(url) {
//             expect(url).toEqual('/dublin');
//         });
//     });
// });


// describe('Adding and removing contacts using buttons', function () {

//     it('should add/remove access contacts when the add/remove citation ' +
//        'button is pressed', function () {

//         browser.get('/frontend/index.html');

//         element.all(by.css('.contact-input')).sendKeys('aaaaa');
//         element.all(by.css('.contact-email')).sendKeys('a@aaaa.com');

//         var addContact = element(by.css('[ng-click="addContactAccess()"]'));

//         addContact.click();

//         var accessContacts =
//             element.all(by.repeater('(contactIdx, contact) in currentRecord.access'));

//         expect(accessContacts.count()).toEqual(2);

//         addContact.click();

//         expect(accessContacts.count()).toEqual(3);

//         var removeContact = element(by.css('[ng-click="cancelAddContactAccess()"]'));

//         removeContact.click();

//         expect(accessContacts.count()).toEqual(2);

//         removeContact.click();

//         expect(accessContacts.count()).toEqual(1);

//         removeContact.click();

//         expect(accessContacts.count()).toEqual(1);
//     });

//     it('should add/remove citation contacts when the add/remove citation ' +
//        'button is pressed', function () {

//         browser.get('/frontend/index.html');

//         element.all(by.css('.contact-input')).sendKeys('aaaaa');
//         element.all(by.css('.contact-email')).sendKeys('a@aaaa.com');

//         var addContact = element(by.css('[ng-click="addContactCitation()"]'));

//         addContact.click();

//         var citationContacts =
//             element.all(by.repeater('(contactIdx, contact) in currentRecord.citation'));

//         expect(citationContacts.count()).toEqual(2);

//         addContact.click();

//         expect(citationContacts.count()).toEqual(3);

//         var removeContact = element(by.css('[ng-click="cancelAddContactCitation()"]'));

//         removeContact.click();

//         expect(citationContacts.count()).toEqual(2);

//         removeContact.click();

//         expect(citationContacts.count()).toEqual(1);

//         removeContact.click();

//         expect(citationContacts.count()).toEqual(1);
//     });
// });

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

    // afterEach(clearCollection);

    // it('should have two citation contacts and one access contact from beforeEach', function () {

    //     var citationContacts =
    //         element.all(by.repeater('(contactIdx, contact) in currentRecord.citation'));
    //     expect(citationContacts.count()).toEqual(2);

    //     var accessContacts =
    //         element.all(by.repeater('(contactIdx, contact) in currentRecord.access'));

    //     expect(accessContacts.count()).toEqual(1);
    // });

    // it('should save the new record when the save option is selected, then faithfully re-load', function () {

    //     element(by.id('record-options-dropdown')).click();
    //     element(by.css('[ng-click="submitDraftRecord()"')).click();

    //     element(by.id('manage-your-metadata-dropdown')).click();

    //     var recRows = element.all(by.repeater('record in allRecords'));
    //     expect(recRows.count()).toEqual(1);

    //     element(by.id('manage-your-metadata-dropdown')).click();

    //     expect(element(by.id('record-list-title-0')).getAttribute("innerText"))
    //         .toEqual('Record One');

    //     // get a list of metadata records
    //     element(by.id('manage-your-metadata-dropdown')).click();
    //     // click the first one in the list
    //     element(by.id('edit-record-0')).click();
    //     // check the title
    //     expect(
    //         element(by.css('#record-title[ng-show="!newRecord"]'))
    //             .getText()
    //     )
    //     .toEqual('Editing Existing: Record One');

    //     // check contacts
    //     var ccExpected = newRecord.citation;
    //     var caExpected = newRecord.access;

    //     for (var ccIdx = 0; ccIdx < 2; ccIdx++)
    //     {
    //         for (var ccKey in ccExpected[ccIdx])
    //         {
    //             expect(
    //                 element(by.id('citation-' + ccKey + '-' + ccIdx))
    //                     .getAttribute('value')
    //             )
    //             .toEqual(ccExpected[ccIdx][ccKey]);
    //         }
    //     }
    //     for (var caKey in caExpected[0])
    //     {
    //         expect(element(by.id('access-' + caKey + '-0')).getAttribute('value'))
    //             .toEqual(caExpected[0][caKey]);
    //     }

    //     // check spatial extent
    //     expect(element(by.model('currentRecord.north_lat')).getAttribute('value'))
    //         .toEqual(newRecord.north_lat);
    //     expect(element(by.model('currentRecord.south_lat')).getAttribute('value'))
    //         .toEqual(newRecord.south_lat);
    //     expect(element(by.model('currentRecord.east_lon')).getAttribute('value'))
    //         .toEqual(newRecord.east_lon);
    //     expect(element(by.model('currentRecord.west_lon')).getAttribute('value'))
    //         .toEqual(newRecord.west_lon);

    //     // check dates
    //     expect(element(by.model('currentRecord.start_date.$date')).getAttribute('value'))
    //         .toEqual('01/01/2002');

    //     expect(element(by.model('currentRecord.end_date.$date')).getAttribute('value'))
    //         .toEqual('12/31/2012');

    //     // check the rest
    //     expect(element(by.id('format-selector')).getAttribute('value'))
    //         .toEqual('string:netCDF');
    // });

    // it('should clear any information that has been input when creating a new record', function () {

    //     element(by.id('record-options-dropdown')).click();
    //     element(by.css('[ng-click="submitDraftRecord()"')).click();

    //     element(by.id('record-options-dropdown')).click();
    //     element(by.css('[ng-click="createNewRecord()"]')).click();

    //     element(by.model('currentRecord.title')).sendKeys('Record Two');
    //     element(by.model('currentRecord.summary')).sendKeys('Another record of some other stuff');

    //     element(by.model('currentRecord.north_lat')).sendKeys('46.8');
    //     element(by.model('currentRecord.south_lat')).sendKeys('35.5');
    //     element(by.model('currentRecord.east_lon')).sendKeys('-115.0');
    //     element(by.model('currentRecord.west_lon')).sendKeys('-120.0');

    //     element(by.id('record-options-dropdown')).click();
    //     element(by.css('[ng-click="submitDraftRecord()"]')).click();

    //     var recordListElements = element.all(by.css('.record-list-actions'));

    //     expect(recordListElements.count()).toEqual(2);

    //     element(by.id('record-options-dropdown')).click();
    //     element(by.css('[ng-click="createNewRecord()"]')).click();

    //     expect(element(by.model('currentRecord.title')).getText()).toEqual('');

    //     expect(element(by.model('currentRecord.north_lat')).getText()).toEqual('');
    //     expect(element(by.model('currentRecord.south_lat')).getText()).toEqual('');
    //     expect(element(by.model('currentRecord.east_lon')).getText()).toEqual('');
    //     expect(element(by.model('currentRecord.west_lon')).getText()).toEqual('');
    // });

    it('should publish a record to the server with a valid form after save', function () {
        element(by.id('record-options-dropdown')).click();
        element(by.css('[ng-click="submitDraftRecord()"')).click();

        element(by.id('record-options-dropdown')).click();
        element(by.id('record-options-publish')).click();
        // check that the file has been saved to the mdedit_preprod_test dir
        console.log('\n***** dirname: ' + __dirname + ' *****\n');
        var targetDir = __dirname + '/../../mdedit_preprod_test';
        console.log('\n***** target dir: ' + targetDir + ' *****\n');
        // fs.readdir(targetDir, (err, files) => {
        //     console.log(files);
        //     expect(files.length).toBe(1);
        //     fs.readdir(__dirname + '/../../mdedit_preprod_test/' + files[0],
        //         (nextErr, nextFiles) => {

        //         expect(files.length).toBe(1);
        //     });
        // });
        //
        var files = fs.readdirSync(targetDir);
        console.log('\n***** list target dir: ' + files + ' *****\n');
    });

    // it('should publish an unsaved record to the server', function () {
    //     element(by.id('record-options-dropdown')).click();
    //     element(by.css('[ng-click="publishRecord()"')).click();

    //     // check that the file has been saved to the mdedit_preprod_test dir
    //     fs.readdir('mdedit_preprod_test', (err, files) => {
    //         console.log(files);
    //         expect(files.length).toBe(1);
    //         fs.readdir('mdedit_preprod_test/' + files[0],
    //             (nextErr, nextFiles) => {

    //             expect(files.length).toBe(1);
    //         });
    //     });
    // });
});


// describe('MILES Defaults', function () {

//     it('should load the correct fields with correct data', function () {

//         element(by.id('defaults-dropdown')).click();
//         element(by.css('[ng-click="loadDefaultMILES()"]')).click();

//         expect(element(by.model('currentRecord.place_keywords')).getAttribute('value'))
//             .toBe('USA, Idaho');

//         expect(element(by.model('currentRecord.thematic_keywords')).getAttribute('value'))
//             .toBe('IIA-1301792, MILES, EPSCoR');

//         expect(element(by.model('currentRecord.north_lat')).getAttribute('value'))
//             .toBe('49.0011461');
//         expect(element(by.model('currentRecord.south_lat')).getAttribute('value'))
//             .toBe('41.9880051');
//         expect(element(by.model('currentRecord.east_lon')).getAttribute('value'))
//             .toBe('-111.043495');
//         expect(element(by.model('currentRecord.west_lon')).getAttribute('value'))
//             .toBe('-117.2413657');

//         expect(element(by.id('access-name-0')).getAttribute('value'))
//             .toBe('Northwest Knowledge Network');

//         expect(element(by.id('access-email-0')).getAttribute('value'))
//             .toBe('info@northwestknowledge.net');

//         expect(element(by.id('access-org-0')).getAttribute('value'))
//             .toBe('University of Idaho');

//         expect(element(by.id('access-address-0')).getAttribute('value'))
//             .toBe('875 Perimeter Dr. MS 2358');

//         expect(element(by.id('access-city-0')).getAttribute('value'))
//             .toBe('Moscow');

//         expect(element(by.id('access-state-0')).getAttribute('value'))
//             .toBe('Idaho');

//         expect(element(by.id('access-zipcode-0')).getAttribute('value'))
//             .toBe('83844-2358');

//         expect(element(by.id('access-country-0')).getAttribute('value'))
//             .toBe('USA');

//         expect(element(by.id('access-phone-0')).getAttribute('value'))
//             .toBe('208-885-2080');
//     });

//     it('should not overwrite fields that are already present in a new record', function () {

//         element(by.model('currentRecord.title')).sendKeys('Record Two');
//         element(by.model('currentRecord.summary')).sendKeys('Another record of some other stuff');

//         element(by.id('defaults-dropdown')).click();
//         element(by.css('[ng-click="loadDefaultMILES()"]')).click();

//         expect(element(by.model('currentRecord.title')).getAttribute('value'))
//             .toBe('Record Two');

//         expect(element(by.model('currentRecord.summary')).getAttribute('value'))
//             .toBe('Another record of some other stuff');
//     });
// });
