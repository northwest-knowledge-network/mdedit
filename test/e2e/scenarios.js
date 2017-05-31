
'use strict';

var mongo = require('mongodb');
var extend = require('node.extend');
var path = require('path');

var mongocl = mongo.MongoClient;

var MD_COLLECTION = 'metadata';
var MD_TEST_DB = 'mdedit_test';
var MONGO_HOST = 'mongodb://localhost:27017/';

//Variable that keeps track of name of current form type ("iso" or "dublin").
var form = "iso";

var clearCollection = function () {
    mongocl.connect(MONGO_HOST + MD_TEST_DB, function (err, db) {

        var coll = db.collection(MD_COLLECTION);

        coll.drop({});
    });
};

clearCollection();


//testNknAsDistributor('iso');
//testNknAsDistributor('dublin');


/* XXX perhaps issue w/ webdriver version, but testExportISO is getting stuck */

//testExportISO('iso');
//testExportISO('dublin');


//testLoadDeleteDropdown('iso');
//testLoadDeleteDropdown('dublin');

//testMilesDefaults('iso');
//testMilesDefaults('dublin');

//deleteRecordTest('iso');
//deleteRecordTest('dublin');

//attachFileTest('iso');
//attachFileTest('dublin');

//contactsTest();

//testAnimation('iso');
//testAnimation('dublin');

//testDynamicFormAddition('iso');
//testDynamicFormAddition('dublin');

testReviewSection('iso');
//testReviewSection('dublin');

//Admin tests not ready yet
/*
testAdminView("iso");
testAdminView("dublin");
testAdminView("admin");
*/
describe('ISO and Dublin Core editing views', function () {

     it('should go to #/dublin when the dublin core button is pressed', function () {

         browser.get('/frontend/index.html');

	 setFormType("iso");
	 var formType = getFormType();
	 
	 //Click on form button for specific form section and wait for scroll animation to finish before proceding.
	 exposeFormElement(formType, 'setup');
	 
         element(by.id('create-new-non-dataset')).click();

	 setFormType("dublin");
	 formType = getFormType();
         browser.getLocationAbsUrl().then(function(url) {
             expect(url).toEqual('/dublin');
         });
     });
 });

function waitForAnimation(item){
    var EC = protractor.ExpectedConditions;
    var itemID = element(by.id(item));
    var isClickable = EC.elementToBeClickable(itemID);
    browser.wait(isClickable, 5000);
}

function contactsTest() {

    describe('Adding and removing contacts using buttons', function () {
	
        var addRemoveContacts = function () {
	    var formType = getFormType();

            element.all(by.css('.contact-input')).sendKeys('aaaaa');
            element.all(by.css('.contact-email')).sendKeys('a@aaaa.com');

	    exposeFormElement(formType, "contacts");
	    
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
        };
	
        it('should add/remove access contacts when the add/remove citation ' +
           'button is pressed for iso and dublin', function () {
 	       
               browser.get('/frontend');
	       setFormType("iso");
	       var formType = getFormType();

               exposeFormElement(formType, "setup");
	       element(by.id('create-new-dataset')).click();
	       setFormType("iso");
	       formType = getFormType();
	       
	       addRemoveContacts();
	       
	       exposeFormElement(formType, "setup");

	       element(by.id('create-new-non-dataset')).click();
	       setFormType("dublin");
	       formType = getFormType();
	       
               addRemoveContacts();
           });
     });
}


function deleteRecordTest(schemaType) {

    describe('Delete a metadata record', function() {
	
        beforeEach( function () {
	    clearCollection();
            browser.get('/frontend');
	    setFormType("iso");
	    var formType = getFormType();

	    exposeFormElement(formType, "setup");
	    
            if (schemaType === 'iso'){
                element(by.id('create-new-dataset')).click();
            }else if (schemaType === 'dublin'){
                element(by.id('create-new-non-dataset')).click();
	    }
	    
	    setFormType(schemaType);
	    formType = getFormType();

	    exposeFormElement(formType, "basic");
	    
            element(by.model('currentRecord.title')).sendKeys('¡Pollo Loco!');
            element(by.model('currentRecord.summary')).sendKeys('mmmm....chicken');

	    //Automatically saves when changing states, so change back to first state of form.
	    exposeFormElement(formType, "basic");
        });

        afterEach(clearCollection);

        it('should delete the saved record even if current record has no id (i.e. has not yet been saved as draft)',
            function () {
		var formType = getFormType();

		var recordsList = element.all(by.repeater('record in allRecords'));
		expect(recordsList.count()).toEqual(1);
		
		element(by.id('load-delete-record-dropdown')).click();
		element(by.id('delete-record-0')).click();
		
		//Have to wait for alert box to appear before trying to click it
		browser.driver.sleep(100);
		browser.switchTo().alert().accept();
		
		recordsList = element.all(by.repeater('record in allRecords'));
		expect(recordsList.count()).toEqual(0);
        });

        it('should delete current record and load fresh form when record deleted', function() {
	    var formType = getFormType();

	    exposeFormElement(formType, "basic");
	    
            element(by.id('load-delete-record-dropdown')).click();
            element(by.id('delete-record-0')).click();

	    //Have to wait for alert box to appear before trying to click it
	    browser.driver.sleep(100);
            browser.switchTo().alert().accept();

            element(by.model('currentRecord.title')).getAttribute('value').then( (val) => {
                expect(val.trim()).toBe('');
            });
            element(by.model('currentRecord.summary')).getAttribute('value').then( (val) => {
                expect(val.trim()).toBe('');
            });
        });

        it('should delete non-current record while leaving currently loaded record intact', function () {
	    var formType = getFormType();

	    exposeFormElement(formType, "setup");
	    
            element(by.id('create-new-dataset')).click();
	    setFormType("iso");
	    formType = getFormType();

	    //Go to basic information state

	    exposeFormElement(formType, "basic");
	    
            element(by.model('currentRecord.title')).sendKeys('KFC');
            var summary = 'Trust the colonel, you\'ll need a colonoscopy after a lifetime of eating KFC';
            element(by.model('currentRecord.summary')).sendKeys(summary);

            element(by.id('load-delete-record-dropdown')).click();
	    //Had to change this from 'delete-record-0' because when every button except "Template Setup" is clicked the record is saved.
	    //So previous method was deleting the current record, and we want to delete the record that was saved in the "beforeEach" function,
	    //and that one is the second record in the list.
            element(by.id('delete-record-1')).click();

	    //Have to wait for alert box to appear before trying to click it
	    browser.driver.sleep(100);
            browser.switchTo().alert().accept();
	    
            expect(element(by.model('currentRecord.title')).getAttribute('value'))
                .toEqual('KFC');
            expect(element(by.model('currentRecord.summary')).getAttribute('value'))
                .toEqual(summary);
        });
    });
}

