'use strict';

var testScope = {
    currentRecord: {
        title: 'Fernan Lake Data 2010 - 2011',
        description: 'Limnology data',

    }
};


describe('createNewRecord', function() {

    beforeEach(module('metadataEditor'));

    var recordService, emptyContact, testCtrl;

    beforeEach(
        inject(function($injector, $controller) {
            recordService = $injector.get('recordService');
            testCtrl = $controller('BaseController', {$scope: testScope});
        })
    );

    it('should clear all data in scope and replace with blanks or placeholder dates',
        function () {
            // even though testScope had a title and description,
            // createNewRecord is called on creation of the BaseController
            expect(testScope.currentRecord.title).toEqual('');

            testScope.currentRecord.title = 'new title';

            testScope.currentRecord.last_mod_date.$date = new Date(2014, 1, 1);
            testScope.currentRecord.start_date.$date = new Date(2014, 4, 2);

            testScope.currentRecord.end_date.$date = new Date(2015, 1, 1);
            testScope.currentRecord.first_pub_date.$date = new Date(2013, 4, 2);


            expect(testScope.currentRecord.last_mod_date.$date)
                .toEqual(new Date(2014, 1, 1));

            expect(testScope.currentRecord.start_date.$date)
                .toEqual(new Date(2014, 4, 2));

            expect(testScope.currentRecord.end_date.$date)
                .toEqual(new Date(2015, 1, 1));

            expect(testScope.currentRecord.first_pub_date.$date)
                .toEqual(new Date(2013, 4, 2));

            expect(testScope.currentRecord.title).toEqual('new title');

            testScope.createNewRecord();

            // createNewRecord has cleared all fields that had been assigned
            expect(testScope.currentRecord.title).toEqual('');

            expect(testScope.currentRecord.start_date.$date).toEqual('');

            expect(testScope.currentRecord.last_mod_date.$date.getTime() -
                   new Date().getTime() < 100)
                .toBeTruthy();

            expect(testScope.currentRecord.end_date.$date).toEqual('');

            expect(testScope.currentRecord.first_pub_date.$date).toEqual('');
        }
    );
});

describe('MILES defaults', function() {
    it('MILES defaults should only replace fields that it contains',
        function () {

        testScope.currentRecord.title = 'Fernan Lake Data';
        testScope.currentRecord.description = 'Limnology variables observed 2001 - 2003';
        testScope.currentRecord.start_date.$date = new Date(2001, 9, 1);
        testScope.currentRecord.end_date.$date = new Date(2003, 8, 30);

        testScope.currentRecord.citation = [{'name': 'Matty Fatty', 'city': 'Moscow'}];

        testScope.loadDefaultMILES();

        var rec = testScope.currentRecord;

        expect(rec.title).toEqual('Fernan Lake Data');
        expect(rec.description).toEqual('Limnology variables observed 2001 - 2003');
        expect(rec.start_date.$date).toEqual(new Date(2001, 9, 1));
        expect(rec.end_date.$date).toEqual(new Date(2003, 8, 30));
        expect(rec.place_keywords).toEqual('USA,Idaho');
        expect(rec.thematic_keywords).toEqual('IIA-1301792,MILES,EPSCoR');

        expect(rec.citation).toEqual(
            [{
                'name': 'Matty Fatty',
                'city': 'Moscow',
                'country': 'USA',
                'state': 'Idaho'
            }]
        );

        expect(rec.online).toEqual(['https://www.idahoecosystems.org']);

        expect(rec.west_lon).toEqual(-117.2413657);
        expect(rec.east_lon).toEqual(-111.043495);
        expect(rec.south_lat).toEqual(41.9880051);
        expect(rec.north_lat).toEqual(49.0011461);

        expect(rec.use_restrictions).toEqual(
            "Access constraints: Data will be provided to all who agree to appropriately acknowledge the National Science Foundation (NSF), Idaho EPSCoR and the individual investigators responsible for the data set. By downloading these data and using them to produce further analysis and/or products, users agree to appropriately  acknowledge the National Science Foundation (NSF), Idaho  EPSCoR and the individual investigators responsible for the data set. Use constraints: Acceptable uses of data provided by Idaho EPSCoR include any academic, research, educational, governmental, recreational, or other not-for-profit activities. Any use of data provided by the Idaho EPSCoR must acknowledge Idaho EPSCoR and the funding source(s) that contributed to the collection of the data. Users are expected to inform the Idaho EPSCoR Office and the PI(s) responsible for the data of any work or publications based on data provided. Citation: The appropriate statement to be used when citing these data is 'data were provided by (Name, University Affiliation) through the support of the NSF Idaho EPSCoR Program and by the National Science Foundation under award number IIA-1301792.' More information about EPSCoR Research Data can be found at http://www.idahoepscor.org/"
        );
    });
});


