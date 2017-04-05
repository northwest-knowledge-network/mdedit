'use strict';

/* Directives */
metadataEditorApp.directive('fileModel', ['$parse', function ($parse) {
    return {

        restrict: 'A',

        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}])
.directive('ngConfirmClick',[function(){
    return {
        priority: -1,
        restrict: 'A',
        link: function(scope, element, attrs){
            element.bind('click', function(e){
                var message = attrs.ngConfirmClick;
                if(message && !confirm(message)){
                    e.stopImmediatePropagation();
                    e.preventDefault();
                }
            });
        }
    }
}])
.directive('disableAutoClose', function() {
      // directive for disabling the default
      // close on 'click' behavior
      return {
            link: function($scope, $element) {
                $element.on('click', function($event) {
                    console.log("Dropdown should not close");
                    $event.stopPropagation();
                });
            }
        };
})
    .directive("adminView", ['$location', 'recordService', 'updateAdmin', 'updateForms', 'sharedRecord', 'makeElasticsearchRecord', 'elasticsearchRecord', function($location, recordService, updateAdmin, updateForms, sharedRecord, makeElasticsearchRecord, elasticsearchRecord){
	return{
	    restrict: 'E',
	    templateUrl: 'partials/allRecords.html',
	    controller: function($scope, recordService){
		var currentPage = 0;

		$scope.show = true;

		$scope.recordsPerPage = "10";

		//Records initially sorted by the publish date. This is the name of the publish date in the database.
		$scope.selectedOrderFilter = "md_pub_date";

		$scope.searchTerm = "";

		$scope.searchType = "browse";

		//Get current search type 
		function getSearchType(){
		    return $scope.searchType;
		}

		//Set current search type
		function setSearchType(value){
		    if(typeof value === 'string')
			$scope.searchType = value;
		    else
			console.log("Error: tried to set search type to non-string value.");
		}
		
		function getCurrentPage(){
		    return currentPage;
		}

		function setCurrentPage(value){
		    if(typeof value === 'number')
			currentPage = value;
		    else
			console.log("Error: tried to set current page to non-number");
		}

		$scope.incCurrentRecordsPage = function(){
		    var newPage = getCurrentPage() + 1;
		    if(newPage < 0)
			setCurrentPage(0);
		    else if(newPage >= $scope.pageNumbers.length)
			setCurrentPage($scope.pageNumbers.length - 1);
		    else
			setCurrentPage(getCurrentPage() + 1);

		    queryDatabase(getSearchType());
		}

		$scope.decCurrentRecordsPage = function(){
		    var newPage = getCurrentPage() -1;
		    if(newPage < 0)
			setCurrentPage(0);
		    else if(newPage >= $scope.pageNumbers.length)
			setCurrentPage($scope.pageNumbers.length - 1);
		    else
			setCurrentPage(getCurrentPage() - 1);
 		    
		    queryDatabase(getSearchType());
		}

		function queryDatabase(queryType){
		    //Contstruct empty record to display text that no results found. Don't want ng-repeat loop in partials/allRecords to try and
		    //print variable that is not defined.
		    var noResultsRecord = {"results":{}};
		    noResultsRecord.results = [{"title":"No results!", "summary":"", "citation":[{"name":""}], "md_pub_date":""}];
		    
		    if(getCurrentPage() < 0)
			console.log("Error: tried to set page number to less than 0.");
		    else{
			if(queryType.indexOf("browse") > -1){
			    recordService.getAllRecords(getCurrentPage(), $scope.recordsPerPage.toString(), $scope.selectedOrderFilter).success(function(data){
				updateAdmin($scope, data);
			    }).error(function(error) {
				$scope.errors.push("Error in loading list of records.");
			    });
			}else if(queryType.indexOf("search") > -1){
			    //If search term is not an empty string, use it to query database.
			    if($scope.searchTerm !== ""){
				recordService.searchAllRecords($scope.searchTerm, getCurrentPage(), $scope.recordsPerPage.toString(), $scope.selectedOrderFilter).success(function(data){
				    updateAdmin($scope, data);
				}).error(function(error) {
				    $scope.errors.push("Error in loading list of records.");
				});
			    }else{
				console.log("queryType is " + queryType);
				//If Search term is empty string, then use empty record to return "No results" message.
				updateAdmin($scope, noResultsRecord);
			    }
			}
		    }
		}
		
		//Use 0 based index for pages (first argument to getAllRecords) to make math work in backend
		//for splicing results.
		recordService.getAllRecords(0, 10, 't').success(function(data){
		    updateAdmin($scope, data);
		}).error(function(error) {
		    $scope.errors.push("Error in loading list of records.");
		});

		$scope.searchAllRecords = function() {
		    setSearchType("search");
		    queryDatabase(getSearchType());
		};

		$scope.browseAllRecords = function(){
		    setSearchType("browse");
		    queryDatabase(getSearchType());
		};

		$scope.switchRecordsResultsPage = function(pageNumber){
		    /* Need to translate 'pageNumber' into 0 based index, decrement 'pageNumber' for calling
		       getAllRecords(pageNumber, numberOfRecords)
		    */
		    pageNumber--;
		    setCurrentPage(pageNumber);

		    queryDatabase(getSearchType());
		};

		$scope.switchLayout = function(){
		    queryDatabase(getSearchType());
		};

		$scope.loadRecord = function(recordId){
		    recordService.getRecordToEdit(recordId)
			.success(function (data){
			    console.log("In loadRecord!");
			    sharedRecord.setRecord(data.record);

			    /* Need to set baseController's $scope.$parent.$parent.newRecord to false or else
			       baseController will save another copy with a different _id in the 
			       database. BaseController is two scopes above this controller, so 
			       have to go up 2 parent scopes.
			    */
			    $scope.$parent.$parentnewRecord = false;
			    $scope.$parent.$parent.currentRecord = data.record;
			    $scope.$parent.$parent.isAdmin = true;
			    console.log("Added record to record sharing service.");

			    //Change route to either ISO or Dublin form type based on record type.
			    var path = "/iso";
			    if(data.record.schema_type.indexOf("Dublin Core") > -1)
				path = "/dublin";

			    console.log("Printing url: " + $location.path());
			    updateForms($scope, data.record);
			    $location.path(path);
			})
			.error(function (error) {
			    $scope.errors.push("Error in loading record to edit");
			});
		};

		$scope.initAdminView = function(){
		    $scope.show = true;
		    
		    $scope.recordsPerPage = "10";
		    
		    //Records initially sorted by the publish date. This is the name of the publish date in the database.
		    $scope.selectedOrderFilter = "md_pub_date";
		    
		    $scope.searchTerm = "";
		    
		    $scope.searchType = "browse";

		    recordService.getAllRecords(0, 10, $scope.seletedOrderFilter).success(function(data){
			updateAdmin($scope, data);
		    }).error(function(error) {
			$scope.errors.push("Error in loading list of records.");
		    });
		};


		/** 
		 * Make a new smaller record that is a subset of the complete record for use by Elasticsearch
		 */
		var createElasticsearchRecord = function(){
		    recordService.getFreshElasticsearchRecord()
			.success(function(data){
			    
			    makeElasticsearchRecord($scope, data);
			    console.log("Testing elasticsearchRecord: ");
			    console.log($scope.elasticsearchRecord);
			})
			.error(function(error) {
			    $scope.errors.push("Error in creating Elastic search record (subset of complete record)");
			});
		};
		
		
		$scope.publishRecordToPortal = function(recordId){
		    var elasticsearchRecord = recordService.getFreshElasticsearchRecord();
		    recordService.getRecordToEdit(recordId)
			.success(function (data){
		    
			    createElasticsearchRecord();
			    
			    //Send searchableRecord to Elasticsearch
		    	    console.log("Printing elasticsearchRecord: ");
		    	    console.log($scope.elasticsearchRecord);
		    	    console.log("Printing currentRecord identifier: ");

			    adminApprovePublish(recordId, $scope.elasticsearchRecord);
			});
		};
	    },
	    controllerAs: 'adminViewCtrl'
	}
    }])

    .directive("doiArkAssignView", ['$location', 'recordService', 'updateAdmin', 'updateForms', 'sharedRecord', function($location, recordService, updateAdmin, updateForms, sharedRecord){
	return{
	    restrict: 'E',
	    templateUrl: 'partials/doiArkAssign.html',
	    controller: function($scope, recordService){
		var currentPage = 0;

		console.log("inside doi/ark");

		$scope.showDoi = false;

		$scope.recordsPerPage = "10";

		//Records initially sorted by the publish date. This is the name of the publish date in the database.
		$scope.selectedFilter = "assigned_doi_ark";

		$scope.searchTerm = "";

		$scope.searchType = "browse";
		
		//Get current search type 
		function getSearchType(){
		    return $scope.searchType;
		}

		//Set current search type
		function setSearchType(value){
		    if(typeof value === 'string')
			$scope.searchType = value;
		    else
			console.log("Error: tried to set search type to non-string value.");
		}
		
		function getCurrentPage(){
		    return currentPage;
		}

		function setCurrentPage(value){
		    if(typeof value === 'number')
			currentPage = value;
		    else
			console.log("Error: tried to set current page to non-number");
		}

		$scope.incCurrentPage = function(){
		    var newPage = getCurrentPage() + 1;
		    if(newPage < 0)
			setCurrentPage(0);
		    else if(newPage >= $scope.pageNumbers.length)
			setCurrentPage($scope.pageNumbers.length - 1);
		    else
			setCurrentPage(getCurrentPage() + 1);

		    queryDatabase(getSearchType());
		}

		$scope.decCurrentPage = function(){
		    var newPage = getCurrentPage() -1;
		    if(newPage < 0)
			setCurrentPage(0);
		    else if(newPage >= $scope.pageNumbers.length)
			setCurrentPage($scope.pageNumbers.length - 1);
		    else
			setCurrentPage(getCurrentPage() - 1);
 		    
		    queryDatabase(getSearchType());
		}

		function queryDatabase(queryType){
		    //Contstruct empty record to display text that no results found. Don't want ng-repeat loop in partials/allRecords to try and
		    //print variable that is not defined.
		    var noResultsRecord = {"results":{}};
		    noResultsRecord.results = [{"title":"No results!", "summary":"", "citation":[{"name":""}], "md_pub_date":""}];
		    
		    if(getCurrentPage() < 0)
			console.log("Error: tried to set page number to less than 0.");
		    else{
			if(queryType.indexOf("browse") > -1){
			    recordService.getDoiArkRequests(getCurrentPage(), $scope.recordsPerPage.toString(), $scope.selectedFilter).success(function(data){
				updateAdmin($scope, data);
			    }).error(function(error) {
				$scope.errors.push("Error in loading list of records.");
			    });
			}else if(queryType.indexOf("search") > -1){
			    //If search term is not an empty string, use it to query database.
			    if($scope.searchTerm !== ""){
				recordService.searchDoiArkRequests($scope.searchTerm, getCurrentPage(), $scope.recordsPerPage.toString(), $scope.selectedFilter).success(function(data){
				    updateAdmin($scope, data);
				}).error(function(error) {
				    $scope.errors.push("Error in loading list of records.");
				});
			    }else{
				//If Search term is empty string, then use empty record to return "No results" message.
				console.log("in else");
				updateAdmin($scope, noResultsRecord);
			    }
			}
		    }
		}
/*		
		//Use 0 based index for pages (first argument to getAllRecords) to make math work in backend
		//for splicing results.
		recordService.getDoiArkRequests(0, 10, 't').success(function(data){
		    updateAdmin($scope, data);
		}).error(function(error) {
		    $scope.errors.push("Error in loading list of records.");
		});
*/
		$scope.searchForRecord = function() {
		    setSearchType("search");
		    queryDatabase(getSearchType());
		};

		$scope.browseRecords = function(){
		    setSearchType("browse");
		    queryDatabase(getSearchType());
		};

		$scope.switchAdminResultsPage = function(pageNumber){
		    /* Need to translate 'pageNumber' into 0 based index, decrement 'pageNumber' for calling
		       getAllRecords(pageNumber, numberOfRecords)
		    */
		    pageNumber--;
		    setCurrentPage(pageNumber);

		    queryDatabase(getSearchType());
		};

		$scope.switchPageLayout = function(){
		    queryDatabase(getSearchType());
		};

		$scope.saveRecord = function(index) {
		    $scope.currentRecord = $scope.recordsList.results[index];

		    //Not a new record, so set $scope.newRecord to false for use in services.js
		    $scope.newRecord = false;

		    //Save record
		    recordService.saveDraft($scope);
		};

		$scope.initDoiView = function(){
		    //Use 0 based index for pages (first argument to getAllRecords) to make math work in backend
		    //for splicing results.
		    $scope.showDoi = false;
		    
		    $scope.recordsPerPage = "10";
		    
		    //Records initially sorted by the publish date. This is the name of the publish date in the database.
		    $scope.selectedFilter = "assigned_doi_ark";
		    
		    $scope.searchTerm = "";
		    
		    $scope.searchType = "browse";
		    
		    recordService.getDoiArkRequests(0, 10, $scope.selectedFilter).success(function(data){
			updateAdmin($scope, data);
		    }).error(function(error) {
			$scope.errors.push("Error in loading list of records.");
		    });
		};
	    },
	    controllerAs: 'doiArkAssignCtrl'
	}
    }]);

