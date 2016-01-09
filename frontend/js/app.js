'use strict';

var metadataEditorApp = angular
.module('metadataEditor', ['ngRoute', 'ui.date', 'ngMap'])
.constant('formOptions',  {

 	topicCategoryChoices: ['biota', 'boundaries',
   'climatologyMeteorologyAtmosphere', 'economy', 'elevation',
   'environment', 'farming', 'geoscientificInformation', 'health',
   'imageryBaseMapsEarthCover', 'inlandWaters', 'location',
   'intelligenceMilitary', 'oceans', 'planningCadastre', 'society',
   'structure', 'transportation',
   'utilitiesCommunication'],

 knownDataFormats: ["ASCII", "csv", "DLG", "docx", "DRG", "DWG", "eps",
      "ERDAS", "Esri file GDB", "Esri grid", "Esri personal GDB","Esri TIN", "FASTA", "FASTQ", "GenBank",
      "GeoJSON", "GeoTIFF", "GML", "HDF", "jpeg", "KML", "LAS", "mp3",
      "MrSID", "netCDF", "pdf", "php", "png", "py", "R", "SDXF", "Shapefile",
      "SPSS", "Stata", "Tab", "tiff", "txt", "VBS", "wav", "xls", "xlsx",
      "xml"],

	spatialDataOptions: ["vector", "grid", "table or text",
      "triangulated irregular network", "stereographic imaging",
      "video recording of a scene"],

	hierarchyLevels: ["dataset", "series"],

	statusChoicesIsoMap:
    {
        'completed': 'completed',
        'continually updated': 'onGoing',
        'in process': 'underDevelopment',
        'planned': 'planned',
        'needs to be generated or updated': 'required',
        'stored in an offline facility': 'historicalArchive',
        'no longer valid': 'obsolete'
    },

	updateFrequencyChoicesMap:
    {
        'continual': 'continual',
        'daily': 'daily',
        'weekly': 'weekly',
        'fortnightly': 'fortnightly',
        'monthly': 'monthly',
        'quarterly': 'quarterly',
        'biannually': 'biannually',
        'annually': 'annually',
        'as needed': 'asNeeded',
        'irregular': 'irregular',
        'not planned': 'notPlanned',
        'unknown': 'unknown'
    },

	orderedContactFields: ['name', 'email', 'org', 'address', 'city',
				       'state', 'zipcode', 'country', 'phone'],

	cfieldsMap:
    {
        'name': 'Name',
        'email': 'Email',
        'org': 'Organization',
        'address': 'Address',
        'city': 'City',
        'state': 'State',
        'zipcode': 'Zip Code',
        'country': 'Country',
        'phone': 'Phone'
    }
}
).constant('emptyContact', {
      'name': '', 'email': '', 'org': '', 'address': '',
      'city': '', 'state': '', 'zipcode': '', 'country': '', 'phone': ''
})
;
