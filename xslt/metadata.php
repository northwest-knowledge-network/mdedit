<?php

	function transform($xmlDoc, $xslPath) {
		$xslDoc = new DOMDocument();
		$xslDoc->load($xslPath);
	
		$proc = new XSLTProcessor();
		$proc->importStylesheet($xslDoc);
		echo $proc->transformToXML($xmlDoc);
	}

	//PHP spews warnings into the logs when you use an undefined namespace
	//in an xpath query, so this turns them off
	error_reporting(E_ALL ^ (E_NOTICE | E_WARNING));

	$iso191152Path = "https://northwestknowledge.net/custom_search/nknweb/iso_19115-2_jh.xslt";
	$iso19139Path = "https://northwestknowledge.net/custom_search/nknweb/iso_19139_jh.xslt";
	$fgdcPath = "https://northwestknowledge.net/custom_search/nknweb/fgdc_jh.xslt";
	$arcgisPath = "https://northwestknowledge.net/custom_search/nknweb/arcgis_jh.xslt";

	$XMLURL = $_GET['xml'];
	$XSLURL = $_GET['xsl'];
	$xmlDoc = new DOMDocument();
	$xmlDoc->load($XMLURL);

	$xpath = new DOMXPath($xmlDoc);
	$standard = $xpath->query("//gmi:MI_Metadata/gmd:metadataStandardVersion[1]/gco:CharacterString[1]");

	//Try to see if this is an ISO 19115-2 metadata
	if ($standard) {
		//echo "ISO 19115-2";
		transform($xmlDoc, $iso191152Path);
		return;
	}

	//If it wasn't 19115-2, see if it's 19139
	$standard = $xpath->query("/gmd:MD_Metadata/gmd:metadataStandardVersion[1]/gco:CharacterString[1]");
	if ($standard) {
		if ($standard->item(0)->textContent != "") {
			//echo "ISO 19139";
			transform($xmlDoc, $iso19139Path);
			return;
		}
	}


	//If it wasn't ISO, see if it's FGDC
	$standard = $xpath->query("//metadata/metainfo[1]/metstdv[1]");
	if ($standard) {
		if ($standard->item(0)->textContent != "") {
			//echo "FGDC CSDGM";
			transform($xmlDoc, $fgdcPath);
			return;
		}
	}

	//If it wasn't FGDC, see if it's ArcGIS 10.1
        $standard = $xpath->query("//metadata/Esri/ArcGISFormat");
        if ($standard) {
                if ($standard->item(0)->textContent != "") {
                        //echo "ArcGIS 10.1";
                        transform($xmlDoc,  $arcgisPath);
                        return;
                }
        }


	//If it wasn't ArcGIS 10.1, see if it's ArcGIS 10.0
	$standard = $xpath->query("//metadata/mdStanName[1]");
	if ($standard) {
		if ($standard->item(0)->textContent != "") {
			//echo "ArcGIS 10.0";
			transform($xmlDoc,  $arcgisPath);
			return;
		}
	}



	//We don't know what it is.  Use the transform specified on the query string.
	//echo "unrecognized";
	transform($xmlDoc, $XSLURL);
	return;

?>
