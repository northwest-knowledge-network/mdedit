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
    .directive("adminView", ['recordService', 'updateAdmin', function(recordService, updateAdmin){
	return{
	    restrict: 'E',
	    templateUrl: 'partials/allRecords.html',
	    controller: function($scope, recordService){
		var currentPage = 0;

		function getCurrentPage(){
		    return currentPage;
		}

		function setCurrentPage(value){
		    if(typeof value === 'number')
			currentPage = value;
		    else
			console.log("Error: tried to set current page to non-number");
		}

		function queryDatabase(){
		    if(getCurrentPage() < 0)
			console.log("Error: tried to set page number to less than 0.");
		    else{
			recordService.getAllRecords(getCurrentPage(), 10, $scope.selectedFilter).success(function(data){
			    updateAdmin($scope, data);
			}).error(function(error) {
			    $scope.errors.push("Error in loading list of records.");
			});
		    }
		}
		
		//Use 0 based index for pages (first argument to getAllRecords) to make math work in backend
		//for splicing results.
		recordService.getAllRecords(0, 10, 't').success(function(data){
		    updateAdmin($scope, data);
		    //console.log(data);
		    //$scope.recordsList = data;
		}).error(function(error) {
		    $scope.errors.push("Error in loading list of records.");
		});

		$scope.selectedFilter = "md_pub_date";


		$scope.switchAdminResultsPage = function(pageNumber){
		    /* Need to translate 'pageNumber' into 0 based index, decrement 'pageNumber' for calling
		       getAllRecords(pageNumber, numberOfRecords)
		    */
		    pageNumber--;
		    setCurrentPage(pageNumber);

		    queryDatabase();
		};

		$scope.switchOrdering = function(){
		    /* Need to translate 'pageNumber' into 0 based index, decrement 'pageNumber' for calling
		       getAllRecords(pageNumber, numberOfRecords)
		    */
		    queryDatabase();
		};

		
		//console.log($scope.recordsList);
		//var result = recordService.list();
		//console.log(result);
		//console.log("Printing length of recordsList: " + result.length);
		//console.log("Printing first record title: " + result[0]);
		//$scope.getRecords = function(pageNumber, recordsPerPage) {
		//    $scope.recordsList = recordService.getAllRecords(pageNumber, recordsPerPage);
		//};
	    },
	    controllerAs: 'adminCtrl'
	}
    }]);
