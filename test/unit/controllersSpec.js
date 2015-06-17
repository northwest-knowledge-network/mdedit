'use strict';

/* jasmine specs for controllers go here */

describe('Metadata Editor Controllers', function() {

  describe('MetadataCtrl', function() {
    var scope, ctrl, $httpBackend;

    // Load our app module definition before each test
    beforeEach(module('metadataEditor'));

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      $httpBackend = _$httpBackend_;

      $httpBackend.expectGET('http://localhost:4000/api/metadata')
        .respond(
        {
          results: [
            {
              access: [{address: '86 Rayburn',
                       city: 'Moscow',
                       country: 'United States',
                       email: 'info@northwestknowledge.net',
                       name: 'Matt',
                       org: 'NKN',
                       phone: '555-5555',
                       state: 'ID',
                       zipcode: '83843',
                      }],
              citation: [{address: '43 University',
                       city: 'Boise',
                       country: 'United States',
                       email: 'heyguy@bsu.edu',
                       name: 'George',
                       org: 'Boise State University',
                       phone: '555-5555',
                       state: 'ID',
                       zipcode: '83725',
                      }],
              first_pub_date: '2015-01-01',
              last_mod_date: '2015-03-10',
              place_keywords: [
               'Dry Creek', 'Idaho', 'Forest Service'
              ],
              status: 'Completed',
              summary: 'DEM of Dry Creek Watershed northeast of Boise, ID',
              theme_keywords: [
                'lidar', 'dem', 'hydrology'
              ],
              title: 'Dry Creek DEM',
              topic_category: 'Biota'
            }
                  
          ]});
      
      scope = $rootScope.$new();

      ctrl = $controller('MetadataCtrl', {$scope: scope});
    }));

    it('should read a sample metadata record properly into the "records" model',
      function () {
        expect(scope.firstRecord).toBeUndefined();
        $httpBackend.flush();
        expect(scope.firstRecord).toBeDefined();
      });

    it('should gather the basic form fields together and title, describe the basic info',
      function() {
        expect(scope.basicForm).toBeUndefined();
        $httpBackend.flush();
        expect(scope.basicForm).toBeDefined();

        expect(scope.basicForm).toEqual(
          { 
            title: 'Basic Information',
            description: 'Just some get to know ya',
            fields: {
              title: 'Dry Creek DEM',
              summary: 'DEM of Dry Creek Watershed northeast of Boise, ID'
            }
          });
      });

    it('should gather the detailed form fields together and title, describe the basic info',
      function() {
        expect(scope.basicForm).toBeUndefined();
        $httpBackend.flush();
        expect(scope.basicForm).toBeDefined();

        expect(scope.basicForm).toEqual(
          { 
            title: 'Basic Information',
            description: 'Just some get to know ya',
            fields: {
              title: 'Dry Creek DEM',
              summary: 'DEM of Dry Creek Watershed northeast of Boise, ID'
            }
          });
      });
  });
});