//Set which form type we are using
function setFormType(type) {
    if((type.indexOf("iso") > -1)
       || (type.indexOf("dublin") > -1)
       || (type.indexOf("admin") > -1))
	form = type;
    else
	console.log("Error: tried to set form to unsupported type. Current supported types are \"iso\", \"dublin\", and \"admin\"");
}

//Get the current form type. Current types are "iso" or "dublin".
function getFormType(){

    if(form == "iso")
	return "form.";
    else if(form == "dublin")
	return "dublinForm.";
    else if(form.indexOf("admin") > -1)
	return "admin";
    else{
	console.log("Error: tried to get unsupported from type.");
	return "";
    }
}

function testLoadDeleteDropdown(schemaType) {
    
    describe('Manage your metadata dropdown', function () {

        var newRecord = {

            title: 'Record One',
            summary: 'A good dataset',
            last_mod_date: {$date: new Date(2010, 0, 1)},
            first_pub_date: {$date: new Date(2014, 10, 15)},

            place_keywords: 'Idaho, Treasure Valley',
            thematic_keywords: 'Agriculture, Water',

            data_format: ['netCDF'],
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

        if (schemaType === 'iso')
        {
            var isoFields = {
                status: 'stored in an offline facility',
                spatial_dtype: 'grid',
                hierarchy_level: 'dataset',
                topic_category: ['biota', 'economy'],
                compression_technique: 'zlib'
            };

            for (var field in isoFields)
            {
                newRecord[field] = isoFields[field];
            }
        }

        beforeEach(function () {

            browser.get('/frontend');
	    setFormType("iso");
	    
	    var formType = getFormType();
	    
            if (schemaType === 'iso'){

		exposeFormElement(formType, "setup");
		
                element(by.id('create-new-dataset')).click();
            }else if (schemaType === 'dublin'){
		exposeFormElement(formType, "setup");
                element(by.id('create-new-non-dataset')).click();
	    }
	    
	    setFormType(schemaType);
	    formType = getFormType();
	    
            // add data to contacts

	    //Change to contacts form element

	    exposeFormElement(formType, "contacts");
	    
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
			    switchFormPage(key, formType, schemaType);
                            element(by.model(model)).sendKeys(newRecord[key]);
                        }
                    }
                }
            }

	    exposeFormElement(formType, "dataFormats");
	    
            element(by.css('[label="netCDF"]')).click();
	    //Save the record by switching pages
	    exposeFormElement(formType, "review");
            if (schemaType === 'iso')
            {
		exposeFormElement(formType, "temporalExtent");
                //element(by.model('currentRecord.start_date.$date')).sendKeys('01-01-2002');
                element(by.id('start-date')).clear().sendKeys('01/01/2002').sendKeys(protractor.Key.TAB);
                // search.sendKeys(protractor.Key.TAB);
                element(by.id('end-date')).clear().sendKeys('12/31/2012').sendKeys(protractor.Key.TAB);

		//Save the record by changing the page
		exposeFormElement(formType, "review");
            }
        });

        afterEach(clearCollection);

         it('should have two citation contacts and one access contact from beforeEach', function () {
	    var formType = getFormType();

	     exposeFormElement(formType, "contacts");

             var citationContacts =
                 element.all(by.repeater('(contactIdx, contact) in currentRecord.citation'));
             expect(citationContacts.count()).toEqual(2);

             var accessContacts =
                 element.all(by.repeater('(contactIdx, contact) in currentRecord.access'));
	     
             expect(accessContacts.count()).toEqual(1);
         });
	
        it('should save the new record when the save option is selected, then faithfully re-load', function () {
	    var formType = getFormType();
	    
            element(by.id('load-delete-record-dropdown')).click();
	    
            var recRows = element.all(by.repeater('record in allRecords'));
            expect(recRows.count()).toEqual(1);
	    
            element(by.id('load-delete-record-dropdown')).click();

            expect(element(by.id('record-list-title-0')).getAttribute("innerText"))
                .toEqual('Record One');
	    
            // get a list of metadata records
            element(by.id('load-delete-record-dropdown')).click();
	    
            // click the first one in the list
            element(by.id('edit-record-' + schemaType + '-0')).click();
            // check the title
            expect(
                element(by.css('#record-title[ng-show="!newRecord"]'))
                    .getText()
            )
		.toEqual('Editing Existing: Record One');
	    
            // check contacts
            var ccExpected = newRecord.citation;
            var caExpected = newRecord.access;

	    exposeFormElement(formType, "contacts");
	    
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
	    switchFormPage("west_lon", formType, schemaType);
	    exposeFormElement(formType, "spatialExtent");
	    
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

            if (schemaType === 'iso')
            {
                // check dates
		exposeFormElement(formType, "temporalExtent");
		
                expect(element(by.model('currentRecord.start_date.$date')).getAttribute('value'))
                    .toEqual('01/01/2002');

                expect(element(by.model('currentRecord.end_date.$date')).getAttribute('value'))
                    .toEqual('12/31/2012');
            }

            // check the rest

	    exposeFormElement(formType, "dataFormats");
	    
            expect(element(by.id('format-selector')).getAttribute('value'))
                .toEqual('string:netCDF');

	    exposeFormElement(formType, "review");
        });

         it('should clear any information that has been input when creating a new record', function () {
	     var formType = getFormType();

             exposeFormElement(formType, "setup");
	     
             element(by.id('create-new-dataset')).click();
	     setFormType("iso");
	     formType = getFormType();

	     exposeFormElement(formType, "basic");
	     
             element(by.model('currentRecord.title')).sendKeys('Record Two');
             element(by.model('currentRecord.summary')).sendKeys('Another record of some other stuff');

	     switchFormPage("west_lon", formType, schemaType);
	     exposeFormElement(formType, "spatialExtent");
	     
             element(by.model('currentRecord.north_lat')).sendKeys('46.8');
             element(by.model('currentRecord.south_lat')).sendKeys('35.5');
             element(by.model('currentRecord.east_lon')).sendKeys('-115.0');
             element(by.model('currentRecord.west_lon')).sendKeys('-120.0');

	     //Save form by clicking on "Basic Information" page. Auto saves when switching between pages

	     exposeFormElement(formType, "basic");
	     
             var recordListElements = element.all(by.css('.record-list-actions'));

             expect(recordListElements.count()).toEqual(2);

	     exposeFormElement(formType, "setup");
	     
             element(by.id('create-new-dataset')).click();
	     setFormType("iso");
	     formType = getFormType();

	     exposeFormElement(formType, "basic");
	     
             expect(element(by.model('currentRecord.title')).getText()).toEqual('');

	     switchFormPage("west_lon", formType, schemaType);
	     exposeFormElement(formType, "spatialExtent");
	     
             expect(element(by.model('currentRecord.north_lat')).getText()).toEqual('');
             expect(element(by.model('currentRecord.south_lat')).getText()).toEqual('');
             expect(element(by.model('currentRecord.east_lon')).getText()).toEqual('');
             expect(element(by.model('currentRecord.west_lon')).getText()).toEqual('');
         });
    });
}

