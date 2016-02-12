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