describe('Edit existing record', function() {
    beforeEach(module('metadataEditor'));

    var recordService, $rootScope, testCtrl, createController;
    beforeEach(
        inject(function($controller, $q, $rootScope, _recordService_) {
            $rootScope = $rootScope;
            recordService = _recordService_;

            testCtrl = $controller('BaseController',
                {$scope: testScope, recordService: recordService});
        }
    ));

    it('should overwrite all currently filled fields with the fields from server',
        function () {

            spyOn(recordService, 'getRecordToEdit').andReturn({

                success: function(callback) {

                    var data =
                            {
                                record: {
                                    access: [{
                                        'address': '875 Perimeter Dr. MS 2358',
                                        'city': 'Moscow',
                                        'country': 'USA',
                                        'name': 'Northwest Knowledge Network',
                                        'email': 'info@northwestknowledge.net',
                                        'org': 'University of Idaho',
                                        'phone': '208-885-2080',
                                        'state': 'Idaho',
                                        'zipcode': '83844-2358',
                                        }],

                                    title: 'Dabke on the Moon',

                                    description: 'Dabke is a traditional dance from the Levant. The moon is the Earth\'s only natural satellite',

                                    start_date: {$date: new Date(2010, 0, 1)},
                                    end_date: {$date: new Date(2011, 11, 31)},
                                    last_mod_date: {$date: new Date(2015, 12, 3)},
                                    first_pub_date: {$date: new Date(2009, 5, 6)},
                                    data_format: ['docx', 'pdf'],
                                    place_keywords: [''],
                                    thematic_keywords: ['']
                                }
                            };

                    callback(data);
                    return {
                        error: function(callback) { return callback({}); }
                    };
                }
            });

            testScope.currentRecord.title = 'The title';
            testScope.currentRecord.first_pub_date = new Date(2009, 5, 6);
            testScope.currentRecord.description = ' something blue... ';

            testScope.editRecord('xxxo');

            expect(recordService.getRecordToEdit).toHaveBeenCalledWith('xxxo');

            var rec = testScope.currentRecord;

            expect(rec.title).toEqual('Dabke on the Moon');
            expect(rec.description).toEqual('Dabke is a traditional dance from the Levant. ' +
                'The moon is the Earth\'s only natural satellite');

            expect(rec.start_date.$date).toEqual(new Date(2010, 0, 1));
            expect(rec.end_date.$date).toEqual(new Date(2011, 11, 31));
            expect(rec.last_mod_date.$date).toEqual(new Date(2015, 12, 3));
            expect(rec.first_pub_date.$date).toEqual(new Date(2009, 5, 6));

            expect(rec.access).toEqual([{
                'address': '875 Perimeter Dr. MS 2358',
                'city': 'Moscow',
                'country': 'USA',
                'name': 'Northwest Knowledge Network',
                'email': 'info@northwestknowledge.net',
                'org': 'University of Idaho',
                'phone': '208-885-2080',
                'state': 'Idaho',
                'zipcode': '83844-2358'
            }]);

            expect(rec.data_format).toEqual(['docx', 'pdf']);
    });
});