function attachFileTest(schemaType) {
    
    describe('File attachment', function () {

        beforeEach(function () {

            browser.get('/frontend');
	    setFormType("iso");
            var formType = getFormType();

	    exposeFormElement(formType, "setup");

            if (schemaType === 'iso')
                element(by.id('create-new-dataset')).click();
            else if (schemaType === 'dublin')
                element(by.id('create-new-non-dataset')).click();

	    setFormType(schemaType);
	    formType = getFormType();
	    
        });

        it('should show a new file in the attachments list when file added then ' +
           'remove when deleted and not overwrite any user-entered but not saved data',
           function () {
	       var formType = getFormType();

	       exposeFormElement(formType, "basic");
	       
               element(by.model('currentRecord.title')).sendKeys('¡olé!™');
	       
               // now add a summary that we will check is not overwritten

	       exposeFormElement(formType, "basic");
	       
               element(by.model('currentRecord.summary')).sendKeys('Heyyyy');
	       
               // send keys to give the file name desired
               var fname1 = 'file1.txt',
                   f1 = path.resolve(__dirname, fname1),
                   fname2 = 'file2.nc',
                   f2 = path.resolve(__dirname, fname2);
	       
               // upload 1

	       exposeFormElement(formType, "dataFormats");
	       
               element(by.id('attachment-select')).sendKeys(f1);
               browser.executeScript('window.scrollTo(0,0);');
               element(by.css('[ng-click="attachFile()"]')).click();
	       
               var checkUploadLenIs = function (n) {
                   var uploadList =
                       element.all(by.repeater('att in currentRecord.attachments'));
		   
                   expect(uploadList.count()).toBe(n);
               };
	       
               checkUploadLenIs(1);
	       
               // upload 2
               element(by.id('attachment-select')).sendKeys(f2);
               element(by.id('attach-file-button')).click().then(function() {
		   
                   checkUploadLenIs(2);
                   element(by.id('remove-attachment-1')).click();
                   checkUploadLenIs(1);
		   
                   element(by.id('remove-attachment-0')).click();
                   checkUploadLenIs(0);
		   
               });
           });
    });
}


function testMilesDefaults(schemaType) {
    
    describe('MILES Defaults', function () {

        beforeEach(function() {

            browser.get('/frontend');
	    setFormType("iso");
	    var formType = getFormType();

	    exposeFormElement(formType, "setup");
	    
            if (schemaType === 'iso')
                element(by.id('create-new-dataset')).click();
            else if (schemaType === 'dublin')
                element(by.id('create-new-non-dataset')).click();

	    setFormType(schemaType);
	    formType = getFormType();	    
        }); 

         it('should load the correct fields with correct data', function () {
	     var formType = getFormType();
	     exposeFormElement(formType, "setup");
             element(by.css('[ng-click="loadDefaultMILES()"]')).click();

	     exposeFormElement(formType, "basic");
	     
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
	     
	     switchFormPage("west_lon", formType, schemaType);
	     exposeFormElement(formType, "spatialExtent");
	     
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
         });

         it('should not overwrite fields that are already present in a new record', function () {
	    var formType = getFormType();

             exposeFormElement(formType, "setup");
	     
             element(by.id('create-new-dataset')).click();

	     setFormType("iso");
	     formType = getFormType()

	     exposeFormElement(formType, "basic");
	     
             element(by.model('currentRecord.title')).sendKeys('Record Two');
             element(by.model('currentRecord.summary')).sendKeys('Another record of some other stuff');

             exposeFormElement(formType, "setup");

	     setFormType("iso");
	     formType = getFormType();
	     
	     
             element(by.css('[ng-click="loadDefaultMILES()"]')).click();
	     
	     exposeFormElement(formType, "basic");
	     	     
             expect(element(by.model('currentRecord.title')).getAttribute('value'))
                 .toBe('Record Two');
	     
             expect(element(by.model('currentRecord.summary')).getAttribute('value'))
                 .toBe('Another record of some other stuff');
         });
     });
 }

function getUrl(){
    var url = browser.driver.getCurrentUrl();
    if(url.indexOf("iso") > -1)
	return "iso";
    else if(url.indexOf("dublin") > -1)
	return "dublin";
    else if(url.indexOf("admin") > -1)
	return "admin";
    else
	console.log("Error: unsupported url.");

    return "";
}
 
function testNknAsDistributor(schemaType) {
    
    describe('NKN as distributor', function () {

        beforeEach(function () {
            browser.get('/frontend');
	    setFormType("iso");
	    var formType = getFormType();

	    exposeFormElement(formType, "setup");

            if(schemaType === 'iso'){
                element(by.id('create-new-dataset')).click();
            }else if (schemaType === 'dublin'){
                element(by.id('create-new-non-dataset')).click();
	    }

	    setFormType(schemaType);
	    formType = getFormType();
	    
        });

        it('should fill in the distributor as NKN', function() {
    
	    var formType = getFormType();
	    
	    exposeFormElement(formType, "setup");
	    
            element(by.css('[ng-click="loadDefaultNKNAsDistributor()"]')).click();

	    exposeFormElement(formType, "contacts");
	    
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
	    var formType = getFormType();

	    exposeFormElement(formType, "basic");
	    
            element(by.model('currentRecord.title')).sendKeys('A new record');
            element(by.model('currentRecord.summary')).sendKeys('the summary');

	    exposeFormElement(formType, "setup");
	    	    
            element(by.css('[ng-click="loadDefaultNKNAsDistributor()"]')).click();

	    exposeFormElement(formType, "basic");
	    
            expect(element(by.model('currentRecord.title')).getAttribute('value'))
                .toBe('A new record');

            expect(element(by.model('currentRecord.summary')).getAttribute('value'))
                .toBe('the summary');
        });
    });
}


