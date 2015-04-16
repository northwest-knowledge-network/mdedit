<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    version="1.0"
    xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gmd="http://www.isotc211.org/2005/gmd"
    xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:gts="http://www.isotc211.org/2005/gts"
    xmlns:gmi="http://www.isotc211.org/2005/gmi" xmlns:gmx="http://www.isotc211.org/2005/gmx"
    xmlns:gss="http://www.isotc211.org/2005/gss" xmlns:gsr="http://www.isotc211.org/2005/gsr">
    
    <!--Specify output method as xml. This will take xml document of mdedit format and transform it to ISO xml metadata format-->
    <xsl:output method = "xml" indent = "yes"/>
 
    <!-- setting up XML template when root node in mdedit XML is encountered -->
    <xsl:template match="/">
        <gmi:MI_Metadata xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gmd="http://www.isotc211.org/2005/gmd"
            xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:gts="http://www.isotc211.org/2005/gts"
            xmlns:gmi="http://www.isotc211.org/2005/gmi" xmlns:gmx="http://www.isotc211.org/2005/gmx"
            xmlns:gss="http://www.isotc211.org/2005/gss" xmlns:gsr="http://www.isotc211.org/2005/gsr"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://www.isotc211.org/2005/gmd http://www.northwestknowledge.net/iso/xsd/schema.xsd">
            <gmd:language>
                <gmd:LanguageCode codeList="http://www.loc.gov/standards/iso639-2/php/code_list.php" codeListValue="eng">eng</gmd:LanguageCode>
            </gmd:language>
            <gmd:characterSet>
                <gmd:MD_CharacterSetCode codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_CharacterSetCode" codeListValue="utf8">utf8</gmd:MD_CharacterSetCode>
            </gmd:characterSet>
            
            <!--For identification, now working with title only -->   
            <xsl:template match="/identification">
            <gmd:identificationInfo>
                <xsl:apply-templates select = "identification"/>
            </gmd:identificationInfo>
            <xsl:template match="title">
                <gmd:MD_DataIdentification>
                    <gmd:citation>
                        <gmd:CI_Citation>
                            <gmd:title>
                                <gco:CharacterString title="@title">
                                    <xsl:value-of select="/root/record/title"/>
                                </gco:CharacterString>
                            </gmd:title>
                        </gmd:CI_Citation>
                    </gmd:citation>
                </gmd:MD_DataIdentification>
            </xsl:template>

            
    <!--For  -->   
        <xsl:for-each select="/root/record/citation_contacts"></xsl:for-each>
        
        
    </xsl:template>    
</xsl:stylesheet>