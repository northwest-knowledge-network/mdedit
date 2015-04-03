/**
 * Javascript Front End for implementing views.
 */

/// URL of the metadata server
var METADATA_URL = "http://localhost:4000/api/metadata";

/// Compile page template
var TEMPLATE_SOURCE = $("#entry-template").html();
var TEMPLATE = Handlebars.compile(TEMPLATE_SOURCE); 

/// Page load: refresh list of metadata
$(function() { 
  
  // refresh (create) list of existing metadata entries
  refreshMdList(); 
  
  // reset (initialize) metadata form
  resetForm();
  
});

/**
 * Reset form to default values
 */
var resetForm = function()
{
  $("#form-header").empty();

  $("#form-header").html("<h1>Add a new metadata record</h1>");

  $.get(METADATA_URL + '/form', function(viewData) {

    var html = TEMPLATE(viewData.form);

    $("#form-main").html(html);

  });
};

/**
 * Depending on whether the user is just seeing the page for the first time,
 * edited an existing record, or created a new record, refeshMdList reacts
 * appropriately either displaying the full list (on init), editing the data
 * for a single existing record (edit), or appending a new element in the HTML
 * list (create new).
 */

/// state variables for each of the three situations listed above
var initial = true;
var firstAppend = true;
var append = true;
var mdListIdxLen = 0;

var refreshMdList = function() {

  var mdlist = $('#mdlist');

  console.log(typeof(arguments));

  var id = "/";
  var fields = {};

  if (!(typeof arguments[0] === 'undefined'))
  {
    var argsObj = arguments[0];
    append = argsObj.append; 
    fields = argsObj.fields;
    id = fields.id;
  }

  console.log(append);

  // get list of all metadata from server
  $.get(METADATA_URL, function(mdListObj) {
    // get list
    var mdList = mdListObj.records;

    // clear out previous list so we're really just appending anything new
    if (!initial)
    {
      var mdListLen = mdList.length;
      mdListIdxLen = mdListLen - 1; 
      mdList = [mdList[mdListIdxLen]];
    }
    else
    {
      initial = false;
    }

    var mdDisplay = '';
    if (append) 
    {
      $.each(mdList, function(idx, el) {
          idx += mdListIdxLen + 1;
          mdlist.append('<div class="row"><div class="col-sm-6"><h4>Metadata #' + idx + '</h4></div>' +
            '<div class="col-sm-3"><a onclick="editRecord(this.id)" id="' + METADATA_URL + '/' + idx + '/form">Edit</a></div>' +
            '<div class="col-sm-3"><a href="' + METADATA_URL + '/' + idx + '/xml' + '">XML</a></div></div>');

          var displayRow = '';
          $.each(el, function(key, val) {
              // display list 
              displayRow += 
                '<div class="col-xs-3 mdrow">' + key + ': ' + val + '</div>';
              });

            mdlist.append('<div class="row" id="mdrow-' + idx + '">' + displayRow + '</div>');
        });
      }
      else
      {
        var byId = "http://localhost:4000/api/metadata/" + id + "/form";
        var displayRow = '';
        $.each(fields, function(key, val) {
          // display list 
          if (key !== 'id')
            displayRow += 
              '<div class="col-xs-3 mdrow">' + key + ': ' + val + '</div>';
        });

        var el_id = '#mdrow-' + id;
        console.log(el_id);
        $(el_id).html(displayRow);

        append = true;
      }
      
  });

};

/**
 * Listener on form's submit button. Checks if the hidden field of metadata id
 * is populated. If it is, then PUT form data to md server on submit as is 
 * proper for REST. If there is no metadata id, then this is a new metadata 
 * submission, so we make a POST request.
 */
$('#mdform').submit( function(event) {

  event.preventDefault();

  // `this` is form data
  var ser = $(this).serializeArray();

  var idVal = ser.filter(function(el){ return el.name == "id"; })
                 .pop()
                 .value;

  // if idVal is a str-rep of an integer, then we have a PUT: editing existing
  if (/^\+?[1-9]\d*$/.test(idVal))
  {
    var put = $.ajax({

      url: METADATA_URL + '/' + idVal, 

        type: 'PUT',
        data: ser,
        crossDomain: true,
        success: function(viewData) {

            var html = TEMPLATE(viewData.form);

            $("#form-main").html(html);

            $.get(METADATA_URL + '/' + idVal, 
              function(md) {
                refreshMdList({append: false, 
                               fields: md});
            });

            displayEditModeHeader(viewData.id);
          }
    });
  }
  // otherwise this is a POST, which creates a new record
  else
  {
    var posting = $.post(METADATA_URL, 
        // dont include id for posting; it's '/'
        ser.filter(function(el){ return el.name != "id"; }));

    posting.done(function(viewData) {

      var html = TEMPLATE(viewData.form);
      $("#form-main").html(html);

      refreshMdList();

      displayEditModeHeader(viewData.id);
    });
  }
});

/**
 * In "edit mode" we display the metadata being edited and an option to stop
 * editing to create a new entry instead.
 */
var displayEditModeHeader = function(recordId)
{
    $("#form-header")
      .html('<div class="row"><div class="col-sm-6"><p>Editing record #' + 
            recordId + 
            '</p></div> <div class="col-sm-6"> ' +
            '<button onclick="resetForm()">New Metadata Entry</button></div> </div>');
}

/**
 * Initialize the view of editing an existing metadata record using the form
 */
var editRecord = function(clickedHrefId)
{
    var endpoint = clickedHrefId;
    var recordToEdit = $.get(endpoint, function(viewData) {
      //var html =  + TEMPLATE(viewData);
      var html = TEMPLATE(viewData.form);
      $("#form-main").html(html);
      displayEditModeHeader(viewData.id);
    });
};