function testAnimation(schemaType) {

    describe('Scroll though form sections and find the first input in each section after animation', function() {
	
        beforeEach( function () {
	    clearCollection();
            browser.get('/frontend');
	    setFormType("iso");
	    var formType = getFormType();

	    exposeFormElement(formType, "setup");
	    
            if (schemaType === 'iso'){
                element(by.id('create-new-dataset')).click();
            }else if (schemaType === 'dublin'){
                element(by.id('create-new-non-dataset')).click();
	    }
	    
	    setFormType(schemaType);
	    formType = getFormType();

	    //Check spatial extent. If form type is dublin, then navigate to setup page, and add
	    //dublin form section to form list.
	    if(formType.indexOf("dublin") > -1){
		exposeFormElement(formType, "setup");
		element(by.id("add-spatial-extent")).click();
	    }
        });

        afterEach(clearCollection);

        it('should navigate though the form by clicking on the breadcrumb buttons',
           function () {
	       var formType = getFormType();
	       
	       exposeFormElement(formType, "setup");
	       expect(element(by.id("create-new-dataset")).isPresent()).toBe(true);

	       exposeFormElement(formType, "basic");
	       expect(element(by.id("title-input")).isPresent()).toBe(true);

	       exposeFormElement(formType, "temporalExtent");
	       expect(element(by.id("start-date")).isPresent()).toBe(true);

	       exposeFormElement(formType, "spatialExtent");
	       expect(element(by.id("north")).isPresent()).toBe(true);

	       //Check contacts page
	       exposeFormElement(formType, "contacts");
	       expect(element(by.id("citation-contacts")).isPresent()).toBe(true);

	       //Check file upload page
	       exposeFormElement(formType, "dataFormats");
	       expect(element(by.id("format-selector")).isPresent()).toBe(true);

	       exposeFormElement(formType, "onlineResourcesAndRestrictions");
	       expect(element(by.id("online-buttons")).isPresent()).toBe(true);

	       //Check disclaimer page
	       exposeFormElement(formType, "optionsAndDisclaimer");
	       expect(element(by.id("terms-conditions")).isPresent()).toBe(true);

	       //Check review page
	       exposeFormElement(formType, "review");
	       expect(element(by.id("reviewForm")).isPresent()).toBe(true);
	       
	   });

	it('should navigate forwards though the form by clicking on the \"Save and Continue\" button',
           function () {
	       var formType = getFormType();

	       //Click on next button, wait for animation, and then test if first element on that page is present
	       element(by.id("save-continue-button")).click();
	       waitForAnimation("title-input");
	       expect(element(by.id("title-input")).isPresent()).toBe(true);

	       //Click on next button, wait for animation, and test if first element of temporalExtents is present.
	       element(by.id("save-continue-button")).click();
	       //If iso form type, then check 'Detailed Info' next
	       if(formType.indexOf("dublin") == -1){
		   waitForAnimation("research-methods");
		   expect(element(by.id("research-methods")).isPresent()).toBe(true);
		   element(by.id("save-continue-button")).click();
	       }
	       waitForAnimation("start-date");
	       expect(element(by.id("start-date")).isPresent()).toBe(true);
	       
	       //Click on next button, wait for animation, and test if first element of spatialExtent page is present.
	       element(by.id("save-continue-button")).click();
	       waitForAnimation("north");
	       expect(element(by.id("north")).isPresent()).toBe(true);

	       //Click on next button, wait for animation, and test if first element of contacts page is present.
	       element(by.id("save-continue-button")).click();
	       waitForAnimation("citation-contacts");
	       expect(element(by.id("citation-contacts")).isPresent()).toBe(true);

	       //Click on next button, wait for animation, and test if first element of dataFormats page is present.
	       element(by.id("save-continue-button")).click();
	       waitForAnimation("format-selector");
	       expect(element(by.id("format-selector")).isPresent()).toBe(true);

	       //Click on next button, wait for animation, and test if first element of onlineResourcesAndRestriction is present.
	       element(by.id("save-continue-button")).click();
	       waitForAnimation("online-buttons");
	       expect(element(by.id("online-buttons")).isPresent()).toBe(true);

	       //Click on next button, wait for animation, and test if first element of disclaimer page is present.
	       element(by.id("save-continue-button")).click();
	       waitForAnimation("terms-conditions");
	       expect(element(by.id("terms-conditions")).isPresent()).toBe(true);

	       //Click on next button, wait for animation, and test if first element of disclaimer page is present.
	       element(by.id("save-continue-button")).click();
	       waitForAnimation("reviewForm");
	       expect(element(by.id("reviewForm")).isPresent()).toBe(true);
	       
	   });

	it('should navigate backwards though the form by clicking on the \"Back\" button',
           function () {
	       var formType = getFormType();

	       //Click on review page button, wait for animation, and test if first element of review page is present.
	       element(by.id(formType + "review")).click();
	       waitForAnimation("reviewForm");
	       expect(element(by.id("reviewForm")).isPresent()).toBe(true);

	       //Click on back button, wait for animation, and test if first element of disclaimer page is present.
	       element(by.id("back-button")).click();
	       waitForAnimation("terms-conditions");
	       expect(element(by.id("terms-conditions")).isPresent()).toBe(true);

	       //Click on back button, wait for animation, and test if first element of onlineResourcesAndRestriction is present.
	       element(by.id("back-button")).click();
	       waitForAnimation("online-buttons");
	       expect(element(by.id("online-buttons")).isPresent()).toBe(true);

	       //Click on back button, wait for animation, and test if first element of dataFormats page is present.
	       element(by.id("back-button")).click();
	       waitForAnimation("format-selector");
	       expect(element(by.id("format-selector")).isPresent()).toBe(true);

	       //Click on back button, wait for animation, and test if first element of contacts page is present.
	       element(by.id("back-button")).click();
	       waitForAnimation("citation-contacts");
	       expect(element(by.id("citation-contacts")).isPresent()).toBe(true);
	       
	       //Click on back button, wait for animation, and test if first element of spatialExtent page is present.
	       element(by.id("back-button")).click();
	       waitForAnimation("north");
	       expect(element(by.id("north")).isPresent()).toBe(true);
	       
	       //Click on back button, wait for animation, and test if first element of temporalExtent is present.
	       element(by.id("back-button")).click();
	       waitForAnimation("start-date");
	       expect(element(by.id("start-date")).isPresent()).toBe(true);

	       //Click on back button, wait for animation, and then test if first element on that page is present
	       element(by.id("back-button")).click();
	       //If iso form type, then check 'Detailed Info' next
	       if(formType.indexOf("dublin") == -1){
		   waitForAnimation("research-methods");
		   expect(element(by.id("research-methods")).isPresent()).toBe(true);
		   element(by.id("back-button")).click();
	       }

	       waitForAnimation("title-input");
	       expect(element(by.id("title-input")).isPresent()).toBe(true);

	       //Click on back button, wait for animation, and then test if first element on that page is present
	       element(by.id("back-button")).click();
	       waitForAnimation("create-new-dataset");
	       expect(element(by.id("create-new-dataset")).isPresent()).toBe(true);
	    });
    });
}
 
