/**
 * Javascript Front End for implementing views.
 */

var refreshMdList = function() {

  console.log("here");

  var url = "http://localhost:4000/api/metadata";

  // get list of all metadata from server
  $.get(url, function(mdListObj) {
    // get list
    var mdList = mdListObj.records;

    var mdDisplay = '';
   
    $.each(mdList, function(idx, el) {
        idx += 1;
        console.log(el);
        $('#mdlist').append('<div class="row"><div class="col-sm-6"><h4>Metadata #' + idx + '</h4></div>' +
          '<div class="col-sm-3"><a href="' + url + '/' + idx + '">Edit</a></div>' +
          '<div class="col-sm-3"><a href="' + url + '/' + idx + '/xml' + '">XML</a></div></div>'
          );

        var displayRow = ''
        $.each(el, function(key, val) {
            // display list 
            displayRow += 
            '<div class="col-xs-3 mdrow">' + key + ': ' + val + '</div>';
            })

          //$('#mdlist').append('<div class="row"><div class="col-xs-3"></div>' + displayRow + '<div class="col-xs-2"></div>');
          $('#mdlist').append('<div class="row">' + displayRow + '</div>');
      });
  });
};

var source = $("#entry-template").html();

var template = Handlebars.compile(source);

// this is a stand-in for data from metadata server
var context = [];

// URL of the metadata server
var url = "http://localhost:4000/api/metadata";

// md server's GET method for form returns default md form and autopop values
$.get(url + '/form', function(viewData) {

  var html = template(viewData.form);

  $("#form-main").html(html);
});

refreshMdList();

// attach a listener on submit button; POST form data to md server on submit
$('#mdform').submit( function(event) {

  event.preventDefault();

  // $(this).serialize() gets read as request.form data in Flask
  var posting = $.post(url, $(this).serialize());

  console.log(posting);

  posting.done(function(viewData) {
    console.log(viewData.form);
    var html = template(viewData.form);
    $("#form-main").html(html);
    refreshMdList();
  });
});
