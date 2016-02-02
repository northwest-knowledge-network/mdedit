'use strict';

metadataEditorApp
.filter('filename', function() {
    return function(input) {
        // do some bounds checking here to ensure it has that index
        var spl = input.split('/');
        return spl[spl.length - 1];
    };
});