function testDynamicFormAddition(schemaType) {

        describe('Scroll though form sections and find the first input in each section after animation', function() {
	    
            beforeEach( function () {
	    clearCollection();
            browser.get('/frontend');
	    setFormType("iso");
	    var formType = getFormType();

	    exposeFormElement(formType, "setup");
	    
            if (schemaType === 'iso'){
                element(by.id('create-new-dataset')).click();
            }else if (schemaType === 'dublin'){
                element(by.id('create-new-non-dataset')).click();
	    }
	    
	    setFormType(schemaType);
	    formType = getFormType();

        });

        afterEach(clearCollection);

	    it('should not have \'Detailed Info\' section if form type is \'dublin\'',
           function () {
	       var formType = getFormType();
	       if(formType.indexOf("dublin") > -1){
		   expect(element(by.id(formType + "detailed")).isPresent()).toBe(false);
	       }else if(formType.indexOf("dublin") == -1){
		   expect(element(by.id(formType + "detailed")).isPresent()).toBe(true);
	       }
	   });

        it('should add and subtract the spatialExtent form section from the dublin core form, and navigate to the Spatial Exent form and check if the map is present',
           function () {
	       var formType = getFormType();
	       if(formType.indexOf("dublin") > -1){
		   exposeFormElement(formType, "setup");
		   element(by.id("add-spatial-extent")).click();
		   expect(element(by.id(formType + "spatialExtent")).isPresent()).toBe(true);
	       }
	       
	       exposeFormElement(formType, "spatialExtent");
	       expect(element(by.id("north")).isDisplayed()).toBe(true);
	       expect(element(by.id("extent")).isDisplayed()).toBe(true);
	       
	   });
	    
        it('should navigate to the spatialExtents form section and find the map and coordinate inputs',
           function () {
	       var formType = getFormType();
	       
	       //Check spatial extent. If form type is dublin, then navigate to setup page, and add
	       //dublin form section to form list.
	       if(formType.indexOf("dublin") > -1){
		   exposeFormElement(formType, "setup");
		   element(by.id("add-spatial-extent")).click();
	       }
	       
	       exposeFormElement(formType, "spatialExtent");
	       expect(element(by.id("north")).isDisplayed()).toBe(true);
	       expect(element(by.id("extent")).isDisplayed()).toBe(true);

	       //Navigate back to setup form section, click on "A reference system" button, and
	       //check if reference_system input was added to spatialExtents
	       exposeFormElement(formType, "setup");
	       element(by.id("add-coordinate-system")).click();
	       exposeFormElement(formType, "spatialExtent");
	       expect(element(by.id("reference-system-input")).isDisplayed()).toBe(true);

	       //If dublin core form, then navigate back to setup, remove spatial location which should remove map
	       //from spatialExtent, then navigate back to spatialExtent, and check if map is not present and
	       //reference-system-input is still present.
	       if(formType.indexOf("dublin") > -1){
		   exposeFormElement(formType, "setup");
		   element(by.id("add-spatial-extent")).click();

		   //Even though spacial extent was removed, reference-system-input is on spatialExtents, so we keep that
		   //form section, but make map not visible.
		   expect(element(by.id(formType + "spatialExtent")).isPresent()).toBe(true);

		   //Click on spatialExtents button, and wait for "reference-system-input" to appear. Can't use
		   //exposeFormElement() here because the usual form element for Spatial Extent (id="north") is not present anymore.
		   element(by.id(formType + "spatialExtent")).click();
		   waitForAnimation("reference-system-input");
		   expect(element(by.id("north")).isDisplayed()).toBe(false);
		   expect(element(by.id("extent")).isDisplayed()).toBe(false);
		   expect(element(by.id("reference-system-input")).isDisplayed()).toBe(true);

		   exposeFormElement(formType, "setup");
		   element(by.id("add-coordinate-system")).click();
		   expect(element(by.id(formType + "spatialExtent")).isPresent()).toBe(false);

		   //Now check if adding coordinate system add spatialExtent, and only adds reference-system-input
		   //and not the map to the form element
		   exposeFormElement(formType, "setup");
		   element(by.id("add-coordinate-system")).click();
		   expect(element(by.id(formType + "spatialExtent")).isPresent()).toBe(true);

		   //Click on spatialExtents button, and wait for "reference-system-input" to appear. Can't use
		   //exposeFormElement() here because the usual form element for Spatial Extent (id="north") is not present anymore.
		   element(by.id(formType + "spatialExtent")).click();
		   waitForAnimation("reference-system-input");
		   expect(element(by.id("north")).isDisplayed()).toBe(false);
		   expect(element(by.id("extent")).isDisplayed()).toBe(false);
		   expect(element(by.id("reference-system-input")).isDisplayed()).toBe(true);
	       }
	       
	   });
	});
}

