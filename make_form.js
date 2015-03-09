var mandatory = d3.select("body")
                  .append("form");

var suggested = d3.select("body")
                  .append("form");

var merely_esoteric = d3.select("body")
                        .append("form");

function httpGet(theUrl)
{
    var xmlHttp = null;

    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    return JSON.parse(xmlHttp.responseText);
}

// implicitly my rules and this sample data are saying, "if a string is a value
// at a level, then the string is an entry. If there's an array, then its 
// elements' values are entries. If there's an object, that is an indication of
// a deepening hierarcy
//
// TODO: Does this make any sense?
//
//var mandatory_fields_default = [
  ////metadata point of contact
//{"organisationName": "Point of contact for metadata record"},
//{"title": "Should inform content as well as context"},
  //// TODO: encapsulate and format for levels of nesting //
//{"CI_Date":
    //[{"date": "2015-01-25T09:30:47"},
     //{"dateType": "publication"}]
//},
//// has depth of two
//{"Other stuff":
    //[ {"thing 1": "yoyoy"},
       //{"deepest": 
           //[
              //{"machine": "rage"}, 
              //{"manu": "chao"}
           //]
       //}
    //] // next put another array of objects in here for a second hierarchical level.
//},
//{"fake field": "Homer Simpson"},
//{"even more fake": "Marge Simpson"}
//]; 
var url = "http://129.24.196.43///apps/my_app/search/datasets.json?version=3"
//var mandatory_fields_default = httpGet(url);
//mandatory_fields_default = mandatory_fields_default.results;

// using examples `from http://json.org/example <http://json.org/example>`_
var proper_json =
{
  //metadata point of contact
  "organisationName": "Point of contact for metadata record",
  "title": "Should inform content as well as context",
    // TODO: encapsulate and format for levels of nesting //
  "CI_Date":
      {
        "date": "2015-01-25T09:30:47",
        "dateType": "publication"
      },
  // has depth of two
  "Other stuff":
    { 
      "thing 1": "yoyoy",
      "deepest": 
        {
          "machine": "rage",
          "manu": "chao"
        }
    },
  "fake field": "Homer Simpson",
  "even more fake": "Marge Simpson"
}; 

console.log(proper_json)

var fields = ["orgName", "title", "date"];

console.log(proper_json);

var form = d3.select("#mdform")
             .append("ul")
             .html("<h1 class='level0'>level0: yo</h1>");

var first_key = true;
var keys = d3.keys(proper_json);
for (var i=0; i < keys.length; i++)
{
  var key = keys[i];
  console.log(key);
  var val = proper_json[key];
  console.log(val);
  // TODO for more nesting, can put another check for an Object, or maybe 
  // need a while for arbitrarily deep nesting. If it's another object 
  if (val instanceof Object)
  {
      // append a title to this section
      console.log(key);
      if (first_key)
      {
        form.selectAll("g")
            .data([key])
            .enter()
            .append("h2")
            .attr("class", "level1")
            .text(function(key) { return "level1: " + key; });

        first_key = false;
      }
      else
      {
        console.log("in here");
         form.append("g")
             .html("<h2 class=level1>level1: " + key + "</h2>");
             //.text(key);
              
      } 

      form.append("g")
          .append("div")
          //.attr("id", "hierarchy")
          .attr({"class": "hierarchy",
                 "id": "hierarchy" + i   
          });

      keys2 = d3.keys(val);
      for (var j=0; j < keys2.length; j++)
      {
        var key2 = keys2[j];
        var val2 = val[key2];

        // second hierarchical level 
        if (val2 instanceof Object)
        {
          d3.select("#hierarchy" + i)
            .append("g")
            .html("<h2 class=level2>level2: " + key2 + "</h2");
              //.data([key2])
              //.enter()
              //.append("h3")
              //.text(function(key) { return key; });

          d3.select("#hierarchy" + i)
              .append("g")
              .append("div")
              .attr({
                  "class": "hierarchy",
                  "id": "hierarchy" + i + "-" + j
              }); 

          keys3 = d3.keys(val2);
          for (var k=0; k < keys3.length; k++)
          {
              var key3 = keys3[k];
              var val3 = val2[key3];

              form.select("#hierarchy" + i + "-" + j)
                  .append("li")
                  .attr("class", "level2")
                  .append("label")
                  .text(key3)
                  .append("input")
                  .attr({
                    "class": "level2",
                    "type": "text",
                  "value": val3
                  }); 
          } 
        } 
        else if (typeof(val2) === "string")
        {
          form.select("#hierarchy" + i)
              .append("li")
              .attr("class", "level1")
              .append("label")
              .text(key2)
              .append("input")
              .attr({
                "class": "level1",
                "type": "text",
              "value": val2
              }); 
        }
      }
  }
  else if (typeof(val) === "string")
  {
      //form.selectAll("li")
      form.append("li")
          .attr("class", "level0")
          .append("label")
          .text(key)
          .append("input")
          .attr({
              "class": "level0",
              "type": "text",
              "value": val
          }); 
  } 
} 
