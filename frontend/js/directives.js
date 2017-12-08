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

    .directive("adminView", ['$location', 'recordService', 'updateAdmin', 'updateForms', 'sharedRecord', 'makeElasticsearchRecord', 'elasticsearchRecord', 'partialsPrefix', function($location, recordService, updateAdmin, updateForms, sharedRecord, makeElasticsearchRecord, elasticsearchRecord, partialsPrefix){
	return{
	    restrict: 'E',
	    templateUrl: partialsPrefix + 'partials/allRecords.html',
	    controller: function($scope, recordService){
		var currentPage = 0;

		$scope.$parent.isAdmin = true;

		$scope.showBrowse = true;

		//How many records to display on a page.
		$scope.recordsPerPage = "10";

		//Records initially sorted by the publish date. This is the name of the publish date in the database.
		$scope.selectedOrderFilter = "md_pub_date";

		$scope.searchTerm = "";

		$scope.searchType = "browse";

		$scope.publishState = "pending";

		//Boolean value for showing hor hiding the publish button in the view. The page starts on the "Awaiting Review" records, which can be 
		//published, so set this initially to true. 
		$scope.canPublish = true;

		//Boolean value for showing or hiding the delete button in the view
		$scope.canDelete = true;
	
		var selectedRecordIds = [];

		/** 
		 *  Initialize admin view with list of records pending review by admin.
		 *  Uses recordService service found in frontend/js/services.js.
		 *  Use 0 based index for pages (first argument to getAllRecords) to make math work in backend
		 *  for splicing results.
		 */
		recordService.getAllRecords(0, 10, $scope.selectedOrderFilter, $scope.publishState).success(function(data){
		    updateAdmin($scope, data);
		}).error(function(error, status) {
		    $scope.errors.push("Error in loading list of records.");
		    recordService.checkAdmin(status);
		});

		
		/**
		 * Get current search type 
		 * @param {none} None
		 * @return {string} $scope.searchType;
		 */
		function getSearchType(){
		    return $scope.searchType;
		}

		/** 
		 *  Set current search type
		 *  @param {string} value
		 *  @return {none} none
		 */
		function setSearchType(value){
		    if(typeof value === 'string')
			$scope.searchType = value;
		    else
			console.log("Error: tried to set search type to non-string value.");
		}
		
		/** 
		 *  Get current page 
		 *  @param {none} none
	    	 *  @return {Number} currentPage
		 */
		function getCurrentPage(){
		    return currentPage;
		}

		/**
		 *  Set the current page
		 *  @param {Number} value
		 *  @return {none} none
		 */
		function setCurrentPage(value){
		    if(typeof value === 'number')
			currentPage = value;
		    else
			console.log("Error: tried to set current page to non-number");
		}

		/**
		 *  When a user clicks on a checkbox for a record get the record.$oid 
		 *  value for a record and put in a list of record ids. Used to delete records
		 *  if user selects "Delete Selected Records" button on admin panel.
		 *  @param {string} idValue
		 *  @return {none} none
		 */
		$scope.selectRecord = function(idValue){
		    var index = selectedRecordIds.indexOf(idValue);
		    /* If record is already in list, then user has clicked to deselect (uncheck box). So 
		     * remove from list using splice.
		     */
		    if( index > -1)
			selectedRecordIds = selectedRecordIds.splice(index, 1);
		    else{
			//Else, add new record id to list.
			selectedRecordIds.push(idValue);
		    }

		};

		/**
		 *  Delete list of selected records. Only records whos checkboxes were checked in admin panel
		 *  will be deleted.
		 *  @param {none} none
		 *  @return {none} none
		 */
		$scope.deleteSelectedRecords = function(){
		    //For each record id in the list, make API call to Python backend to delete that record
		    for(var i = 0; i < selectedRecordIds.length; i++){
			recordService.delete(selectedRecordIds[i]).success(function(data){
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

		/**
		 *  Increment the page number the admin is currently on
		 *  @params {none} none
		 *  @return {none} none
		 */
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

		/**
		 *  Decrement the page number the admin is currently on
		 *  @params {none} none
		 *  @return {none} none
		 */
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

		/**
		 *  Query the database for records awaiting review by admin. If no results found, displays "No results!" as only record object in return list.
		 *  @params {string} queryType
		 *  @return {none} none
		 */
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
				//If Search term is empty string, then use empty record to return "No results" message.
				updateAdmin($scope, noResultsRecord);
			    }
			}
		    }
		}

		/**
		 *  Sets database query system to search all records though user input (text box on left of admin view).
		 *  @param {none} none
		 *  @return {none} none
		 */
		$scope.searchAllRecords = function() {
		    setSearchType("search");
		    queryDatabase(getSearchType());
		};

		/**
		 *  Set database search type to browse all records (do not accept user input from text input search).
		 *  @param {none} none
		 *  @return {none} none
		 */
		$scope.browseAllRecords = function(){
		    setSearchType("browse");
		    queryDatabase(getSearchType());
		};

		/**
		 *  Select specific page of results to jump to. For list of page numbers across bottom of record list 
		 *  in admin view page. 
		 *  @param {number} pageNumber
		 *  @return {none} none
		 */
		$scope.switchRecordsResultsPage = function(pageNumber){
		    pageNumber--;
		    setCurrentPage(pageNumber);

		    queryDatabase(getSearchType());
		};

		/**
		 *  Change the type of records to display. "pending" records have not been submitted for admin review.
		 *  "true" records have been submitted, reviewed, and published by admin (and can't be deleted).
		 *  @param {none} none
		 *  @return {none} none
		 */
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

		/** Check if the record is requesting a DOI or ARK. If so, return false
		 *  @params {object} record
		 *  @return boolean
		 */
		$scope.checkIfDoiRequested = function(record){
		    //Check if the value is something other than "neither" and is not empty string
		    if((typeof record === "object")
		       && (record.doi_ark_request)
		       && (record.doi_ark_request.indexOf("neither") == -1)
		       && (record.doi_ark_request != "")){
			//Current doi/ark is blank and not yet assigned
			if(record.identifiers[1].id == ""){
			    return true;
			}else
			    return false;
		    }
		    return false;
		};

		/**
		 *  Load specific record in to metadata editor interface when 
		 *  record's list element clicked in admin view. 
		 *  @param {number} recordId
		 *  @return {none} none
		 */
		$scope.loadRecord = function(recordId){
		    recordService.adminGetUsersRecord(recordId)
			.success(function (data){
			    sharedRecord.setRecord(data.results);

			    var record = data.results;

			    $scope.$parent.newRecord = false;
			    $scope.$parent.currentRecord = record;


			    //Change route to either ISO or Dublin form type based on record type.
			    var path = "/iso";
			    if(record.schema_type.indexOf("Dublin Core") > -1)
				path = "/dublin";

			    updateForms($scope, record);
			    $location.path(path);
			})
			.error(function (error, status) {
			    $scope.errors.push("Error in loading record to edit");
			    recordService.checkAdmin(status);
			});
		};

		/**
		 *  Initialize the Admin view with base values
		 *  @param {none} none
		 *  @return {none} none
		 */
		$scope.initAdminView = function(){
		    
		    $scope.recordsPerPage = "10";

		    //Records initially sorted by the publish date. This is the name of the publish date in the database.
		    $scope.selectedOrderFilter = "md_pub_date";
		    
		    $scope.searchTerm = "";
		    
		    setSearchType("browse");

		    recordService.getAllRecords(0, 10, $scope.seletedOrderFilter, $scope.publishState).success(function(data){
			//Update the page with response data
			updateAdmin($scope, data);
		    }).error(function(error, status) {
			$scope.errors.push("Error in loading list of records.");
			recordService.checkAdmin(status);
		    });
		};

		/**
		 *  Create an Elasticsearch record, which is a subset of the total record object elements.
		 *  @param {object} record
		 *  @return {none} none
		 */
		var createElasticsearchRecord = function(record){
		    var elasticsearchRecord = recordService.getFreshElasticsearchRecord();
		    makeElasticsearchRecord($scope, record, elasticsearchRecord)
		};
		
		/**
		 *  Publish a record to Elasticsearch interface. Set record in MongoDB to record.published = "true" 
		 *  This function happens when an admin approved a record for publication.
		 *  @param {number} recordId
		 *  @return {none} none
		 */
		$scope.publishRecordToPortal = function(recordId){
		    recordService.adminGetUsersRecord(recordId)
			.success(function (data){
			    createElasticsearchRecord(data.results);
			    
			    //Send searchableRecord to Elasticsearch

			    $scope.currentRecord = data.results;
			    //Not a new record. Need to set this to false or else it will try and make a new copy in the database. 
			    $scope.newRecord = false;
	

			    recordService.adminApprovePublish(recordId, $scope.elasticsearchRecord, $scope).success(function(response){

				if(typeof response === 'string'){
					if(response.indexOf("filesystem error"))
						alert("Error moving dataset from pending publish directory to published directory. This could be because the dataset has alreay been published, so the system cannot overwrite the existing published copy of the dataset.")
					else if(response.indexOf("Elasticsearch error"))
						alert("Error submitting the record to Elasticsearch. This record will not be searchable on the portal's search page.")
				}
				//Display results of Elasticsearch function from backend
				if(response.created != null && response.created == true){
					//Set published to true only if there are no errors in the publishing process
					$scope.currentRecord.published = "true";
	
					recordService.saveDraft($scope).success(function(response){
						alert("Record published successfully!");
							
					}).error(function(error, status){
						alert("Record published failed! System failed to update MongoDB published attribute. Status: " + status);					
					});
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
			    }).error(function(error, status) {
				$scope.errors.push("Error in loading list of records.");
				recordService.checkAdmin(status);
			    });
			}else if(queryType.indexOf("search") > -1){
			    //If search term is not an empty string, use it to query database.
			    if($scope.searchTerm !== ""){
				recordService.searchDoiArkRequests($scope.searchTerm, getCurrentPage(), $scope.recordsPerPage.toString(), $scope.selectedFilter).success(function(data){
				    updateAdmin($scope, data);
				}).error(function(error, status) {
				    $scope.errors.push("Error in loading list of records.");
				    recordService.checkAdmin(status);
				});
			    }else{
				//If Search term is empty string, then use empty record to return "No results" message.
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

		    setSearchType("browse");
		    $scope.recordsPerPage = "10";
		    
		    //Records initially sorted by the publish date. This is the name of the publish date in the database.
		    $scope.selectedFilter = "assigned_doi_ark";
		    
		    $scope.searchTerm = "";
		    
		    $scope.searchType = "browse";
		    
		    recordService.getDoiArkRequests(0, 10, $scope.selectedFilter).success(function(data){
			
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