function testReviewSection(schemaType) {

        describe('Fill out the form, then test the text on the review page against the original input', function() {

        var newRecord = {

            title: 'Record One',
            summary: 'A good dataset',
            last_mod_date: {$date: new Date(2002, 0, 1),
			    input: '01/01/2002'},
            first_pub_date: {$date: new Date(2006, 1, 4),
			     input: '02/04/2006'},

            place_keywords: 'Idaho, Treasure Valley',
            thematic_keywords: 'Agriculture, Water',

            data_format: ['netCDF'],
	    data_format_aux: 'mp4',
            online: ['http://example.com/mynetcdfs/33422525'],
            use_restrictions: 'None',
	    spatial_dtype: 'vector',
	    
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
	    
            west_lon: '-116.1',
            east_lon: '-110.6',
            north_lat: '46.5',
            south_lat: '35.4',

	    status: 'completed',
	    update_frequency: 'daily',
	    hierarchy_level: 'dataset',

	    research_methods: 'Observational research, correlational research, stratified sampling',
	    compression_technique: 'zip, jar',
	    reference_system: 'UTM, NAD83',
	    
            start_date: {$date: new Date(2009, 2, 6),
			 input: '03/06/2009'},
            end_date: {$date: new Date(2012, 3, 8),
		       input: '04/08/2012'}
        };


        if (schemaType === 'iso')
        {
            var isoFields = {
                status: 'stored in an offline facility',
                spatial_dtype: 'grid',
                hierarchy_level: 'dataset',
                topic_category: ['biota', 'economy'],
                compression_technique: 'zlib'
            };

            for (var field in isoFields)
            {
                newRecord[field] = isoFields[field];
            }
        }

            beforeEach( function () {
		clearCollection();
		browser.get('/frontend');
		setFormType("iso");
		var formType = getFormType();
		
		exposeFormElement(formType, "setup");
		
		if (schemaType === 'iso'){
                    element(by.id('create-new-dataset')).click();
		}else if (schemaType === 'dublin'){
                    element(by.id('create-new-non-dataset')).click();
		}
	    
		setFormType(schemaType);
		formType = getFormType();

		if(formType.indexOf("dublin") > -1){
		    exposeFormElement(formType, "setup");
		    element(by.id("add-spatial-extent")).click();
		}

		//Add reference system input to Spatial Extents section
		exposeFormElement(formType, "setup");
		element(by.id("add-coordinate-system")).click();
		
	    });

        afterEach(clearCollection);

        it('should complete the form, then test the review page against the input',
           function () {
	       var formType = getFormType();
	       exposeFormElement(formType, "basic");
	       element(by.model('currentRecord.title')).sendKeys(newRecord.title);
	       element(by.model('currentRecord.summary')).sendKeys(newRecord.summary);
	       element(by.model('currentRecord.place_keywords')).sendKeys(newRecord.place_keywords);
	       element(by.model('currentRecord.thematic_keywords')).sendKeys(newRecord.thematic_keywords);
	       if((typeof newRecord.topic_category !== 'undefined')
		 && (newRecord.topic_category.length > 0)){
			//Click on select menu to expose options
			for(var i = 0; i < newRecord.topic_category.length; i++) 
				element(by.css('[label="' + newRecord.topic_category[i] + '"]')).click();
		}

	       //If iso form type, then fill out detailed info page too
	       if(formType.indexOf('dublin') == -1){
		   exposeFormElement(formType, "detailed");
		   element(by.model('currentRecord.research_methods')).sendKeys(newRecord.research_methods);
	       }
	       
	       exposeFormElement(formType, "onlineResourcesAndRestrictions");
	       element(by.id('online')).sendKeys(newRecord.online[0]);
	       element(by.model('currentRecord.use_restrictions')).sendKeys(newRecord.use_restrictions);
	       
	       exposeFormElement(formType, "temporalExtent");
	       element(by.id('start-date')).clear().sendKeys(newRecord.start_date.input).sendKeys(protractor.Key.TAB);;
	       element(by.id('end-date')).clear().sendKeys(newRecord.end_date.input).sendKeys(protractor.Key.TAB);;
	       element(by.id('first-pub-date-input')).clear().sendKeys(newRecord.first_pub_date.input).sendKeys(protractor.Key.TAB);;
	       
	       //If not dubin form, then form is 'iso' type, and check extra form fields in this seciton
	       if(formType.indexOf("dublin") == -1){
		   element(by.model('currentRecord.status')).sendKeys(newRecord.status);
		   element(by.model('currentRecord.update_frequency')).sendKeys(newRecord.update_frequency);
		   element(by.model('currentRecord.hierarchy_level')).sendKeys(newRecord.hierarchy_level);		   
	       }

	       //Fill out contacts
	       exposeFormElement(formType, "contacts");
	       
	       var addCitationButton =
                   element(by.css('[ng-click="addContactCitation()"]'));
	       
               var citationContacts =
                   element.all(by.repeater('contact in currentRecord.citation'));
	       
               var accessContacts =
                   element.all(by.repeater('contact in currentRecord.access'));
	       
               for (var i = 0; i < 2; i++){
                   var c = newRecord.citation[i];
                   var contactFieldIdx = 0;
                   for (var k in c){
                       element(by.id('citation-' + k + '-' + i)).sendKeys(c[k]);
		       
                   }
                   if (i === 0){
                       addCitationButton.click();
                   }
               }
	       
               var ca = newRecord.access[0];
               for (var ka in ca){
                   element(by.id('access-' + ka + '-0')).sendKeys(ca[ka]);
               }
	       

	       //Check file upload page
	       exposeFormElement(formType, "dataFormats");
	       element(by.model('dataFormats.iso')).sendKeys(newRecord.data_format[0]);
	       element(by.model('dataFormats.aux')).sendKeys(newRecord.data_format_aux);

	       //Attach file
	       // send keys to give the file name desired
               var fname1 = 'file1.txt',
                   f1 = path.resolve(__dirname, fname1),
                   fname2 = 'file2.nc',
                   f2 = path.resolve(__dirname, fname2);
	       
               // upload 1

               element(by.id('attachment-select')).sendKeys(f1);
               browser.executeScript('window.scrollTo(0,0);');
               element(by.css('[ng-click="attachFile()"]')).click();
	       
	       //If not dublin form type, then send keys to exta form elements in 'iso' type
	       if(formType.indexOf("dublin") == -1){
		   element(by.model('currentRecord.spatial_dtype')).sendKeys(newRecord.spatial_dtype);
		   element(by.model('currentRecord.compression_technique')).sendKeys(newRecord.compression_technique);
	       }
	       
	       exposeFormElement(formType, "spatialExtent");
	       element(by.model('currentRecord.east_lon')).sendKeys(newRecord.east_lon);
	       element(by.model('currentRecord.west_lon')).sendKeys(newRecord.west_lon);
	       element(by.model('currentRecord.north_lat')).sendKeys(newRecord.north_lat);
	       element(by.model('currentRecord.south_lat')).sendKeys(newRecord.south_lat);

	       element(by.model('currentRecord.reference_system')).sendKeys(newRecord.reference_system);
	       
	       //Check disclaimer page
	       exposeFormElement(formType, "optionsAndDisclaimer");
	       element(by.id('data-one-checkbox')).click();

	       //Check review page
	       exposeFormElement(formType, "review");

	       //Check all parts of the form except _cls, _id, access, citation, last_mod_date, dataFormats.aux, and data_formats_aux
	       //dataFormats.aux gets added on to data_format, so we need to do the same before checking data_format. Also, last_mod_date is
	       //set on the last time the record was saved, so hard to check that. access and citation are checked later since they are arrays of objects.
	       for(var key in newRecord){
		   if((key.indexOf("_cls") == -1)
		      && (key.indexOf("_id") == -1)
		      && (key.indexOf("access") == -1)
		      && (key.indexOf("citation") == -1)
		      && (key.indexOf("last_mod_date") == -1)
		      && (key.indexOf("dataFormats.aux") == -1)
		      && (key.indexOf("data_format_aux") == -1)){
		       //Compare values
		       //spatial_dtype is not in dublin, so skip if form type is dublin
  		       if((formType.indexOf("dublin") > -1)
			  && ((key.indexOf("spatial_dtype") > -1)
			      || (key.indexOf("status") > -1)
			      || (key.indexOf("update_frequency") > -1)
			      || (key.indexOf("hierarchy_level") > -1)
			      || (key.indexOf("research_methods") > -1)
			      || (key.indexOf("compression_technique") > -1))){
			   //Do nothing: dubin core form does not have any of these values
		       }else{
			   //If record element is "data_format", then add the extra data formats from the text input below the select box to value being compared.
			   //In services.js this is done automatically, so need to have same behavior here to test.
			   if(key.indexOf("data_format") > -1){
			       expect(element(by.id(key + '-1')).getText()).toEqual(parseKeyValues(newRecord[key]) + ", " + newRecord["data_format_aux"]);
			   }
			   //If record element is any date format, then get date object from newRecord, and convert it to string.
			   else if((key.indexOf("start_date") > -1)
				   || (key.indexOf("end_date") > -1)
				   || (key.indexOf("first_pub_date") > -1)
				   || (key.indexOf("last_mod_date") > -1)){
			       expect(element(by.id(key + '-1')).getText()).toEqual(parseKeyValues((newRecord[key].$date).toString()));
			   }
			   //If record element is any spatial point, then send though compareBbox function to check if number input is within 0.000001
			   //because protractor is adding extra decimal points for some reason.
			   else if((key.indexOf("west_lon") > -1)
				   || (key.indexOf("east_lon") > -1)
				   || (key.indexOf("south_lat") > -1)
				   || (key.indexOf("north_lat") > -1)){
			       compareBbox(key, newRecord);
			   }
			   //Otherwise, then just compare value in review.html results table to value in newRecord.
			   else{
			       	expect(element(by.id(key + '-1')).getText()).toEqual(parseKeyValues(newRecord[key]));
		           }
		       }
		   }
	       }

	       //Check access contact information
	       for(var i = 0; i < newRecord.access.length; i++){
		   for(var key in newRecord.access[i]){
		       expect(element(by.id("access" + "-" + i + "-" + key + '-1')).getText()).toEqual(parseKeyValues(newRecord.access[i][key]));
		   }
	       }

	       //Check citation contact information
	       for(var i = 0; i < newRecord.citation.length; i++){
		   for(var key in newRecord.citation[i]){
		       expect(element(by.id("citation" + "-" + i + "-" + key + '-1')).getText()).toEqual(parseKeyValues(newRecord.citation[i][key]));
		   }
	       }
	       
	   });
	    
	});
}

