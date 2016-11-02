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
    .directive("adminView", ['$location', 'recordService', 'updateAdmin', 'updateForms', function($location, recordService, updateAdmin, updateForms){
	return{
	    restrict: 'E',
	    templateUrl: 'partials/allRecords.html',
	    controller: function($scope, recordService){
		var currentPage = 0;
		$scope.recordsPerPage = "10";

		$scope.selectedFilter = "title";

		$scope.searchTerm = "";

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

		    queryDatabase();
		}

		$scope.decCurrentPage = function(){
		    var newPage = getCurrentPage() -1;
		    if(newPage < 0)
			setCurrentPage(0);
		    else if(newPage >= $scope.pageNumbers.length)
			setCurrentPage($scope.pageNumbers.length - 1);
		    else
			setCurrentPage(getCurrentPage() - 1);
 		    
		    queryDatabase();
		}

		function queryDatabase(queryType){
		    if(getCurrentPage() < 0)
			console.log("Error: tried to set page number to less than 0.");
		    else{
			if(queryType.indexOf("browse") > -1){
			    recordService.getAllRecords(getCurrentPage(), $scope.recordsPerPage.toString(), $scope.selectedFilter).success(function(data){
				updateAdmin($scope, data);
			    }).error(function(error) {
				$scope.errors.push("Error in loading list of records.");
			    });
			}else if(queryType.indexOf("search") > -1){
			    recordService.searchAllRecords($scope.searchTerm, getCurrentPage(), $scope.recordsPerPage.toString(), $scope.selectedFilter).success(function(data){
				updateAdmin($scope, data);
			    }).error(function(error) {
				$scope.errors.push("Error in loading list of records.");
			    });
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

		$scope.searchForRecord = function() {
		    queryDatabase("search");
		};

		$scope.switchAdminResultsPage = function(pageNumber){
		    /* Need to translate 'pageNumber' into 0 based index, decrement 'pageNumber' for calling
		       getAllRecords(pageNumber, numberOfRecords)
		    */
		    pageNumber--;
		    setCurrentPage(pageNumber);

		    var searchType = "";
		    if($scope.searchTerm.length > 0)
			searchType = "search";
		    else
			searchType = "browse";
		    
		    queryDatabase(searchType);
		};

		$scope.switchPageLayout = function(){
		    /* Need to translate 'pageNumber' into 0 based index, decrement 'pageNumber' for calling
		       getAllRecords(pageNumber, numberOfRecords)
		    */
		    var searchType = "";
		    if($scope.searchTerm.length > 0)
			searchType = "search";
		    else
			searchType = "browse";
		    
		    queryDatabase(searchType);
		};

		$scope.loadRecord = function(recordId){
		    recordService.getRecordToEdit(recordId)
			.success(function (data){
			    //$scope.newRecord = false;
			    
			    updateForms($scope, data.record);
			    var path = "iso";
			    if(data.record.schema_type.indexOf("ISO") == 0)
				path = "dublin";
			    
			    $location.path(path);
			})
			.error(function (error) {
			    $scope.errors.push("Error in loading record to edit");
			});
		};
	    },
	    controllerAs: 'adminCtrl'
	}
    }]);