describe('Save record as draft', function () {

    beforeEach(module('metadataEditor'));

    var recordService, $rootScope, testCtrl, createController;
    beforeEach(
        inject(function($controller, $q, $rootScope, _recordService_) {
            $rootScope = $rootScope;
            recordService = _recordService_;

            testCtrl = $controller('BaseController',
                {$scope: testScope, recordService: recordService});

            testScope.currentRecord.title = 'YO A TITLE';
            testScope.currentRecord.description = 'description';
        }
    ));

    beforeEach( function()
    {
        spyOn(recordService, 'saveDraft').andReturn({

                success: function(callback) {
                    var data = {
                        record: {
                            start_date: new Date(2010, 0, 1),
                            end_date: new Date(2011, 11, 31),
                            last_mod_date: new Date(),
                            first_pub_date: new Date(2012, 10, 1),
                            data_format: ['docx', 'netcdf'],
                            place_keywords: ['Idaho', 'Dry Creek'],
                            thematic_keywords: ['hydrology', 'rain-snow transition']
                        }
                    };

                    callback(data);

                    return {
                        error: function(callback) { return callback({}); }
                    };
                }
            });
    });

    it('should call recordService.saveDraft', function () {
        testScope.submitDraftRecord();
        expect(recordService.saveDraft).toHaveBeenCalled();
    });

    it('should reset the access and citation\'s addedContacts count to 0', function () {

        testScope.addContactCitation();
        expect(testScope.addedContacts.citation).toEqual(1);

        testScope.addContactAccess();
        expect(testScope.addedContacts.access).toEqual(1);

        testScope.submitDraftRecord();
        expect(recordService.saveDraft).toHaveBeenCalled();
        expect(testScope.addedContacts).toEqual({
            access: 0,
            citation: 0
        });
    });

    it('should set newRecord to false on the scope', function () {
        expect(testScope.newRecord).toEqual(true);
        testScope.submitDraftRecord();

        expect(recordService.saveDraft).toHaveBeenCalled();
        expect(testScope.newRecord).toEqual(false);
    });
});


describe('Delete existing record', function () {
    beforeEach(module('metadataEditor'));

    var recordService, testCtrl, createController;
    beforeEach(
        inject(function($controller, $q, $rootScope, _recordService_) {
            $rootScope = $rootScope;
            recordService = _recordService_;

            testCtrl = $controller('BaseController',
                {$scope: testScope, recordService: recordService});

            testScope.currentRecord.title = '¡Pollo Loco!';
            testScope.currentRecord.summary = 'finger lickin good chicken, better than KFC?';
        })
    );

    beforeEach(function() {
        spyOn(recordService, 'delete').andReturn({

            success: function(callback) {
                var data = {};

                callback(data);

                return {
                    error: function(callback) { return callback({}); }
                };
            }
        });

        // since createNew and updateRecords are tested, we can be confident
        // they work properly; we only need to check that the delete service
        // calls these as expected in the following scenarios
        spyOn(testScope, 'createNewRecord');

        spyOn(testScope, 'updateRecordsList');
    });

    it('should call recordService.delete even if currentRecord\'s id doesn\'t exist', function () {
        testScope.deleteById('recordId');
        expect(recordService.delete).toHaveBeenCalledWith('recordId');
    });

    it('should clear existing fields and create new record if the currently loaded recorded is the one deleted',
        function () {
        testScope.currentRecord._id = {$oid: 'pollo'};

        testScope.deleteById('pollo');

        expect(recordService.delete).toHaveBeenCalledWith('pollo');
        expect(testScope.createNewRecord).toHaveBeenCalled();
        expect(testScope.updateRecordsList).toHaveBeenCalled();
    });

    it('should remove the record from the list of records whether it\'s the current record or not',
        function () {
        testScope.currentRecord._id = {$oid: 'pollo'};

        testScope.deleteById('al pastor');

        expect(recordService.delete).toHaveBeenCalledWith('al pastor');
        expect(testScope.updateRecordsList).toHaveBeenCalled();
        expect(testScope.createNewRecord).not.toHaveBeenCalled();
    });
});