function testAdminView(schemaType) {

    describe('Test that non-admin user cannot access admin view.', function() {
	
        beforeEach( function () {
	    clearCollection();
	    browser.get('/frontend');
	    setFormType("iso");
	    var formType = getFormType();

	    exposeFormElement(formType, "setup");
	    
            if (schemaType === 'iso'){
                element(by.id('create-new-dataset')).click();
            }else if (schemaType === 'dublin'){
                element(by.id('create-new-non-dataset')).click();
	    }else if(schemaType.indexOf('admin') > -1){
		browser.get('frontend/#/admin');
	    }
	    
	    setFormType(schemaType);
	    formType = getFormType();

        });
	
        afterEach(clearCollection);
	
	it('the admin view button should not be clickable from /iso or /dublin paths, but should be visible on /admin',
           function () {
	       var formType = getFormType();
	       if(formType.indexOf("admin") == -1)
		   expect(element(by.id("admin-view-button")).isDisplayed()).toBe(false);
	   });

    });
}

function compareBbox(dir, newRecord) {
    var valPromise = element(by.id(dir + '-1')).getText();
    valPromise.then(el => {
	
        var val = parseFloat(el);
        expect(val - newRecord[dir])
            .toBeLessThan(0.000001);
    });
}

function parseKeyValues(value){
    
    if((Array.isArray(value))
       && (typeof value[0] === 'string')){
	return value.join(', ');
    }

    //If input value is the attachment url, get file name out of url (file name is from last "/" character to end of string.
    //Unless the user uses Mac's ability to name files with a "/" character.
    if(Array.isArray(value)){
	if(typeof value[0] === 'object'){
	    var completeValue = "";
	    for(var i = 0; i < value.length; i++){
		for(var key in value[i]){
		    if(key.indexOf("id") == -1)
			if(key.indexOf("url") > -1){
			    //Get name of file, which has been added on to end of URL.
			    //Get text from last "/" character.
			    completeValue = completeValue + value[i][key].substr(value[i][key].lastIndexOf("/")+1) + ", ";
			}
		}
	    }
	    return completeValue;
	}
    }

    if(typeof value === 'object'){
	var completeValue = "";
	for(var key in value){
	    if(key.indexOf("$oid") > -1)
		return "";
	    if(key.indexOf("$date") > -1)
		completeValue = completeValue + value[key];
	    else
		completeValue = completeValue + key + " : " + value[key] + " | ";
	}
	return completeValue;
    }
    
    if(typeof value === 'number'){
	return value.toString();
    }else if(value != null){
	var response = checkLength(value);
	return response;
    }else{
	var response = checkNull(value);
	return response;
    }
}

