/**
 * Javascript Front End for implementing views.
 */

// URL of the metadata server
var METADATA_URL = "http://localhost:4000/api/metadata";

var TEMPLATE_SOURCE = $("#entry-template").html();

var TEMPLATE = Handlebars.compile(TEMPLATE_SOURCE); 

// this is a stand-in for data from metadata server
var context = [];


// on load refresh list of metadata
$(function() { 
  refreshMdList(); 

  // md server's GET method for form returns default md form and autopop values
  resetForm();
  

});

var resetForm = function()
{
  $("#form-header").empty();

  $("#form-header").html("<h1>Add a new metadata record</h1>");

  $.get(METADATA_URL + '/form', function(viewData) {

    var html = TEMPLATE(viewData.form);

    $("#form-main").html(html);

  });
};

// refresh list of all existing metadata entries
var initial = true;
var firstAppend = true;
var mdListIdxLen = 0;
var refreshMdList = function() {

  var mdlist = $('#mdlist');

  // get list of all metadata from server
  $.get(METADATA_URL, function(mdListObj) {
    // get list
    var mdList = mdListObj.records;

    // clear out previous list so we're really just appending anything new
    if (!initial)
    {
      var mdListLen = mdList.length;
      mdList = [mdList[mdListLen - 1]];
      mdListIdxLen = mdListLen - 1; 
    }
    else
    {
      initial = false;
    }

    var mdDisplay = '';
   
    $.each(mdList, function(idx, el) {
        idx += mdListIdxLen + 1;
        mdlist.append('<div class="row"><div class="col-sm-6"><h4>Metadata #' + idx + '</h4></div>' +
          '<div class="col-sm-3"><a onclick="editRecord(this.id)" id="' + METADATA_URL + '/' + idx + '/form">Edit</a></div>' +
          '<div class="col-sm-3"><a href="' + METADATA_URL + '/' + idx + '/xml' + '">XML</a></div></div>'
          );

        var displayRow = ''
        $.each(el, function(key, val) {
            // display list 
            displayRow += 
              '<div class="col-xs-3 mdrow">' + key + ': ' + val + '</div>';
            })

          mdlist.append('<div class="row">' + displayRow + '</div>');
      });
  });

};

// attach a listener on submit button; POST form data to md server on submit
$('#mdform').submit( function(event) {

  event.preventDefault();
  console.log($(this).serializeArray().filter(function(el){return el.name == "title";})[0]);

  var idVal = $(this).serializeArray()
                     .filter(function(el){ return el.name == "id"; })
                     .value;
  // if idVal exists, this is a PUT operation and record w/ idVal gets updated
  if (idVal)
  {
    //
  }
  // otherwise this is a POST, which creates a new record
  else
  {
    var posting = $.post(METADATA_URL, $(this).serialize());

    posting.done(function(viewData) {

      var html = TEMPLATE(viewData.form);
      $("#form-main").html(html);

      refreshMdList();

      displayEditModeHeader(viewData.id);
    });
  }
});

var displayEditModeHeader = function(recordId)
{
    $("#form-header")
      .html('<div class="row"><div class="col-sm-6"><p>Editing record #' + 
            recordId + 
            '</p></div> <div class="col-sm-6"> ' +
            '<button onclick="resetForm()">New Metadata Entry</button></div> </div>');
}


//$("a.edit").on("click",
var editRecord = function(clickedHrefId)
{
    var endpoint = clickedHrefId;
    var recordToEdit = $.get(endpoint, function(viewData) {
      console.log(viewData.form);
      //var html =  + TEMPLATE(viewData);
      var html = TEMPLATE(viewData.form);
      $("#form-main").html(html);
      displayEditModeHeader(viewData.id);
    });
};