describe('Publish record', function () {
    beforeEach(module('metadataEditor'));

    var recordService, $rootScope, testCtrl, createController;
    beforeEach(
        inject(function($controller, $q, $rootScope, _recordService_) {
            $rootScope = $rootScope;
            recordService = _recordService_;

            testCtrl = $controller('BaseController',
                {$scope: testScope, recordService: recordService});

            testScope.currentRecord.title = 'YO A TITLE';
            testScope.currentRecord.description = 'description';
        }
    ));

    beforeEach( function()
    {
        spyOn(recordService, 'publish').andReturn({

                success: function(callback) {
                    var data = {};

                    callback(data);

                    return {
                        error: function(callback) { return callback({}); }
                    };
                }
            });
    });

    it('should call recordService.publishRecord', function () {
        testScope.publishRecord();
        expect(recordService.publish).toHaveBeenCalled();
    });

    it('should reset the access and citation\'s addedContacts count to 0', function () {
        testScope.addContactCitation();
        expect(testScope.addedContacts.citation).toEqual(1);

        testScope.addContactAccess();
        expect(testScope.addedContacts.access).toEqual(1);

        testScope.publishRecord();
        expect(recordService.publish).toHaveBeenCalled();
        expect(testScope.addedContacts).toEqual({
            access: 0,
            citation: 0
        });
    });

    it('should set newRecord to false on the scope', function () {
        expect(testScope.newRecord).toEqual(true);
        testScope.publishRecord();

        expect(recordService.publish).toHaveBeenCalled();
        expect(testScope.newRecord).toEqual(false);
    });
});


describe('Attach a file to a record', function () {
    beforeEach(module('metadataEditor'));

    var recordService, AttachmentService, $rootScope, testCtrl, createController;
    beforeEach(
        inject(function($controller, $q, $rootScope, _recordService_,
                        _AttachmentService_) {
            // $rootScope = $rootScope;
            AttachmentService = _AttachmentService_;
            recordService = _recordService_;

            testCtrl = $controller('BaseController',
                {
                    $scope: testScope,
                    AttachmentService: AttachmentService,
                    recordService: recordService
                });
        }
    ));

    it('should upload a file then attach file to metadata record', function () {

        testScope._id = {$oid: 'x64a-82b'};

        spyOn(recordService, 'saveDraft').andReturn({

            success: function(callback) {
                    var data = {
                        record: {
                            _id: {$oid: 'x64a-82b'},
                            start_date: new Date(2010, 0, 1),
                            end_date: new Date(2011, 11, 31),
                            last_mod_date: new Date(),
                            first_pub_date: new Date(2012, 10, 1),
                            data_format: ['docx', 'netcdf'],
                            place_keywords: ['Idaho', 'Dry Creek'],
                            thematic_keywords: ['hydrology']
                        }
                    };

                    callback(data);

                    return {
                        error: function(callback) { return callback({}); }
                    };
                }
        });

        spyOn(AttachmentService, 'uploadFile').andReturn({
            success: function(callback) {
                var data = {
                    "message": "The file xx5rz.txt has been uploaded",
                    "source": "xx5rz.txt",
                    "url": "https://nknportal-dev.nkn.uidaho.edu/portal/simpleUpload/tempData/xx5rz.txt",
                    "target_path": "tempData/xx5rz.txt",
                    "size": 84203
                };

                callback(data);

                return {
                    error: function() { return callback({}); }
                };
            }
        });

        spyOn(AttachmentService, 'attachFile').andReturn({

                success: function(callback) {
                    var data = {
                        record: {
                            _id: {$oid: 'x64a-82b'},
                            start_date: new Date(2010, 0, 1),
                            end_date: new Date(2011, 11, 31),
                            last_mod_date: new Date(),
                            first_pub_date: new Date(2012, 10, 1),
                            data_format: ['docx', 'netcdf'],
                            place_keywords: ['Idaho', 'Dry Creek'],
                            thematic_keywords: ['hydrology'],
                            attachments: [{
                                url: 'https://nknportal-dev.nkn.uidaho.edu/portal/simpleUpload/tempData/xx5rz.txt',
                                id: 'ab566a'
                            }]
                        }
                    };

                    callback(data);

                    return {
                        error: function(callback) { return callback({}); }
                    };
                }
        });

        var f = new File(["data line 1", "data line 2"], "test.txt");
        testScope.attachFile(f);

        expect(AttachmentService.uploadFile).toHaveBeenCalled();

        expect(AttachmentService.attachFile)
            .toHaveBeenCalledWith(
                'https://nknportal-dev.nkn.uidaho.edu/portal/simpleUpload/tempData/xx5rz.txt', 'x64a-82b'
            );

        expect(testScope.currentRecord.attachments.length).toBe(1);
    });

});


