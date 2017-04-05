<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0"
    xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gmd="http://www.isotc211.org/2005/gmd"
    xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:gts="http://www.isotc211.org/2005/gts"
    xmlns:gmi="http://www.isotc211.org/2005/gmi" xmlns:gmx="http://www.isotc211.org/2005/gmx"
    xmlns:gss="http://www.isotc211.org/2005/gss" xmlns:gsr="http://www.isotc211.org/2005/gsr">

    <!--Specify output method as xml. This will take xml document of mdedit format and transform it to ISO xml metadata format-->
    <xsl:output method="xml" indent="yes"/>
    <!-- Sets up XML template when root node in mdedit XML is encountered -->
    <xsl:template match="/">
        <!-- Sets up the XML document as a metadata document and references related schema documents  -->
        <gmi:MI_Metadata xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:gco="http://www.isotc211.org/2005/gco"
            xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gml="http://www.opengis.net/gml/3.2"
            xmlns:gts="http://www.isotc211.org/2005/gts"
            xmlns:gmi="http://www.isotc211.org/2005/gmi"
            xmlns:gmx="http://www.isotc211.org/2005/gmx"
            xmlns:gss="http://www.isotc211.org/2005/gss"
            xmlns:gsr="http://www.isotc211.org/2005/gsr"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://www.isotc211.org/2005/gmd http://www.northwestknowledge.net/iso/xsd/schema.xsd">
            <!-- Selects unique file identifier from the mdedit generic xml; this id is created by the mongo db for the metadata record -->
            <gmd:fileIdentifier>
                <gco:CharacterString>nkn:<xsl:value-of select="/root/record/_id/key"
                    /></gco:CharacterString>
            </gmd:fileIdentifier>
            <!-- Sets language as English and character set as utf-8 as default for metadata record. We do not anticipate non-English entries. -->
            <gmd:language>
                <gmd:LanguageCode codeList="http://www.loc.gov/standards/iso639-2/php/code_list.php"
                    codeListValue="eng">eng</gmd:LanguageCode>
            </gmd:language>
            <gmd:characterSet>
                <gmd:MD_CharacterSetCode
                    codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_CharacterSetCode"
                    codeListValue="utf8">utf8</gmd:MD_CharacterSetCode>
            </gmd:characterSet>
            <!-- Selects hierarchy level, either dataset or collection, from the generic mdedit xml. This is selected from the dropdown list in mdedit. -->
            <xsl:if test="root/record/hierarchy_level = 'series'">
                <gmd:hierarchyLevel>
                    <gmd:MD_ScopeCode
                        codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_ScopeCode"
                        codeListValue="series">series</gmd:MD_ScopeCode>
                </gmd:hierarchyLevel>
            </xsl:if>
            <xsl:if test="root/record/hierarchy_level = 'dataset'">
                <gmd:hierarchyLevel>
                    <gmd:MD_ScopeCode
                        codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_ScopeCode"
                        codeListValue="dataset">dataset</gmd:MD_ScopeCode>
                </gmd:hierarchyLevel>
            </xsl:if>
            <!-- Sets the contact for the metadata file to be NKN because NKN is the distributor of the metadata record itself, given that it was created
        on our mdedit application. This should be true for all records created with the NKN metadata editor -->
            <gmd:contact xlink:title="NKN">
                <gmd:CI_ResponsibleParty uuid="390bb26a-184d-4c30-8b3e-d74fe0783e28">
                    <gmd:organisationName>
                        <gco:CharacterString>Northwest Knowledge Network</gco:CharacterString>
                    </gmd:organisationName>
                    <gmd:contactInfo>
                        <gmd:CI_Contact>
                            <gmd:phone>
                                <gmd:CI_Telephone>
                                    <gmd:voice>
                                        <gco:CharacterString>(208) 885-2080</gco:CharacterString>
                                    </gmd:voice>
                                </gmd:CI_Telephone>
                            </gmd:phone>
                            <gmd:address>
                                <gmd:CI_Address>
                                    <gmd:deliveryPoint>
                                        <gco:CharacterString>University of Idaho
                                            Library</gco:CharacterString>
                                    </gmd:deliveryPoint>
                                    <gmd:deliveryPoint>
                                        <gco:CharacterString>875 Perimeter Drive, MS
                                            2358</gco:CharacterString>
                                    </gmd:deliveryPoint>
                                    <gmd:city>
                                        <gco:CharacterString>Moscow</gco:CharacterString>
                                    </gmd:city>
                                    <gmd:administrativeArea>
                                        <gco:CharacterString>ID</gco:CharacterString>
                                    </gmd:administrativeArea>
                                    <gmd:postalCode>
                                        <gco:CharacterString>83844-2358</gco:CharacterString>
                                    </gmd:postalCode>
                                    <gmd:country>
                                        <gco:CharacterString>USA</gco:CharacterString>
                                    </gmd:country>
                                    <gmd:electronicMailAddress>
                                        <gco:CharacterString>info@northwestknowledge.net</gco:CharacterString>
                                    </gmd:electronicMailAddress>
                                </gmd:CI_Address>
                            </gmd:address>
                            <gmd:onlineResource>
                                <gmd:CI_OnlineResource>
                                    <gmd:linkage>
                                        <gmd:URL>http://www.northwestknowledge.net</gmd:URL>
                                    </gmd:linkage>
                                    <gmd:name>
                                        <gco:CharacterString>The home page for the Northwest
                                            Knowledge Network</gco:CharacterString>
                                    </gmd:name>
                                    <gmd:function>
                                        <gmd:CI_OnLineFunctionCode
                                            codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#CI_OnLineFunctionCode"
                                            codeListValue="information"
                                            >information</gmd:CI_OnLineFunctionCode>
                                    </gmd:function>
                                </gmd:CI_OnlineResource>
                            </gmd:onlineResource>
                        </gmd:CI_Contact>
                    </gmd:contactInfo>
                    <gmd:role>
                        <gmd:CI_RoleCode
                            codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#CI_RoleCode"
                            codeListValue="distributor">distributor</gmd:CI_RoleCode>
                    </gmd:role>
                </gmd:CI_ResponsibleParty>
            </gmd:contact>
            <!-- Selects the date when the metadata record was last updated from the mdedit generic xml. 
        This is automatically generated by the metadata editor each time a metadata record is submitted -->
            <gmd:dateStamp>
                <gco:DateTime>
                    <xsl:value-of select="/root/record/md_pub_date"/>
                </gco:DateTime>
            </gmd:dateStamp>
            <!-- Sets the metadata standard information to the 2003 version of the ISO 19139 specification of the ISO 19115 Metadata Standard. 
        This is the version we have selected for the metadata editor-->
            <gmd:metadataStandardName>
                <gco:CharacterString>ISO 19139/19115 Metadata for Datasets</gco:CharacterString>
            </gmd:metadataStandardName>
            <gmd:metadataStandardVersion>
                <gco:CharacterString>2003</gco:CharacterString>
            </gmd:metadataStandardVersion>
            <!--Identification Info -->
            <gmd:identificationInfo>
                <gmd:MD_DataIdentification>
                    <!-- Selects citation information from the mdedit generic xml, including title of the dataset; publication date of the dataset; 
        and contact info for data authors (enabled for multiple entries) -->
                    <gmd:citation>
                        <gmd:CI_Citation>
                            <gmd:title>
                                <gco:CharacterString>
                                    <xsl:value-of select="/root/record/title"/>
                                </gco:CharacterString>
                            </gmd:title>
                            <gmd:date>
                                <gmd:CI_Date>
                                    <gmd:date>
                                        <gco:Date>
                                            <xsl:value-of select="/root/record/first_pub_date"/>
                                        </gco:Date>
                                    </gmd:date>
                                    <gmd:dateType>
                                        <gmd:CI_DateTypeCode
                                            codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#CI_DateTypeCode"
                                            codeListValue="publication"
                                            >publication</gmd:CI_DateTypeCode>
                                    </gmd:dateType>
                                </gmd:CI_Date>
                            </gmd:date>
                            <!-- Enables entry for multiple authors and parses each 'item' in the citiation list in the mdedit generic xml as a separate citedResponsibleParty -->
                            <xsl:for-each select="/root/record/citation/item">
                                <gmd:citedResponsibleParty>
                                    <gmd:CI_ResponsibleParty>
                                        <gmd:individualName>
                                            <gco:CharacterString>
                                                <xsl:value-of select="name"/>
                                            </gco:CharacterString>
                                        </gmd:individualName>
                                        <gmd:contactInfo>
                                            <gmd:CI_Contact>
                                                <gmd:phone>
                                                  <gmd:CI_Telephone>
                                                  <gmd:voice>
                                                  <gco:CharacterString>
                                                  <xsl:value-of select="phone"/>
                                                  </gco:CharacterString>
                                                  </gmd:voice>
                                                  </gmd:CI_Telephone>
                                                </gmd:phone>
                                                <gmd:address>
                                                  <gmd:CI_Address>
                                                  <gmd:deliveryPoint>
                                                  <gco:CharacterString>
                                                  <xsl:value-of select="org"/>
                                                  </gco:CharacterString>
                                                  </gmd:deliveryPoint>
                                                  <gmd:deliveryPoint>
                                                  <gco:CharacterString>
                                                  <xsl:value-of select="address"/>
                                                  </gco:CharacterString>
                                                  </gmd:deliveryPoint>
                                                  <gmd:city>
                                                  <gco:CharacterString>
                                                  <xsl:value-of select="city"/>
                                                  </gco:CharacterString>
                                                  </gmd:city>
                                                  <gmd:administrativeArea>
                                                  <gco:CharacterString>
                                                  <xsl:value-of select="state"/>
                                                  </gco:CharacterString>
                                                  </gmd:administrativeArea>
                                                  <gmd:postalCode>
                                                  <gco:CharacterString>
                                                  <xsl:value-of select="zipcode"/>
                                                  </gco:CharacterString>
                                                  </gmd:postalCode>
                                                  <gmd:country>
                                                  <gco:CharacterString>
                                                  <xsl:value-of select="country"/>
                                                  </gco:CharacterString>
                                                  </gmd:country>
                                                  <gmd:electronicMailAddress>
                                                  <gco:CharacterString>
                                                  <xsl:value-of select="email"/>
                                                  </gco:CharacterString>
                                                  </gmd:electronicMailAddress>
                                                  </gmd:CI_Address>
                                                </gmd:address>
                                            </gmd:CI_Contact>
                                        </gmd:contactInfo>
                                        <!-- The role code of 'originator' is used for all dataset authors. Other choices are available, but we selected this one. See the wiki on our github for more info -->
                                        <gmd:role>
                                            <gmd:CI_RoleCode
                                                codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#CI_RoleCode"
                                                codeListValue="originator"
                                                >originator</gmd:CI_RoleCode>
                                        </gmd:role>
                                    </gmd:CI_ResponsibleParty>
                                </gmd:citedResponsibleParty>
                            </xsl:for-each>
                        </gmd:CI_Citation>
                    </gmd:citation>
                    <!-- Selects the summary paragraph about the dataset from the mdedit generic xml -->
                    <gmd:abstract>
                        <gco:CharacterString>
                            <xsl:value-of select="root/record/summary"/>
                        </gco:CharacterString>
                    </gmd:abstract>
                    <!-- Selects status of the dataset from the mdedit generic xml. This is selected from the dropdown list in mdedit. -->
                    <xsl:if test="root/record/status = 'completed'">
                        <gmd:status>
                            <gmd:MD_ProgressCode
                                codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_ProgressCode"
                                codeListValue="completed">completed</gmd:MD_ProgressCode>
                        </gmd:status>
                    </xsl:if>
                    <xsl:if test="root/record/status = 'continually updated'">
                        <gmd:status>
                            <gmd:MD_ProgressCode
                                codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_ProgressCode"
                                codeListValue="onGoing">onGoing</gmd:MD_ProgressCode>
                        </gmd:status>
                    </xsl:if>
                    <xsl:if test="root/record/status = 'in process'">
                        <gmd:status>
                            <gmd:MD_ProgressCode
                                codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_ProgressCode"
                                codeListValue="underDevelopment"
                                >underDevelopment</gmd:MD_ProgressCode>
                        </gmd:status>
                    </xsl:if>
                    <xsl:if test="root/record/status = 'planned'">
                        <gmd:status>
                            <gmd:MD_ProgressCode
                                codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_ProgressCode"
                                codeListValue="planned">planned</gmd:MD_ProgressCode>
                        </gmd:status>
                    </xsl:if>
                    <xsl:if test="root/record/progress = 'needs to be generated or updated'">
                        <gmd:status>
                            <gmd:MD_ProgressCode
                                codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_ProgressCode"
                                codeListValue="required">required</gmd:MD_ProgressCode>
                        </gmd:status>
                    </xsl:if>
                    <xsl:if test="root/record/status = 'stored in an offline facility'">
                        <gmd:status>
                            <gmd:MD_ProgressCode
                                codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_ProgressCode"
                                codeListValue="historicalArchive"
                                >historicalArchive</gmd:MD_ProgressCode>
                        </gmd:status>
                    </xsl:if>
                    <xsl:if test="root/record/status = 'no longer valid'">
                        <gmd:status>
                            <gmd:MD_ProgressCode
                                codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_ProgressCode"
                                codeListValue="obsolete">obsolete</gmd:MD_ProgressCode>
                        </gmd:status>
                    </xsl:if>
                    <!-- Selects expected update frequency of the data itself from the mdedit generic xml. This is selected from the dropdown list in mdedit.
        It is for the expected frequency with which the data will be updated. -->
                    <xsl:if test="root/record/update_frequency = 'continual'">
                        <gmd:resourceMaintenance>
                            <gmd:MD_MaintenanceInformation>
                                <gmd:maintenanceAndUpdateFrequency>
                                    <gmd:MD_MaintenanceFrequencyCode
                                        codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_MaintenanceFrequencyCode"
                                        codeListValue="continual"
                                        >continual</gmd:MD_MaintenanceFrequencyCode>
                                </gmd:maintenanceAndUpdateFrequency>
                            </gmd:MD_MaintenanceInformation>
                        </gmd:resourceMaintenance>
                    </xsl:if>
                    <xsl:if test="root/record/update_frequency = 'daily'">
                        <gmd:resourceMaintenance>
                            <gmd:MD_MaintenanceInformation>
                                <gmd:maintenanceAndUpdateFrequency>
                                    <gmd:MD_MaintenanceFrequencyCode
                                        codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_MaintenanceFrequencyCode"
                                        codeListValue="daily"
                                        >daily</gmd:MD_MaintenanceFrequencyCode>
                                </gmd:maintenanceAndUpdateFrequency>
                            </gmd:MD_MaintenanceInformation>
                        </gmd:resourceMaintenance>
                    </xsl:if>
                    <xsl:if test="root/record/update_frequency = 'weekly'">
                        <gmd:resourceMaintenance>
                            <gmd:MD_MaintenanceInformation>
                                <gmd:maintenanceAndUpdateFrequency>
                                    <gmd:MD_MaintenanceFrequencyCode
                                        codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_MaintenanceFrequencyCode"
                                        codeListValue="weekly"
                                        >weekly</gmd:MD_MaintenanceFrequencyCode>
                                </gmd:maintenanceAndUpdateFrequency>
                            </gmd:MD_MaintenanceInformation>
                        </gmd:resourceMaintenance>
                    </xsl:if>
                    <xsl:if test="root/record/update_frequency = 'fortnightly'">
                        <gmd:resourceMaintenance>
                            <gmd:MD_MaintenanceInformation>
                                <gmd:maintenanceAndUpdateFrequency>
                                    <gmd:MD_MaintenanceFrequencyCode
                                        codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_MaintenanceFrequencyCode"
                                        codeListValue="fortnightly"
                                        >fortnightly</gmd:MD_MaintenanceFrequencyCode>
                                </gmd:maintenanceAndUpdateFrequency>
                            </gmd:MD_MaintenanceInformation>
                        </gmd:resourceMaintenance>
                    </xsl:if>
                    <xsl:if test="root/record/update_frequency = 'monthly'">
                        <gmd:resourceMaintenance>
                            <gmd:MD_MaintenanceInformation>
                                <gmd:maintenanceAndUpdateFrequency>
                                    <gmd:MD_MaintenanceFrequencyCode
                                        codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_MaintenanceFrequencyCode"
                                        codeListValue="monthly"
                                        >monthly</gmd:MD_MaintenanceFrequencyCode>
                                </gmd:maintenanceAndUpdateFrequency>
                            </gmd:MD_MaintenanceInformation>
                        </gmd:resourceMaintenance>
                    </xsl:if>
                    <xsl:if test="root/record/update_frequency = 'quarterly'">
                        <gmd:resourceMaintenance>
                            <gmd:MD_MaintenanceInformation>
                                <gmd:maintenanceAndUpdateFrequency>
                                    <gmd:MD_MaintenanceFrequencyCode
                                        codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_MaintenanceFrequencyCode"
                                        codeListValue="quarterly"
                                        >quarterly</gmd:MD_MaintenanceFrequencyCode>
                                </gmd:maintenanceAndUpdateFrequency>
                            </gmd:MD_MaintenanceInformation>
                        </gmd:resourceMaintenance>
                    </xsl:if>
                    <xsl:if test="root/record/update_frequency = 'biannually'">
                        <gmd:resourceMaintenance>
                            <gmd:MD_MaintenanceInformation>
                                <gmd:maintenanceAndUpdateFrequency>
                                    <gmd:MD_MaintenanceFrequencyCode
                                        codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_MaintenanceFrequencyCode"
                                        codeListValue="biannually"
                                        >biannually</gmd:MD_MaintenanceFrequencyCode>
                                </gmd:maintenanceAndUpdateFrequency>
                            </gmd:MD_MaintenanceInformation>
                        </gmd:resourceMaintenance>
                    </xsl:if>
                    <xsl:if test="root/record/update_frequency = 'annually'">
                        <gmd:resourceMaintenance>
                            <gmd:MD_MaintenanceInformation>
                                <gmd:maintenanceAndUpdateFrequency>
                                    <gmd:MD_MaintenanceFrequencyCode
                                        codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_MaintenanceFrequencyCode"
                                        codeListValue="asNeeded"
                                        >annually</gmd:MD_MaintenanceFrequencyCode>
                                </gmd:maintenanceAndUpdateFrequency>
                            </gmd:MD_MaintenanceInformation>
                        </gmd:resourceMaintenance>
                    </xsl:if>
                    <xsl:if test="root/record/update_frequency = 'as needed'">
                        <gmd:resourceMaintenance>
                            <gmd:MD_MaintenanceInformation>
                                <gmd:maintenanceAndUpdateFrequency>
                                    <gmd:MD_MaintenanceFrequencyCode
                                        codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_MaintenanceFrequencyCode"
                                        codeListValue="asNeeded"
                                        >asNeeded</gmd:MD_MaintenanceFrequencyCode>
                                </gmd:maintenanceAndUpdateFrequency>
                            </gmd:MD_MaintenanceInformation>
                        </gmd:resourceMaintenance>
                    </xsl:if>
                    <xsl:if test="root/record/update_frequency = 'irregular'">
                        <gmd:resourceMaintenance>
                            <gmd:MD_MaintenanceInformation>
                                <gmd:maintenanceAndUpdateFrequency>
                                    <gmd:MD_MaintenanceFrequencyCode
                                        codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_MaintenanceFrequencyCode"
                                        codeListValue="irregular"
                                        >irregular</gmd:MD_MaintenanceFrequencyCode>
                                </gmd:maintenanceAndUpdateFrequency>
                            </gmd:MD_MaintenanceInformation>
                        </gmd:resourceMaintenance>
                    </xsl:if>
                    <xsl:if test="root/record/update_frequency = 'not planned'">
                        <gmd:resourceMaintenance>
                            <gmd:MD_MaintenanceInformation>
                                <gmd:maintenanceAndUpdateFrequency>
                                    <gmd:MD_MaintenanceFrequencyCode
                                        codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_MaintenanceFrequencyCode"
                                        codeListValue="notPlanned"
                                        >notPlanned</gmd:MD_MaintenanceFrequencyCode>
                                </gmd:maintenanceAndUpdateFrequency>
                            </gmd:MD_MaintenanceInformation>
                        </gmd:resourceMaintenance>
                    </xsl:if>
                    <xsl:if test="root/record/update_frequency = 'unknown'">
                        <gmd:resourceMaintenance>
                            <gmd:MD_MaintenanceInformation>
                                <gmd:maintenanceAndUpdateFrequency>
                                    <gmd:MD_MaintenanceFrequencyCode
                                        codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_MaintenanceFrequencyCode"
                                        codeListValue="unknown"
                                        >unknown</gmd:MD_MaintenanceFrequencyCode>
                                </gmd:maintenanceAndUpdateFrequency>
                            </gmd:MD_MaintenanceInformation>
                        </gmd:resourceMaintenance>
                    </xsl:if>
                    <!-- Selects the theme keywords from the mdedit generic xml. Enables for multiple entires from a list. Defaults for projects will be built into the 
        frontend in html, at least for now-->
                    <gmd:descriptiveKeywords>
                        <gmd:MD_Keywords>
                            <!-- Enables entry for multiple keywords and parses each 'item' in the keyword list in the mdedit generic xml as a separate keyword -->
                            <xsl:for-each select="/root/record/thematic_keywords/item">
                                <gmd:keyword>
                                    <gco:CharacterString>
                                        <xsl:value-of select="word"/>
                                    </gco:CharacterString>
                                </gmd:keyword>
                            </xsl:for-each>
                            <!-- Sets the type of keyword for all above as theme keywords. -->
                            <gmd:type>
                                <gmd:MD_KeywordTypeCode codeSpace="ISOTC211/19115"
                                    codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_KeywordTypeCode"
                                    codeListValue="theme">theme</gmd:MD_KeywordTypeCode>
                            </gmd:type>
                        </gmd:MD_Keywords>
                    </gmd:descriptiveKeywords>
                    <!-- Selects the place keywords from the mdedit generic xml. Enables for multiple entires from a list. Defaults for projects will be built into the 
        frontend in html, at least for now-->
                    <gmd:descriptiveKeywords>
                        <gmd:MD_Keywords>
                            <!-- Enables entry for multiple keywords and parses each 'item' in the keyword list in the mdedit generic xml as a separate keyword-->
                            <xsl:for-each select="/root/record/place_keywords/item">
                                <gmd:keyword>
                                    <gco:CharacterString>
                                        <xsl:value-of select="word"/>
                                    </gco:CharacterString>
                                </gmd:keyword>
                            </xsl:for-each>
                            <!-- Sets the type of keyword for all above as place keywords. -->
                            <gmd:type>
                                <gmd:MD_KeywordTypeCode codeSpace="ISOTC211/19115"
                                    codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_KeywordTypeCode"
                                    codeListValue="place">place</gmd:MD_KeywordTypeCode>
                            </gmd:type>
                        </gmd:MD_Keywords>
                    </gmd:descriptiveKeywords>
                    <!-- Sets codes for other constraints as acceess and use constraints. These apply to the text provided in the next section. -->
                    <gmd:resourceConstraints>
                        <gmd:MD_LegalConstraints>
                            <gmd:accessConstraints>
                                <gmd:MD_RestrictionCode
                                    codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_RestrictionCode"
                                    codeListValue="otherRestrictions"
                                    >otherRestrictions</gmd:MD_RestrictionCode>
                            </gmd:accessConstraints>
                            <gmd:useConstraints>
                                <gmd:MD_RestrictionCode
                                    codeList="http:http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_RestrictionCode"
                                    codeListValue="otherRestrictions"
                                    >otherRestrictions</gmd:MD_RestrictionCode>
                            </gmd:useConstraints>
                            <!-- Selects text for general use/access restrictions and license from the mdedit generic xml. 
        Defaults for projects will be built into the front-end, for now -->
                            <gmd:otherConstraints>
                                <xsl:if test="root/record/use_restrictions != ''">
                                    <gco:CharacterString>
                                        <xsl:value-of select="root/record/use_restrictions"/>
                                    </gco:CharacterString>
                                </xsl:if>
                            </gmd:otherConstraints>
                        </gmd:MD_LegalConstraints>
                    </gmd:resourceConstraints>
                    <!-- Uses an IF statement to select spatial representation type -->
                    <xsl:if test="root/record/spatial_dtype = 'vector'">
                        <gmd:spatialRepresentationType>
                            <gmd:MD_SpatialRepresentationTypeCode
                                codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_SpatialRepresentationTypeCode"
                                codeListValue="vector">vector</gmd:MD_SpatialRepresentationTypeCode>
                        </gmd:spatialRepresentationType>
                    </xsl:if>
                    <xsl:if test="root/record/spatial_dtype = 'grid'">
                        <gmd:spatialRepresentationType>
                            <gmd:MD_SpatialRepresentationTypeCode
                                codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_SpatialRepresentationTypeCode"
                                codeListValue="grid">grid</gmd:MD_SpatialRepresentationTypeCode>
                        </gmd:spatialRepresentationType>
                    </xsl:if>
                    <xsl:if test="root/record/spatial_dtype = 'table or text'">
                        <gmd:spatialRepresentationType>
                            <gmd:MD_SpatialRepresentationTypeCode
                                codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_SpatialRepresentationTypeCode"
                                codeListValue="textTable"
                                >textTable</gmd:MD_SpatialRepresentationTypeCode>
                        </gmd:spatialRepresentationType>
                    </xsl:if>
                    <xsl:if test="root/record/spatial_dtype = 'triangulated irregular network'">
                        <gmd:spatialRepresentationType>
                            <gmd:MD_SpatialRepresentationTypeCode
                                codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_SpatialRepresentationTypeCode"
                                codeListValue="tin">tin</gmd:MD_SpatialRepresentationTypeCode>
                        </gmd:spatialRepresentationType>
                    </xsl:if>
                    <xsl:if test="root/record/spatial_dtype = 'stereographic imaging'">
                        <gmd:spatialRepresentationType>
                            <gmd:MD_SpatialRepresentationTypeCode
                                codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_SpatialRepresentationTypeCode"
                                codeListValue="stereoModel"
                                >stereoModel</gmd:MD_SpatialRepresentationTypeCode>
                        </gmd:spatialRepresentationType>
                    </xsl:if>
                    <xsl:if test="root/record/spatial_dtype = 'video recording of a scene'">
                        <gmd:spatialRepresentationType>
                            <gmd:MD_SpatialRepresentationTypeCode
                                codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_SpatialRepresentationTypeCode"
                                codeListValue="video">video</gmd:MD_SpatialRepresentationTypeCode>
                        </gmd:spatialRepresentationType>
                    </xsl:if>
                    <!-- Sets language as English and character set as utf-8 as default for the data. We do not anticipate non-English entries. -->
                    <gmd:language>
                        <gmd:LanguageCode
                            codeList="http://www.loc.gov/standards/iso639-2/php/code_list.php"
                            codeListValue="eng">eng</gmd:LanguageCode>
                    </gmd:language>
                    <!-- Selects the topic category from the mdedit generic xml. This is selected from a dropdown list in mdedit. -->
                    <xsl:for-each select="/root/record/topic_category/item">
                        <gmd:topicCategory>
                            <gmd:MD_TopicCategoryCode>
                                <xsl:value-of select="word"/>
                            </gmd:MD_TopicCategoryCode>
                        </gmd:topicCategory>
                    </xsl:for-each>
                    <!-- Selects the decicmal degree coordinates entered for the 4 geographic bounds (rectangular) of the dataset from the mdedit generic xml. 
        These values need to constrained to prevent entries that don't meet the criteria of geographic bounding coordinates.-->
                    <gmd:extent>
                        <gmd:EX_Extent>
                            <gmd:geographicElement>
                                <gmd:EX_GeographicBoundingBox>
                                    <gmd:westBoundLongitude>
                                        <gco:Decimal>
                                            <xsl:value-of select="root/record/west_lon"/>
                                        </gco:Decimal>
                                    </gmd:westBoundLongitude>
                                    <gmd:eastBoundLongitude>
                                        <gco:Decimal>
                                            <xsl:value-of select="root/record/east_lon"/>
                                        </gco:Decimal>
                                    </gmd:eastBoundLongitude>
                                    <gmd:southBoundLatitude>
                                        <gco:Decimal>
                                            <xsl:value-of select="root/record/south_lat"/>
                                        </gco:Decimal>
                                    </gmd:southBoundLatitude>
                                    <gmd:northBoundLatitude>
                                        <gco:Decimal>
                                            <xsl:value-of select="root/record/north_lat"/>
                                        </gco:Decimal>
                                    </gmd:northBoundLatitude>
                                </gmd:EX_GeographicBoundingBox>
                            </gmd:geographicElement>
                            <!-- Selects the date/time inputs for the start and end dates/times for the dataset iteself from the mdedit generic xml. -->
                            <gmd:temporalElement>
                                <gmd:EX_TemporalExtent>
                                    <gmd:extent>
                                        <gml:TimePeriod gml:id="boundingTimePeriodExtent">
                                            <gml:beginPosition>
                                                <xsl:value-of select="root/record/start_date"/>
                                            </gml:beginPosition>
                                            <gml:endPosition>
                                                <xsl:value-of select="root/record/end_date"/>
                                            </gml:endPosition>
                                        </gml:TimePeriod>
                                    </gmd:extent>
                                </gmd:EX_TemporalExtent>
                            </gmd:temporalElement>
                        </gmd:EX_Extent>
                    </gmd:extent>
                </gmd:MD_DataIdentification>
            </gmd:identificationInfo>
            <!--Distribution Info -->
            
            <gmd:distributionInfo>
                <gmd:MD_Distribution>

                <!-- Sets the contact block for NKN as the distributor of the data.
        This will be enabled as an 'if' statement based on if the download_url looks like an NKN download link -->
                    <xsl:if test="contains(/root/record/download_url, 'https://www.northwestknowledge.net/data/download.php')">
                        <gmd:distributor>
                            <gmd:MD_Distributor>
                                <gmd:distributorContact xlink:title="NKN">
                                    <gmd:CI_ResponsibleParty uuid="390bb26a-184d-4c30-8b3e-d74fe0783e28">
                                        <gmd:organisationName>
                                            <gco:CharacterString>Northwest Knowledge Network</gco:CharacterString>
                                        </gmd:organisationName>
                                        <gmd:contactInfo>
                                            <gmd:CI_Contact>
                                                <gmd:phone>
                                                    <gmd:CI_Telephone>
                                                        <gmd:voice>
                                                            <gco:CharacterString>(208) 885-8456</gco:CharacterString>
                                                        </gmd:voice>
                                                    </gmd:CI_Telephone>
                                                </gmd:phone>
                                                <gmd:address>
                                                    <gmd:CI_Address>
                                                        <gmd:deliveryPoint>
                                                            <gco:CharacterString>University of Idaho Library</gco:CharacterString>
                                                        </gmd:deliveryPoint>
                                                        <gmd:deliveryPoint>
                                                            <gco:CharacterString>875 Perimeter Drive, MS 2358</gco:CharacterString>
                                                        </gmd:deliveryPoint>
                                                        <gmd:city>
                                                            <gco:CharacterString>Moscow</gco:CharacterString>
                                                        </gmd:city>
                                                        <gmd:administrativeArea>
                                                            <gco:CharacterString>ID</gco:CharacterString>
                                                        </gmd:administrativeArea>
                                                        <gmd:postalCode>
                                                            <gco:CharacterString>83844-2350</gco:CharacterString>
                                                        </gmd:postalCode>
                                                        <gmd:country>
                                                            <gco:CharacterString>USA</gco:CharacterString>
                                                        </gmd:country>
                                                        <gmd:electronicMailAddress>
                                                            <gco:CharacterString>info@northwestknowledge.net</gco:CharacterString>
                                                        </gmd:electronicMailAddress>
                                                    </gmd:CI_Address>
                                                </gmd:address>
                                                <gmd:onlineResource>
                                                    <gmd:CI_OnlineResource>
                                                        <gmd:linkage>
                                                            <gmd:URL>http://www.northwestknowledge.net</gmd:URL>
                                                        </gmd:linkage>
                                                        <gmd:name>
                                                            <gco:CharacterString>The home page for the Northwest Knowledge Network</gco:CharacterString>
                                                        </gmd:name>
                                                    </gmd:CI_OnlineResource>
                                                </gmd:onlineResource>
                                            </gmd:CI_Contact>
                                        </gmd:contactInfo>
                                        <gmd:role>
                                            <gmd:CI_RoleCode codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#CI_RoleCode" codeListValue="distributor">distributor</gmd:CI_RoleCode>
                                        </gmd:role>
                                    </gmd:CI_ResponsibleParty>
                                </gmd:distributorContact>
                                <gmd:distributorTransferOptions>
                                    <gmd:MD_DigitalTransferOptions>
                                        <gmd:onLine>
                                            <gmd:CI_OnlineResource>
                                                <gmd:linkage>
                                                    <gmd:URL>
                                                        <xsl:value-of select="/root/record/download_url"/>
                                                    </gmd:URL>
                                                </gmd:linkage>
                                                <gmd:function>
                                                    <gmd:CI_OnLineFunctionCode codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#CI_OnLineFunctionCode" codeListValue="download">download</gmd:CI_OnLineFunctionCode>
                                                </gmd:function>
                                            </gmd:CI_OnlineResource>
                                        </gmd:onLine>
                                    </gmd:MD_DigitalTransferOptions>
                                </gmd:distributorTransferOptions>
                            </gmd:MD_Distributor>                                   
                        </gmd:distributor>
                    </xsl:if>
                    
                    <!-- Selects distribution information from the mdedit generic xml, including contact info and associated online resources for 
        data distributors (enabled for multiple entries). -->
                    <!-- Enables entry for multiple distributors and parses each 'item' in the citiation list in the mdedit generic xml as a separate distributors -->
                    <xsl:for-each select="/root/record/access/item">
                        <xsl:variable name="contact" select="."/>
                        <gmd:distributor>
                            <gmd:MD_Distributor>
                                <gmd:distributorContact>
                                    <gmd:CI_ResponsibleParty>
                                        <gmd:organisationName>
                                            <gco:CharacterString>
                                                <xsl:value-of select="name"/>
                                            </gco:CharacterString>
                                        </gmd:organisationName>
                                        <gmd:contactInfo>
                                            <gmd:CI_Contact>
                                                <gmd:phone>
                                                  <gmd:CI_Telephone>
                                                  <gmd:voice>
                                                  <gco:CharacterString>
                                                  <xsl:value-of select="phone"/>
                                                  </gco:CharacterString>
                                                  </gmd:voice>
                                                  </gmd:CI_Telephone>
                                                </gmd:phone>
                                                <gmd:address>
                                                  <gmd:CI_Address>
                                                  <gmd:deliveryPoint>
                                                  <gco:CharacterString>
                                                  <xsl:value-of select="name"/>
                                                  </gco:CharacterString>
                                                  </gmd:deliveryPoint>
                                                  <gmd:deliveryPoint>
                                                  <gco:CharacterString>
                                                  <xsl:value-of select="address"/>
                                                  </gco:CharacterString>
                                                  </gmd:deliveryPoint>
                                                  <gmd:city>
                                                  <gco:CharacterString>
                                                  <xsl:value-of select="city"/>
                                                  </gco:CharacterString>
                                                  </gmd:city>
                                                  <gmd:administrativeArea>
                                                  <gco:CharacterString>
                                                  <xsl:value-of select="state"/>
                                                  </gco:CharacterString>
                                                  </gmd:administrativeArea>
                                                  <gmd:postalCode>
                                                  <gco:CharacterString>
                                                  <xsl:value-of select="zipcode"/>
                                                  </gco:CharacterString>
                                                  </gmd:postalCode>
                                                  <gmd:country>
                                                  <gco:CharacterString>
                                                  <xsl:value-of select="country"/>
                                                  </gco:CharacterString>
                                                  </gmd:country>
                                                  <gmd:electronicMailAddress>
                                                  <gco:CharacterString>
                                                  <xsl:value-of select="email"/>
                                                  </gco:CharacterString>
                                                  </gmd:electronicMailAddress>
                                                  </gmd:CI_Address>
                                                </gmd:address>
                                            </gmd:CI_Contact>
                                        </gmd:contactInfo>
                                        <gmd:role>
                                            <gmd:CI_RoleCode
                                                codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#CI_RoleCode"
                                                codeListValue="distributor"
                                                >distributor</gmd:CI_RoleCode>
                                        </gmd:role>
                                    </gmd:CI_ResponsibleParty>
                                </gmd:distributorContact>
                                <gmd:distributorTransferOptions>
                                    <gmd:MD_DigitalTransferOptions>
                                        <xsl:for-each select="$contact/resource_url/item">
                                            <gmd:onLine>
                                                <gmd:CI_OnlineResource>
                                                  <gmd:linkage>
                                                  <gmd:URL>
                                                  <xsl:value-of select="."/>
                                                  </gmd:URL>
                                                  </gmd:linkage>
                                                  <gmd:function>
                                                  <gmd:CI_OnLineFunctionCode
                                                  codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#CI_OnLineFunctionCode"
                                                  codeListValue="download"
                                                  >download</gmd:CI_OnLineFunctionCode>
                                                  </gmd:function>
                                                </gmd:CI_OnlineResource>
                                            </gmd:onLine>
                                        </xsl:for-each>
                                    </gmd:MD_DigitalTransferOptions>
                                </gmd:distributorTransferOptions>
                            </gmd:MD_Distributor>
                        </gmd:distributor>
                    </xsl:for-each>
                    
                    <!-- Entries for anonymous resources, those unrelated to any data access contact -->
                    <xsl:for-each select="/root/record/online/item/url[not(.=/root/record/access/item/resource_url/item)]">
                        <gmd:distributor>
                            <gmd:MD_Distributor>
                                <gmd:distributorContact gco:nilReason="unknown" />
                                <gmd:distributorTransferOptions>
                                    <gmd:MD_DigitalTransferOptions>
                                        <gmd:onLine>
                                            <gmd:CI_OnlineResource>
                                                <gmd:linkage>
                                                    <gmd:URL>
                                                        <xsl:value-of select="."/>
                                                    </gmd:URL>
                                                </gmd:linkage>
                                            </gmd:CI_OnlineResource>
                                        </gmd:onLine>
                                    </gmd:MD_DigitalTransferOptions>
                                </gmd:distributorTransferOptions>
                            </gmd:MD_Distributor>
                        </gmd:distributor>
                    </xsl:for-each>
                    
                </gmd:MD_Distribution>
            </gmd:distributionInfo>
            <gmd:dataQualityInfo>
                <gmd:DQ_DataQuality>
                    <gmd:scope>
                        <gmd:DQ_Scope>
                            <gmd:level>
                                <gmd:MD_ScopeCode
                                    codeList="http://www.ngdc.noaa.gov/metadata/published/xsd/schema/resources/Codelist/gmxCodelists.xml#MD_ScopeCode"
                                    codeListValue="dataset">dataset</gmd:MD_ScopeCode>
                            </gmd:level>
                        </gmd:DQ_Scope>
                    </gmd:scope>
                    <gmd:lineage>
                        <gmd:LI_Lineage>
                            <gmd:processStep>
                                <gmd:LI_ProcessStep>
                                    <gmd:description>
                                        <gco:CharacterString>
                                            <xsl:value-of select="/root/record/research_methods"/>
                                        </gco:CharacterString>
                                    </gmd:description>
                                </gmd:LI_ProcessStep>
                            </gmd:processStep>
                        </gmd:LI_Lineage>
                    </gmd:lineage>
                </gmd:DQ_DataQuality>
            </gmd:dataQualityInfo>
            <!-- Metadata background maintenance info, mostly hidden from mdedit web front end  -->
            <gmd:metadataConstraints>
                <!-- Sets the license use constraints according to NKN's terms of service and default use of a Creative Commons license. 
			     Because NKN is the distributor of the metadata record itself, this license will apply to all records created with the NKN metadata editor -->
                <gmd:MD_Constraints>
                    <gmd:useLimitation>
                        <gco:CharacterString>This metadata record is licensed under a Creative
                            Commons Attribution-NonCommercial-ShareAlike License. For more
                            information, see
                            http://www.northwestknowledge.net/terms_of_service</gco:CharacterString>
                    </gmd:useLimitation>
                </gmd:MD_Constraints>
            </gmd:metadataConstraints>
            <gmd:metadataMaintenance>
                <!-- Sets update frequency of metadata in terms that NKN uses for all metadata records it maintains. This frequency is "As Needed." 
			     Because NKN is the distributor of the metadata record itself, these maintenance terms will apply to all records created with the NKN metadata editor -->
                <gmd:MD_MaintenanceInformation>
                    <gmd:maintenanceAndUpdateFrequency>
                        <gmd:MD_MaintenanceFrequencyCode
                            codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml"
                            codeListValue="asNeeded">asNeeded</gmd:MD_MaintenanceFrequencyCode>
                    </gmd:maintenanceAndUpdateFrequency>
                    <gmd:maintenanceNote>
                        <gco:CharacterString>This metadata record may be updated when information
                            within it becomes obsolete.</gco:CharacterString>
                    </gmd:maintenanceNote>
                    <!-- Sets the contact for maintenace of the metadata file to be NKN because NKN is the distributor of the metadata record itself, given that it was created
        on our mdedit application. This should be true for all records created with the NKN metadata editor -->
                    <gmd:contact xlink:title="NKN">
                        <gmd:CI_ResponsibleParty uuid="0f370b7f-08ed-4727-b3f8-e98932ecd5e7">
                            <gmd:organisationName>
                                <gco:CharacterString>Northwest Knowledge
                                    Network</gco:CharacterString>
                            </gmd:organisationName>
                            <gmd:contactInfo>
                                <gmd:CI_Contact>
                                    <gmd:phone>
                                        <gmd:CI_Telephone>
                                            <gmd:voice>
                                                <gco:CharacterString>(208)
                                                  885-2080</gco:CharacterString>
                                            </gmd:voice>
                                        </gmd:CI_Telephone>
                                    </gmd:phone>
                                    <gmd:address>
                                        <gmd:CI_Address>
                                            <gmd:deliveryPoint>
                                                <gco:CharacterString>University of Idaho
                                                  Library</gco:CharacterString>
                                            </gmd:deliveryPoint>
                                            <gmd:deliveryPoint>
                                                <gco:CharacterString>875 Perimeter Drive, MS
                                                  2358</gco:CharacterString>
                                            </gmd:deliveryPoint>
                                            <gmd:city>
                                                <gco:CharacterString>Moscow</gco:CharacterString>
                                            </gmd:city>
                                            <gmd:administrativeArea>
                                                <gco:CharacterString>ID</gco:CharacterString>
                                            </gmd:administrativeArea>
                                            <gmd:postalCode>
                                                <gco:CharacterString>83844-2358</gco:CharacterString>
                                            </gmd:postalCode>
                                            <gmd:country>
                                                <gco:CharacterString>USA</gco:CharacterString>
                                            </gmd:country>
                                            <gmd:electronicMailAddress>
                                                <gco:CharacterString>info@northwestknowledge.net</gco:CharacterString>
                                            </gmd:electronicMailAddress>
                                        </gmd:CI_Address>
                                    </gmd:address>
                                    <gmd:onlineResource>
                                        <gmd:CI_OnlineResource>
                                            <gmd:linkage>
                                                <gmd:URL>http://www.northwestknowledge.net</gmd:URL>
                                            </gmd:linkage>
                                            <gmd:name>
                                                <gco:CharacterString>The home page for the Northwest
                                                  Knowledge Network</gco:CharacterString>
                                            </gmd:name>
                                            <gmd:function>
                                                <gmd:CI_OnLineFunctionCode
                                                  codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#CI_OnLineFunctionCode"
                                                  codeListValue="information"
                                                  >information</gmd:CI_OnLineFunctionCode>
                                            </gmd:function>
                                        </gmd:CI_OnlineResource>
                                    </gmd:onlineResource>
                                </gmd:CI_Contact>
                            </gmd:contactInfo>
                            <gmd:role>
                                <gmd:CI_RoleCode
                                    codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#CI_RoleCode"
                                    codeListValue="custodian">custodian</gmd:CI_RoleCode>
                            </gmd:role>
                        </gmd:CI_ResponsibleParty>
                    </gmd:contact>
                </gmd:MD_MaintenanceInformation>
            </gmd:metadataMaintenance>
        </gmi:MI_Metadata>
    </xsl:template>
</xsl:stylesheet>
