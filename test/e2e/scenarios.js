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


testNknAsDistributor('iso');
testNknAsDistributor('dublin');


/* XXX perhaps issue w/ webdriver version, but testExportISO is getting stuck */

//testExportISO('iso');
//testExportISO('dublin');

testLoadDeleteDropdown('iso');
testLoadDeleteDropdown('dublin');

testMilesDefaults('iso');
testMilesDefaults('dublin');

deleteRecordTest('iso');
deleteRecordTest('dublin');

attachFileTest('iso');
attachFileTest('dublin');

contactsTest();


describe('ISO and Dublin Core editing views', function () {

     it('should go to #/dublin when the dublin core button is pressed', function () {

         browser.get('/frontend/index.html');

	 setFormType("iso");
	 var formType = getFormType();
	 
	 
	 element(by.id(formType + 'setup')).click();
	 waitForAnimation('create-new-non-dataset');
	 
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
    browser.wait(isClickable, 3000);
}

function waitForAnimationCSS(item) {
    var EC = protractor.ExpectedConditions;
    var itemID = element(by.css(item));
    var isClickable = EC.elementToBeClickable(itemID);
    browser.wait(isClickable, 3000);
}

function contactsTest() {

    describe('Adding and removing contacts using buttons', function () {
	
        var addRemoveContacts = function () {
	    var formType = getFormType();

            element.all(by.css('.contact-input')).sendKeys('aaaaa');
            element.all(by.css('.contact-email')).sendKeys('a@aaaa.com');

	    element(by.id(formType + "contacts")).click();
	    waitForAnimationCSS('[ng-click="addContactAccess()"]');
	    
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

               
	       element(by.id(formType + 'setup')).click();
	       waitForAnimation('create-new-dataset');
	       element(by.id('create-new-dataset')).click();
	       setFormType("iso");
	       formType = getFormType();
	       
	       addRemoveContacts();
	       
	       
	       element(by.id(formType + 'setup')).click();
	       waitForAnimation("create-new-non-dataset");
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
	    var completeForm = "";
	    var formType = getFormType();

	    completeForm = formType + "setup";
	    element(by.id(completeForm)).click();
	    
            if (schemaType === 'iso'){
		waitForAnimation('create-new-dataset');
                element(by.id('create-new-dataset')).click();
            }else if (schemaType === 'dublin'){
		waitForAnimation('create-new-non-dataset');
                element(by.id('create-new-non-dataset')).click();
	    }
	    
	    setFormType(schemaType);
	    formType = getFormType();
	    
	    completeForm = formType + "basic";
	    element(by.id(completeForm)).click();
	    waitForAnimation('title-input');
	    
            element(by.model('currentRecord.title')).sendKeys('¡Pollo Loco!');
            element(by.model('currentRecord.summary')).sendKeys('mmmm....chicken');

	    //Automatically saves when changing states, so change back to first state of form.
	    element(by.id(formType + 'basic')).click();
	    waitForAnimation("title-input");
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

	    element(by.id(formType + 'basic')).click();
	    waitForAnimation("title-input");
	    
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
	    
	    element(by.id(formType + 'setup')).click();
	    waitForAnimation('create-new-dataset');
	    
            element(by.id('create-new-dataset')).click();
	    setFormType("iso");
	    formType = getFormType();

	    //Go to basic information state
	    
	    element(by.id(formType + 'basic')).click();
	    waitForAnimation('title-input');
	    
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
	    
	    //element(by.id(formType + 'basic')).click();
	    //waitForAnimation("title-input");
            expect(element(by.model('currentRecord.title')).getAttribute('value'))
                .toEqual('KFC');
            expect(element(by.model('currentRecord.summary')).getAttribute('value'))
                .toEqual(summary);
        });
    });
}

function setFormType(type) {
    form = type;
}

function getFormType(){

    if(form == "iso")
	return "form.";
    else if(form == "dublin")
	return "dublinForm.";
    else{
	console.log("Error: tried to set form to unsupported from type.");
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
			
		element(by.id(formType + 'setup')).click();
		waitForAnimation('create-new-dataset');
		
                element(by.id('create-new-dataset')).click();
            }else if (schemaType === 'dublin'){
		
		element(by.id(formType + 'setup')).click();
		waitForAnimation("create-new-non-dataset");
                element(by.id('create-new-non-dataset')).click();
	    }
	    
	    setFormType(schemaType);
	    formType = getFormType();
	    
            // add data to contacts

	    //Change to contacts form element
	    
	    element(by.id(formType + 'contacts')).click();
	    waitForAnimationCSS('[ng-click="addContactCitation()"]');
	    
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

	    element(by.id(formType + "dataFormats")).click();
	    waitForAnimation("format-selector");
	    
            element(by.css('[label="netCDF"]')).click();
	    //Save the record by switching pages
	    element(by.id(formType + "review")).click();
            if (schemaType === 'iso')
            {
		
		element(by.id(formType + 'temporalExtent')).click();
		waitForAnimation("start-date");
                //element(by.model('currentRecord.start_date.$date')).sendKeys('01-01-2002');
                element(by.id('start-date')).clear().sendKeys('01/01/2002').sendKeys(protractor.Key.TAB);
                // search.sendKeys(protractor.Key.TAB);
                element(by.id('end-date')).clear().sendKeys('12/31/2012').sendKeys(protractor.Key.TAB);

		//Save the record by changing the page
		element(by.id(formType + 'review')).click();
            }
        });

        afterEach(clearCollection);

         it('should have two citation contacts and one access contact from beforeEach', function () {
	    var formType = getFormType();

	     
	     element(by.id(formType + 'contacts')).click();
	     waitForAnimation("citation-contacts");
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
	    
	    element(by.id(formType + 'contacts')).click();
	    waitForAnimation("citation-contacts");
	    
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
	    element(by.id(formType + 'spatialExtent')).click();
	    waitForAnimation("north");
	    
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
		
		element(by.id(formType + 'temporalExtent')).click();
		waitForAnimation("start-date");
		
                expect(element(by.model('currentRecord.start_date.$date')).getAttribute('value'))
                    .toEqual('01/01/2002');

                expect(element(by.model('currentRecord.end_date.$date')).getAttribute('value'))
                    .toEqual('12/31/2012');
            }

            // check the rest

	    element(by.id(formType + 'dataFormats')).click();
	    waitForAnimation("format-selector");
	    
            expect(element(by.id('format-selector')).getAttribute('value'))
                .toEqual('string:netCDF');
	    
	    element(by.id(formType + 'review')).click();
        });

         it('should clear any information that has been input when creating a new record', function () {
	     var formType = getFormType();

             
	     element(by.id(formType + 'setup')).click();
	     waitForAnimation("create-new-dataset");
	     
             element(by.id('create-new-dataset')).click();
	     setFormType("iso");
	     formType = getFormType();
	     
	     element(by.id(formType + 'basic')).click();
	     waitForAnimation("title-input");
	     
             element(by.model('currentRecord.title')).sendKeys('Record Two');
             element(by.model('currentRecord.summary')).sendKeys('Another record of some other stuff');

	     switchFormPage("west_lon", formType, schemaType);
	     element(by.id(formType + 'spatialExtent')).click();
	     waitForAnimation("north");
	     
             element(by.model('currentRecord.north_lat')).sendKeys('46.8');
             element(by.model('currentRecord.south_lat')).sendKeys('35.5');
             element(by.model('currentRecord.east_lon')).sendKeys('-115.0');
             element(by.model('currentRecord.west_lon')).sendKeys('-120.0');

	     //Save form by clicking on "Basic Information" page. Auto saves when switching between pages
             
	     element(by.id(formType + 'basic')).click();
	     waitForAnimation("title-input");
	     
	     
	     //Might need to click on prerequisite states before this
             var recordListElements = element.all(by.css('.record-list-actions'));

             expect(recordListElements.count()).toEqual(2);
	     
	     element(by.id(formType + 'setup')).click();

	     //Have to wait here because of animation
	     waitForAnimation("create-new-dataset");
	     
             element(by.id('create-new-dataset')).click();
	     setFormType("iso");
	     formType = getFormType();

	     
	     element(by.id(formType + 'basic')).click();
	     waitForAnimation("title-input");
	     
             expect(element(by.model('currentRecord.title')).getText()).toEqual('');

	     switchFormPage("west_lon", formType, schemaType);
	     element(by.id(formType + 'spatialExtent')).click();
	     waitForAnimation("north");
	     
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
	    
	    element(by.id(formType + 'setup')).click();
	    waitForAnimation("create-new-dataset");
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

	       
	       element(by.id(formType + 'basic')).click();
	       waitForAnimation("title-input");
	       
               element(by.model('currentRecord.title')).sendKeys('¡olé!™');
	       
	       //Automatically saves when form changes states (pages)
               
	       //element(by.id(formType + 'setup')).click();
	       //waitForAnimation("create-new-dataset");

	       //setFormType("iso");
	       //formType = getFormType();

               // now add a summary that we will check is not overwritten
               
	       element(by.id(formType + 'basic')).click();
	       waitForAnimation("title-input");
	       
               element(by.model('currentRecord.summary')).sendKeys('Heyyyy');
	       
               // send keys to give the file name desired
               var fname1 = 'file1.txt',
                   f1 = path.resolve(__dirname, fname1),
                   fname2 = 'file2.nc',
                   f2 = path.resolve(__dirname, fname2);
	       
               // upload 1
	       
	       element(by.id(formType + 'dataFormats')).click();
	       waitForAnimation("format-selector");
	       
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
           
	    element(by.id(formType + 'setup')).click();
	    waitForAnimation("create-new-dataset");
	    
            if (schemaType === 'iso')
                element(by.id('create-new-dataset')).click();
            else if (schemaType === 'dublin')
                element(by.id('create-new-non-dataset')).click();

	    setFormType(schemaType);
	    formType = getFormType();	    
        }); 

         it('should load the correct fields with correct data', function () {
	     var formType = getFormType();
	     element(by.id(formType + "setup")).click();
	     waitForAnimationCSS('[ng-click="loadDefaultMILES()"]');
             element(by.css('[ng-click="loadDefaultMILES()"]')).click();
	     
	     element(by.id(formType + 'basic')).click();
	     waitForAnimation("title-input");
	     
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
	     element(by.id(formType + 'spatialExtent')).click();
	     waitForAnimation("north");
	     
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
	                  
	     element(by.id(formType + 'setup')).click();
	     waitForAnimation('create-new-dataset');
	     
             element(by.id('create-new-dataset')).click();

	     setFormType("iso");
	     formType = getFormType()
	     
	     element(by.id(formType + 'basic')).click();
	     waitForAnimation("title-input");
	     
             element(by.model('currentRecord.title')).sendKeys('Record Two');
             element(by.model('currentRecord.summary')).sendKeys('Another record of some other stuff');

             
	     element(by.id(formType + 'setup')).click();
	     waitForAnimation("create-new-dataset");
	     setFormType("iso");
	     formType = getFormType();
	     
	     
             element(by.css('[ng-click="loadDefaultMILES()"]')).click();
	     
	     
	     element(by.id(formType + 'basic')).click();
	     waitForAnimation("title-input");
	     	     
             expect(element(by.model('currentRecord.title')).getAttribute('value'))
                 .toBe('Record Two');
	     
             expect(element(by.model('currentRecord.summary')).getAttribute('value'))
                 .toBe('Another record of some other stuff');
         });
     });
 }