describe('Remove an existing attachment from the record', function () {
    beforeEach(module('metadataEditor'));

    var recordService, AttachmentService, $rootScope, testCtrl, createController;
    beforeEach(
        inject(function($controller, $q, $rootScope, _recordService_,
                        _AttachmentService_) {

            AttachmentService = _AttachmentService_;
            recordService = _recordService_;

            testCtrl = $controller('BaseController',
                {
                    $scope: testScope,
                    AttachmentService: AttachmentService,
                    recordService: recordService
                });
        }
    ));

    it('should call AttachmentService.detachFile and update scope', function () {
        testScope.currentRecord._id = {$oid: 'jimjam'};
        testScope.currentRecord.title = 'yo';
        testScope.currentRecord.attachments = [{
            url: 'http://example.com/yo.txt',
            id: 'yo42'
        }];

        spyOn(AttachmentService, 'detachFile').andReturn({
            success: function(callback) {
                var data = {
                    record: {
                        _id: {$oid: 'jimjam'},
                        title: 'yo',
                        start_date: new Date(2010, 0, 1),
                        end_date: new Date(2011, 11, 31),
                        last_mod_date: new Date(),
                        first_pub_date: new Date(2012, 10, 1),
                        data_format: ['docx', 'netcdf'],
                        place_keywords: ['Idaho', 'Dry Creek'],
                        thematic_keywords: ['hydrology'],
                        attachments: []
                    }
                };

                callback(data);

                return {
                    error: function(callback) { return callback({}); }
                };
            }
        });

        testScope.detachFile('yo42');

        expect(AttachmentService.detachFile)
            .toHaveBeenCalledWith('yo42', 'jimjam');

        expect(testScope.currentRecord.attachments.length).toBe(0);
    });
});


describe('Query geoprocessing service', function () {

    beforeEach(module('metadataEditor'));

    var Geoprocessing, $rootScope, testCtrl, createController;
    beforeEach(
        inject(function($controller, $q, $rootScope, _Geoprocessing_) {
            $rootScope = $rootScope;
            Geoprocessing = _Geoprocessing_;

            testCtrl = $controller('BaseController',
                {$scope: testScope, Geoprocessing: Geoprocessing});
        }
    ));

    beforeEach( function() {

        spyOn(Geoprocessing, 'getBbox').andReturn({

                success: function(callback) {

                    var data = {
                        north: 49.001,
                        south: 41.9880051,
                        east: -111.043,
                        west: -117.2413657
                    };

                    callback(data);

                    return {
                        error: function(callback) { return callback({}); }
                    };
                }
            });
    });

    it('should call geoservice.getBbox', function () {
        testScope.options.bboxInput = 'Idaho';
        testScope.getBbox();

        expect(Geoprocessing.getBbox).toHaveBeenCalledWith('Idaho');
    });
});
