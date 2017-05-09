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
});
/*
    .directive("adminView", ['$location', 'recordService', 'updateAdmin', 'updateForms', 'sharedRecord', 'makeElasticsearchRecord', 'elasticsearchRecord', 'partialsPrefix', function($location, recordService, updateAdmin, updateForms, sharedRecord, makeElasticsearchRecord, elasticsearchRecord, partialsPrefix){
	return{
	    restrict: 'E',
	    templateUrl: partialsPrefix + 'partials/allRecords.html',
	    controller: function($scope, recordService){
		var currentPage = 0;

		$scope.show = true;

		$scope.recordsPerPage = "10";

		//Records initially sorted by the publish date. This is the name of the publish date in the database.
		$scope.selectedOrderFilter = "md_pub_date";

		$scope.searchTerm = "";

		$scope.searchType = "browse";

		$scope.publishState = "pending";

		//Boolean value for showing hor hiding the publish button in the view
		$scope.canPublish = false;

		//Boolean value for showing or hiding the delete button in the view
		$scope.canDelete = true;
	
		var selectedRecordIds = [];
		
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

		$scope.selectRecord = function(idValue){
		    var index = selectedRecordIds.indexOf(idValue);
		    
		    if( index > -1)
			selectedRecordIds = selectedRecordIds.splice(index, 1);
		    else
			selectedRecordIds.push(idValue);

		    console.log(selectedRecordIds);
		};

		$scope.deleteSelectedRecords = function(){
		    //For each record id in the list, make API call to Python backend to delete that record
		    console.log("Printing selectedRecordIds: ");
		    console.log(selectedRecordIds);
		    for(var i = 0; i < selectedRecordIds.length; i++){
			recordService.delete(selectedRecordIds[i]).success(function(data){
			    console.log("Deleting record...");
			    console.log(data);
			    //Query database to refresh page with updated list of records
		            queryDatabase(getSearchType());

			}).error(function(error, status) {
			    $scope.errors.push("Error in loading list of records.");
			    console.log("Error in deleting record " + selectedRecordIds[i]);
			    console.log(error);
			    console.log(status);
			});
		    }
		    //Reset array to empty array
		    selectedRecordIds = [];
	
		};

		$scope.incCurrentRecordsPage = function(){
		    var newPage = getCurrentPage() + 1;
		    if(newPage < 0)
			setCurrentPage(0);
		    else if(newPage >= $scope.pageNumbers.length)
			setCurrentPage($scope.pageNumbers.length - 1);
		    else
			setCurrentPage(getCurrentPage() + 1);

		    queryDatabase(getSearchType());
		};

		$scope.decCurrentRecordsPage = function(){
		    var newPage = getCurrentPage() -1;
		    if(newPage < 0)
			setCurrentPage(0);
		    else if(newPage >= $scope.pageNumbers.length)
			setCurrentPage($scope.pageNumbers.length - 1);
		    else
			setCurrentPage(getCurrentPage() - 1);
 		    
		    queryDatabase(getSearchType());
		};

		function queryDatabase(queryType){
		    //Contstruct empty record to display text that no results found. Don't want ng-repeat loop in partials/allRecords to try and
		    //print variable that is not defined.
		    var noResultsRecord = {"results":{}};
		    noResultsRecord.results = [{"title":"No results!", "summary":"", "citation":[{"name":""}], "md_pub_date":""}];
		    
		    if(getCurrentPage() < 0)
			console.log("Error: tried to set page number to less than 0.");
		    else{
			if(queryType.indexOf("browse") > -1){
			    recordService.getAllRecords(getCurrentPage(), $scope.recordsPerPage.toString(), $scope.selectedOrderFilter, $scope.publishState).success(function(data){
				updateAdmin($scope, data);
			    }).error(function(error, status) {
				recordService.checkAdmin(status);
				$scope.errors.push("Error in loading list of records.");
			    });
			}else if(queryType.indexOf("search") > -1){
			    //If search term is not an empty string, use it to query database.
			    if($scope.searchTerm !== ""){
				recordService.searchAllRecords($scope.searchTerm, getCurrentPage(), $scope.recordsPerPage.toString(), $scope.selectedOrderFilter, $scope.publishState).success(function(data){

				    updateAdmin($scope, data);
 				}).error(function(error, status) {
				    $scope.errors.push("Error in loading list of records.");
				    recordService.checkAdmin(status);
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
		recordService.getAllRecords(0, 10, $scope.selectedOrderFilter).success(function(data){
		    updateAdmin($scope, data);
		}).error(function(error, status) {
		    $scope.errors.push("Error in loading list of records.");
		    recordService.checkAdmin(status);
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

		    pageNumber--;
		    setCurrentPage(pageNumber);

		    queryDatabase(getSearchType());
		};

		$scope.switchLayout = function(){
		    switch($scope.publishState){
		    	case "pending":
				$scope.canDelete = true;
				$scope.canPublish = true;
				break;
		   	case "true":
				$scope.canDelete = false;
				$scope.canPublish = false;
				break;
			default:
				$scope.canDelete = true;
				$scope.canPublish = false;
				break;
		    }

		    switch($scope.adminViewMode){
			case "assign_ark_doi":
				changeToDoiView();
				break;
			default:
				
		    }
		    //Populate list on page with records
		    queryDatabase(getSearchType());
		};

		$scope.loadRecord = function(recordId){
		    recordService.adminGetUsersRecord(recordId)
			.success(function (data){
			    console.log("In loadRecord!");
			    console.log(data);
			    sharedRecord.setRecord(data.results);

			    var record = data.results;

			    $scope.$parentnewRecord = false;
			    $scope.$parent.currentRecord = record;
			    $scope.$parent.isAdmin = true;

			    console.log("Added record to record sharing service.");

			    //Change route to either ISO or Dublin form type based on record type.
			    var path = "/iso";
			    if(record.schema_type.indexOf("Dublin Core") > -1)
				path = "/dublin";

			    console.log("Printing url: " + $location.path());
			    updateForms($scope, record);
			    $location.path(path);
			})
			.error(function (error, status) {
			    $scope.errors.push("Error in loading record to edit");
			    recordService.checkAdmin(status);
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
			//Update the page with response data
			updateAdmin($scope, data);
		    }).error(function(error, status) {
			$scope.errors.push("Error in loading list of records.");
			recordService.checkAdmin(status);
		    });
		};



		var createElasticsearchRecord = function(record){
		    var elasticsearchRecord = recordService.getFreshElasticsearchRecord();
		    makeElasticsearchRecord($scope, record, elasticsearchRecord)
		    console.log("Testing elasticsearchRecord: ");
		    console.log($scope.elasticsearchRecord);
		};
		
		
		$scope.publishRecordToPortal = function(recordId){
		    recordService.adminGetUsersRecord(recordId)
			.success(function (data){
			    createElasticsearchRecord(data.results);
			    
			    //Send searchableRecord to Elasticsearch
		    	    console.log("Printing elasticsearchRecord: ");
		    	    console.log($scope.elasticsearchRecord);
		    	    console.log("Printing currentRecord identifier: ");

			    $scope.currentRecord = data.results;
			    //Not a new record. Need to set this to false or else it will try and make a new copy in the database. 
			    $scope.newRecord = false;
	

			    recordService.adminApprovePublish(recordId, $scope.elasticsearchRecord, $scope).success(function(response){
				console.log("Printing return from backend: ");
				console.log(response);

				if(typeof response === 'string'){
					if(response.indexOf("filesystem error"))
						alert("Error moving dataset from pending publish directory to published directory. This could be because the dataset has alreay been published, so the system cannot overwrite the existing published copy of the dataset.")
					else if(response.indexOf("Elasticsearch error"))
						alert("Error submitting the record to Elasticsearch. This record will not be searchable on the portal's search page.")
				}
				//Display results of Elasticsearch function from backend
				if(response.created != null && response.created == true){
					alert("Record published successfully!");
					//Set published to true only if there are no errors in the publishing process
					$scope.currentRecord.published = "true";
				}else{
					alert("Record published failed!");
					//Publishing has failed at this point, so reset published variable in record to "pending"
					$scope.currentRecord.published = "pending";
				}
			     	
				//Reload the list of pending records to display in the page
				queryDatabase(getSearchType());

			    }).error(function(error, status){
 			    	recordService.checkAdmin(status);
			    });
			}).error(function(error, status){
			    recordService.checkAdmin(status);
			});
		};
	    },
	    controllerAs: 'adminViewCtrl'
	}
    }])

    .directive("doiArkAssignView", ['$location', 'recordService', 'updateAdmin', 'updateForms', 'sharedRecord', 'partialsPrefix', function($location, recordService, updateAdmin, updateForms, sharedRecord, partialsPrefix){
	return{
	    restrict: 'E',
	    templateUrl: partialsPrefix + 'partials/doiArkAssign.html',
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
				console.log("Printing data : ");
				console.log(data);
				
				updateAdmin($scope, data);
			    }).error(function(error, status) {
				$scope.errors.push("Error in loading list of records.");
				recordService.checkAdmin(status);
			    });
			}else if(queryType.indexOf("search") > -1){
			    //If search term is not an empty string, use it to query database.
			    if($scope.searchTerm !== ""){
				recordService.searchDoiArkRequests($scope.searchTerm, getCurrentPage(), $scope.recordsPerPage.toString(), $scope.selectedFilter).success(function(data){
				    console.log("Printing data : ");
				    console.log(data);
				    
				    updateAdmin($scope, data);
				}).error(function(error, status) {
				    $scope.errors.push("Error in loading list of records.");
				    recordService.checkAdmin(status);
				});
			    }else{
				//If Search term is empty string, then use empty record to return "No results" message.
				console.log("in else");
				updateAdmin($scope, noResultsRecord);
			    }
			}
		    }
		}

		$scope.searchForRecord = function() {
		    setSearchType("search");
		    queryDatabase(getSearchType());
		};

		$scope.browseRecords = function(){
		    setSearchType("browse");
		    queryDatabase(getSearchType());
		};

		$scope.switchAdminResultsPage = function(pageNumber){

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
			console.log("Printing data : ");
			console.log(data);
			
			//Update admin page with response data
			updateAdmin($scope, data);
		    }).error(function(error, status) {
			$scope.errors.push("Error in loading list of records.");
			recordService.checkAdmin(status); 
		    });
		};
	    },
	    controllerAs: 'doiArkAssignCtrl'
	}
    }]);

*/