function getUrl(){
    var url = browser.driver.getCurrentUrl();
    if(url.includes("iso"))
	return "iso";
    else if(url.includes("dublin"))
	return "dublin";
    else
	console.log("Error: unsupported url.");

    return "";
}
 
function testNknAsDistributor(schemaType) {
    
    describe('NKN as distributor', function () {

        beforeEach(function () {
            browser.get('/frontend');
	    setFormType("iso");
	    var completeForm = "";
	    var formType = getFormType();

            completeForm = formType + "setup";
	    console.log("Printing formType in testNknAsDistributor <<<<<<<<<<<<<<<<<VVVVVVVVVVVVVVVVVVVVVVVVVVVVV>>>>>>>>>>>>>>>>>>>>>>>>>>>> " + completeForm);
	    element(by.id(completeForm)).click();
	    waitForAnimation("create-new-dataset");
            if(schemaType === 'iso'){
		//element(by.id(completeForm)).click();
		
                element(by.id('create-new-dataset')).click();
            }else if (schemaType === 'dublin'){
		//element(by.id(completeForm)).click();
                element(by.id('create-new-non-dataset')).click();

	    }

	    setFormType(schemaType);
	    formType = getFormType();
	    
        });

        it('should fill in the distributor as NKN', function() {
    
	    var formType = getFormType();
	    var completeForm = "";
	    
	    completeForm = formType + "setup";
	    element(by.id(completeForm)).click();
	    waitForAnimationCSS('[ng-click="loadDefaultNKNAsDistributor()"]');
	    
            element(by.css('[ng-click="loadDefaultNKNAsDistributor()"]')).click();

            completeForm = formType + "contacts";
	    element(by.id(completeForm)).click();
	    waitForAnimation("citation-contacts");
	    
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
	    var completeForm = "";
	    
	    element(by.id(formType + "basic")).click();
	    waitForAnimation("title-input");
	    
            element(by.model('currentRecord.title')).sendKeys('A new record');
            element(by.model('currentRecord.summary')).sendKeys('the summary');
	    
	    element(by.id(formType + "setup")).click();
	    waitForAnimationCSS('[ng-click="loadDefaultNKNAsDistributor()"]');
	    	    
            element(by.css('[ng-click="loadDefaultNKNAsDistributor()"]')).click();
	    
	    element(by.id(formType + "basic")).click();
	    waitForAnimation("title-input");
	    
            expect(element(by.model('currentRecord.title')).getAttribute('value'))
                .toBe('A new record');

            expect(element(by.model('currentRecord.summary')).getAttribute('value'))
                .toBe('the summary');
        });
    });
}

function switchFormPage(key, formType, schemaType){
    switch(key){
    case "title":
    case "summary":
    case "last_mod_date":
    case "place_keywords":
    case "thematic_keywords":
    case "topic_category":
	element(by.id(formType + "basic")).click();
	waitForAnimation("title-input");
	break;
	
    case "status":
    case "update_frequency":
    case "spatial_dtype":
    case "hierarchy_level":
	element(by.id(formType + "detailed")).click();
	waitForAnimation("dataset-status");
	break;

    case "data_format":
    case "compression_technique":
    case "attachments":
	element(by.id(formType + "dataFormats")).click();
	waitForAnimation("format-selector");
	break;

    case "online":
    case "use_restrictions":
	element(by.id(formType + "onlineResourcesAndRestrictions")).click();
	waitForAnimation("online-buttons");
	break;

    case "start_date":
    case "end_date":
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