function translateKey(key){
    key = key + "";
    var delimString = key.split("_");
    var parsedString = "";
    for(var i = 0; i < delimString.length; i++){
	switch(delimString[i]){
	case "true":
	    parsedString = parsedString + "Yes ";
	    break;
	case "false":
	    parsedString = parsedString + "No ";
	    break;
	default:
	    parsedString = parsedString + delimString[i];
	}
    }
    return parsedString;
};


function checkLength(fieldName){
    if(fieldName.length > 0)
	return translateKey(fieldName);
    
    return "";
};

// Check if variable is null. If so, return empty string.
function checkNull(fieldName){
    if(fieldName != null)
	return translateKey(fieldName);
    
    return "";
};



//Click on form button (breadcrumb button ids are the name of their states in app.js)
//for specific form section and wait for scroll animation to finish before proceding.
function exposeFormElement(formType, pageName){
    element(by.id(formType + pageName)).click();

    //Wait for element present on selected page before trying to access elements: otherwise
    //tests will try an access elements before animation has finished and test will have errors.
    switch(pageName){
    case "setup":
	waitForAnimation("create-new-dataset");
	break;
    case "basic":
	waitForAnimation("title-input");
	break;
    case "detailed":
	waitForAnimation("research-methods");
	break;
    case "dataFormats":
	waitForAnimation("format-selector");
	break;
    case "onlineResourcesAndRestrictions":
	waitForAnimation("online-buttons");
	break;
    case "temporalExtent":
	waitForAnimation("start-date");
	break;
    case "spatialExtent":
	waitForAnimation("north");
	break;
    case "contacts":
	waitForAnimation("citation-contacts");
	break;
    case "optionsAndDisclaimer":
	waitForAnimation("terms-conditions");	
	break;
    case "review":
	waitForAnimation("reviewForm");
	break;
    default:
	break;
	
    }
}

function switchFormPage(key, formType, schemaType){
    switch(key){
    case "title":
    case "summary":
    case "place_keywords":
    case "thematic_keywords":
    case "topic_category":
	element(by.id(formType + "basic")).click();
	waitForAnimation("title-input");
	break;
	
    case "data_format":
    case "compression_technique":
    case "attachments":
    case "spatial_dtype":
	element(by.id(formType + "dataFormats")).click();
	waitForAnimation("format-selector");
	break;

    case "online":
    case "use_restrictions":
	element(by.id(formType + "onlineResourcesAndRestrictions")).click();
	waitForAnimation("online-buttons");
	break;
	
    case "research_methods":
	element(by.id(formType + "detailed")).click();
	waitForAnimation("research-methods");
	break;
	
    case "start_date":
    case "end_date":
    case "last_mod_date":
    case "status":
    case "update_frequency":
    case "hierarchy_level":
	element(by.id(formType + "temporalExtent")).click();
	waitForAnimation("start-date");
	break;
	
    case "west_lon":
    case "east_lon":
    case "north_lat":
    case "south_lat":
	if(schemaType === 'dublin'){
	    //Check if "Spatial Extent" page was already added to dublin form. If not,
	    //navigate back to first page and add it.
	    element(by.id("dublinForm.spatialExtent")).isPresent().then(function(result){
		if(!result){
		    element(by.id(formType + "setup")).click();
		    waitForAnimation("add-spatial-extent");
		    
		    element(by.id("add-spatial-extent")).click();
		}
	    });
	}
	
	element(by.id(formType + "spatialExtent")).click();
	waitForAnimation("north");
	break;
    case "citation":
    case "access":
	element(by.id(formType + "contacts")).click();
	waitForAnimation("citation-contacts");
	break;
    case "doi_ark_request":
    case "data_one_search":
	element(by.id(formType + "optionsAndDisclaimer")).click();
	waitForAnimation("terms-conditions");
	
    default:
	break;
    }
}

//function testExportISO(schemaType) {
    //describe('Export ISO', function () {

        //beforeEach(function() {

            //browser.get('/frontend');

            //element(by.id('record-options-dropdown')).click();
            //if (schemaType === 'iso')
                //element(by.id('create-new-dataset')).click();
            //else if (schemaType === 'dublin')
                //element(by.id('create-new-non-dataset')).click();
        //});


         //afterEach(() => {
             //clearCollection();
         //});

         //it('should open a new window properly', function () {

             //element(by.model('currentRecord.title')).sendKeys('¡Pollo Loco!');
             //element(by.model('currentRecord.summary')).sendKeys('The craziest tasting Chicken!');

             //element(by.id('record-options-dropdown')).click().then( () =>
                 //element(by.css('[ng-click="submitDraftRecord()"')).click()
             //);

             //element(by.id('export-dropdown')).click();
             //element(by.css('[ng-click="export_(\'iso\')"]')).click();

             //// TODO fix this to actually test export works.
             //// for now we are just testing whether or not the button is
             //// clickable without error
             ////browser.pause();
             ////expect(browser.driver.getCurrentUrl()).toMatch(/iso/);
         //});
        //});

        //describe('Export options should show after a record has been saved', function () {
         //it('\'Export as...\' should be visible', function () {
             ////browser.get('/frontend/index.html');

              //element(by.model('currentRecord.title')).sendKeys('¡Pollo Loco!');
             //element(by.model('currentRecord.summary')).sendKeys('The craziest tasting Chicken!');

             //element(by.id('record-options-dropdown')).click().then( () => {
                 //element(by.css('[ng-click="submitDraftRecord()"')).click();
                 //expect(element(by.id('export-dropdown')).isDisplayed()).toBeTruthy();
             //});
         //});
    //});
//}

