/**
 * Javascript Front End for implementing views.
 */

/// URL of the metadata server
var METADATA_URL = "http://localhost:4000/api/metadata";

/// Compile page template
var TEMPLATE_SOURCE = $("#entry-template").html();
var TEMPLATE = Handlebars.compile(TEMPLATE_SOURCE); 

var contactNames;
var numAccessContacts = 0;
var numCitationContacts = 0;
/// Page load: refresh list of metadata
$(function() { 
  
  // refresh (create) list of existing metadata entries
  refreshMdList(); 
  
  // reset (initialize) metadata form
  resetForm();

  // use the metadata form to read what the contact fields are and 
  // build the "genericContact" from that, to be re-used when the user
  // wants to add another contact for either the access or citation contacts
  //
  // Also this block initializes num(Access/Citation)Contacts
  $.get(METADATA_URL + '/form' , function(metadata) {
      // could use either citation or access
      var citationList = metadata.form
                                 .filter(function(a) { 
                                   return a.label === 'citation-contact'; 
                                 }).pop().form_fields;

      var citationNames = citationList.map(function(a) { return a.name; });

      contactNames = citationNames;

      var accessList = metadata.form
                                 .filter(function(a) { 
                                   return a.label === 'access-contact'; 
                                 }).pop().form_fields;

      var accessNames = accessList.map(function(a) { return a.name; });

      numCitationContacts = 1 +  // indexing starts at zero
        Math.max.apply(Math, citationNames.map(
            function(n){ return parseInt(n.split('-')[2]); 
            })
        );

      numAccessContacts = 1 + 
        Math.max.apply(Math, accessNames.map(
            function(n){ return parseInt(n.split('-')[2]); 
            })
        );
  });
});

/**
 * Build a new contact element to be appended to the existing contact panels
 * This could be called when  
 */
var insertNewContact = function(citationOrAccess)
{
  if (citationOrAccess == 'citation')
  {
    var contactIdx = numCitationContacts;
    numCitationContacts += 1;
  }
  else if (citationOrAccess == 'access')
  {
    var contactIdx = numCitationContacts;
    numAccessContacts += 1;
  } 
  else
  {
    throw "Contact type must be 'citation' or 'access'."; 
  }
};
  

var newContactButton = function(citationOrAccess)
{
  ret = 
  '<div class="row"><div class="col-sm-3"></div><div class="col-sm-9">' 
  + '<button id=add-contact-' + citationOrAccess
          + ' class="btn btn-primary btn-lg md-button new-contact-button" type="button"'
          + 'onClick="addContact(this.id)">Add New Contact</button>'
  + '</div></div>';

  return ret;
};


var addButtons = function()
{
  $('.selectpicker').selectpicker();
  $("#body-citation-contact .panel-body").append(newContactButton('citation'));
  $("#body-access-contact .panel-body").append(newContactButton('access'));
};

var addContact = function(clicked_id) {
  alert("hey! this is a " + clicked_id);
  contact_type = clicked_id.split("-")[2];


};

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

    addButtons();
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

/** FIXME: REFACTORME **/
var refreshMdList = function() {

  console.log("in refreshMdList");

  var domMdlist = $('#mdlist');

  var id = "/";
  var fields = {};

  if (!(typeof arguments[0] === 'undefined'))
  {
    var argsObj = arguments[0];
    append = argsObj.append; 
    fields = argsObj.fields.record;  // FIXME
    id = fields._id['$oid'];
  }

  // get list of all metadata from server
  $.get(METADATA_URL, function(mdListObj) {
    // get list
    var mdList = mdListObj.results;
    console.log("in get callback");

    // clear out previous list so we're really just appending anything new
    if (!initial)
    {
      var mdListLen = mdList.length;
      mdListIdxLen = mdListLen - 1; 
      mdList = [mdList[mdListIdxLen]];
    }
    else
    {
      console.log("initial");
      initial = false;
    }

    var mdDisplay = '';
    if (append) 
    {
      console.log("appending");
      console.log(mdList);
      $.each(mdList, function(idx, el) {
          console.log(el);
          idx += mdListIdxLen + 1;
          oid = el._id['$oid']
          domMdlist.append( 
            // metadata numbering header
            '<div class="row"><div class="col-sm-6"><h4>Metadata #' + idx + '</h4></div>'
          );

          // append build each div.mdrow from domMdList element 
          var displayRow = '';
          $.each(el, function(key, val) {
              // create the row
              if (key === 'title' || key === 'summary')
              displayRow += 
                '<div class="col-xs-5 mdrow">' + key + ': ' + val + '</div>';
              });
          
            // Edit link
            displayRow += '<div class="col-xs-1"><a onclick="editRecord(this.id)" id="' + 
                            METADATA_URL + '/' + oid + '/form">Edit</a></div>' +
            // "generic" xml link
            '<div class="col-xs-1"><a href="' + 
              METADATA_URL + '/' + oid + '/xml' + '">XML</a></div>'

            // append the row to div#mdlist
            domMdlist.append('<div class="row" id="mdrow-' + oid + '">' + displayRow + '</div>');
        });
        
        $('.selectpicker').selectpicker();
      }
      else
      {

        // we get the form so that the updated version is now loaded into the form
        var byId = "http://localhost:4000/api/metadata/" + id + "/form";
        var displayRow = '';
        $.each(fields, function(key, val) {
          // display list 
            // create the row
            if (key === 'title' || key === 'summary')
            displayRow += 
              '<div class="col-xs-5 mdrow">' + key + ': ' + val + '</div>';
            });
      
        // Edit link
        displayRow += '<div class="col-xs-1"><a onclick="editRecord(this.id)" id="' + 
                        METADATA_URL + '/' + oid + '/form">Edit</a></div>' +
        // "generic" xml link
        '<div class="col-xs-1"><a href="' + 
          METADATA_URL + '/' + oid + '/xml' + '">XML</a></div>'


        var el_id = '#mdrow-' + id;
        $(el_id).html(displayRow);

        append = true;

        $('.selectpicker').selectpicker();
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
  var serializedForm = $(this).serializeArray();
  
  console.log(serializedForm);

  var idVal = serializedForm.filter(function(el){ return el.name == "id"; });
  if (idVal.length > 0)
  {
    idVal = idVal.pop().value; 

    var put = $.ajax({

      url: METADATA_URL + '/' + idVal, 

        type: 'PUT',
        data: serializedForm,
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
            
            addButtons();
          }
    });
  }
  // otherwise this is a POST, which creates a new record
  else
  {
    var posting = 
      $.post(METADATA_URL, 
        // dont include id for posting; it's '/'
        serializedForm.filter(
          function(el){ return el.name != "id"; 
        }));

    posting.done(function(viewData) {

      var html = TEMPLATE(viewData.form);
      $("#form-main").html(html);
      $(".selectpicker").selectpicker()

      refreshMdList();

      displayEditModeHeader(viewData.id);

      addButtons();
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
      $(".selectpicker").selectpicker()
      displayEditModeHeader(viewData.id);
      addButtons();
    });
};
$('#add-contact-citation').click( function(event)
  {
    event.preventDefault();
    alert('hey!');
  }
);
