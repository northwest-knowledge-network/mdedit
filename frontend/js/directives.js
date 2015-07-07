'use strict';

/* Directives */
angular.module('metadataEditor', [])
  .directive('multiselectDropdown', function() {
      return {
        link: function (scope, element, attrs) {
            element.multiselect({
              buttonClass: 'btn',
              buttonWidth: 'auto',
              buttonContainer: '<div class="btn-group" />',
              maxHeight: false,
              buttonText: function(options) {
                  if (options.length === 0) {
                      return 'Select at least one topic <b class="caret"></b>';
                  }
                  else if (options.length > 3) {
                      return options.length + ' selected <b class="caret"></b>';
                  }
                  else {
                      var selected = '';
                      options.each(function() {
                        selected += $(this).text() + ', ';
                      });
                      return selected.substr(0, selected.length - 2) + ' <b class="caret"></b>';
                  }
              },

            });

            scope.$watch(function() {
                return element[0].length;
            }, function() {
                element.multiselect('rebuild');
            });

            scope.$watch(attrs.ngModel, function () {
                element.multiselect('refresh');
            });
        }
      };
  });
