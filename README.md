# mdedit

A data-driven metadata editor.

# What it does

Uses [D3](http://d3js.org/) to read a JSON metadata record, like 
this one: 

```javascript

var mandatory_fields_default = [
  //metadata point of contact
{"organisationName": "Point of contact for metadata record"},
{"title": "Should inform content as well as context"},
  // TODO: encapsulate and format for levels of nesting //
{"CI_Date":
    [{"date": "2015-01-25T09:30:47"},
     {"dateType": "publication"}]
},
// has depth of two
{"Other stuff":
    [ {"thing 1": "yoyoy"},
       {"deepest": 
           [
              {"machine": "rage"}, 
              {"manu": "chao"}
           ]
       }
    ] // next put another array of objects in here for a second hierarchical level.
},
{"fake field": "Homer Simpson"},
{"even more fake": "Marge Simpson"}
]; 
```

And translate them into this:

![Metadata View](snapshot_medit_3-7.png)


It's a work in progress, but the beginnings of a solution that will be flexible
enough to account for the different ways in which a scientist could construct
valid metadata according to the ISO 19115 Standard.

I also just found this pretty nice [solution at the Gulf of Mexico Research
Initiative](https://data.gulfresearchinitiative.org/metadata-editor/) for
doing just this. There is an awkward thing that the user must download the XML
they make and then upload it to share their data, but they have many datasets
available from multiple researchers involved in post-Deepwater Horizon Spill]
[on their data search
page](https://data.gulfresearchinitiative.org/data-discovery). There is
definitely something to learn from their implementation, but it looks like their
source code is somewhat difficult to access, but could be implemented as part of
our Drupal setup: [the site's (entire?) source
code](https://triton.tamucc.edu/stash/repos?visibility=public) accessed from
[an FAQ sub
page](https://data.gulfresearchinitiative.org/griidc-system-being-developed-using-open-source-concept).



