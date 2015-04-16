<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0"
    xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gmd="http://www.isotc211.org/2005/gmd"
    xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:gts="http://www.isotc211.org/2005/gts"
    xmlns:gmi="http://www.isotc211.org/2005/gmi" xmlns:gmx="http://www.isotc211.org/2005/gmx"
    xmlns:gss="http://www.isotc211.org/2005/gss" xmlns:gsr="http://www.isotc211.org/2005/gsr">

    <!--Specify output method as xml. This will take xml document of mdedit format and transform it to ISO xml metadata format-->
    <xsl:output method="xml" indent="yes"/>

    <!-- setting up XML template when root node in mdedit XML is encountered -->
    <xsl:template match="/">
        <gmi:MI_Metadata xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gmd="http://www.isotc211.org/2005/gmd"
            xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:gts="http://www.isotc211.org/2005/gts"
            xmlns:gmi="http://www.isotc211.org/2005/gmi" xmlns:gmx="http://www.isotc211.org/2005/gmx"
            xmlns:gss="http://www.isotc211.org/2005/gss" xmlns:gsr="http://www.isotc211.org/2005/gsr"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://www.isotc211.org/2005/gmd http://www.northwestknowledge.net/iso/xsd/schema.xsd">
            <gmd:fileIdentifier>
                <xsl:value-of select="/root/record/id/key"/>
            </gmd:fileIdentifier>
            <gmd:language>
                <gmd:LanguageCode codeList="http://www.loc.gov/standards/iso639-2/php/code_list.php"
                codeListValue="eng">eng</gmd:LanguageCode>
            </gmd:language>
            <gmd:characterSet>
                <gmd:MD_CharacterSetCode
                codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_CharacterSetCode"
                codeListValue="utf8">utf8</gmd:MD_CharacterSetCode>
            </gmd:characterSet>
            <gmd:hierarchyLevel>
                <!--    
                <xsl:value-of select=""/> 
                -->
            </gmd:hierarchyLevel>
            <gmd:contact>
                <!--      
                <xsl:for-each select="">
                    <xsl:value-of select=""/>
                </xsl:for-each>
                -->
            </gmd:contact>
            <gmd:dateStamp>
                <xsl:value-of select="/root/record/last_mod_date/key"/>
            </gmd:dateStamp>
            <gmd:metadataStandardName>
                <gco:CharacterString>ISO 19139/19115 Metadata for Datasets</gco:CharacterString>
            </gmd:metadataStandardName>
            <gmd:metadataStandardVersion>
                <gco:CharacterString>2003</gco:CharacterString>
            </gmd:metadataStandardVersion>
            <gmd:dataSetURI> 
                <!--
                <xsl:value-of select=""/>
                 -->
            </gmd:dataSetURI>   

        <!--For identification-->
            <gmd:identificationInfo>
                <gmd:MD_DataIdentification>
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
                                            <xsl:value-of select="/root/record/first_pub_date/key"/>
                                        </gco:Date>
                                    </gmd:date>
                                </gmd:CI_Date>
                            </gmd:date>
                            <xsl:for-each select="/root/record/citation/item">
                            <gmd:citedResponsibleParty>
                                <gmd:CI_ResponsibleParty>
                                    <gmd:individualName>
                                        <gco:CharacterString>
                                           <xsl:value-of select="/root/record/citation/item/name"/>     
                                        </gco:CharacterString>
                                    </gmd:individualName>
                                    <gmd:contactInfo>
                                        <gmd:CI_Contact>
                                            <gmd:phone>
                                                <gmd:CI_Telephone>
                                                    <gmd:voice>
                                                        <gco:CharacterString>
                                                            <xsl:value-of select="/root/record/citation/item/phone"/>
                                                        </gco:CharacterString>
                                                    </gmd:voice>
                                                </gmd:CI_Telephone>
                                            </gmd:phone>
                                            <gmd:address>
                                                <gmd:CI_Address>
                                                    <gmd:deliveryPoint>
                                                        <gco:CharacterString>
                                                            <xsl:value-of select="/root/record/citation/item/name"/>
                                                        </gco:CharacterString>
                                                    </gmd:deliveryPoint>
                                                    <gmd:deliveryPoint>
                                                        <gco:CharacterString>
                                                            <xsl:value-of select="/root/record/citation/item/org"/>
                                                        </gco:CharacterString>
                                                    </gmd:deliveryPoint>
                                                    <gmd:deliveryPoint>
                                                        <gco:CharacterString>
                                                            <xsl:value-of select="/root/record/citation/item/address"/>
                                                        </gco:CharacterString>
                                                    </gmd:deliveryPoint>
                                                    <gmd:city>
                                                        <gco:CharacterString>
                                                            <xsl:value-of select="/root/record/citation/item/city"/>
                                                        </gco:CharacterString>
                                                    </gmd:city>
                                                    <gmd:administrativeArea>
                                                        <gco:CharacterString>
                                                            <xsl:value-of select="/root/record/citation/item/state"/>
                                                        </gco:CharacterString>
                                                    </gmd:administrativeArea>
                                                    <gmd:postalCode>
                                                        <gco:CharacterString>
                                                            <xsl:value-of select="/root/record/citation/item/zipcode"/>
                                                        </gco:CharacterString>
                                                    </gmd:postalCode>
                                                    <gmd:country>
                                                        <gco:CharacterString>
                                                            <xsl:value-of select="/root/record/citation/item/country"/>
                                                        </gco:CharacterString>
                                                    </gmd:country>
                                                    <!--
                                                    <gmd:electronicMailAddres>
                                                        <gco:CharacterString>
                                                            <xsl:value-of select="/root/record/citation/item/email"/>
                                                        </gco:CharacterString>
                                                    </gmd:electronicMailAddres>
                                                    -->
                                                </gmd:CI_Address>
                                            </gmd:address>
                                        </gmd:CI_Contact>
                                    </gmd:contactInfo>
                                    <gmd:role>
                                        <gmd:CI_RoleCode codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#CI_RoleCode" codeListValue="originator">originator</gmd:CI_RoleCode>
                                    </gmd:role>
                                </gmd:CI_ResponsibleParty>
                            </gmd:citedResponsibleParty>
                            </xsl:for-each>
                        </gmd:CI_Citation>
                    </gmd:citation>
                    <gmd:abstract> 
                        <xsl:value-of select="root/record/summary"/>
                    </gmd:abstract>
                    <gmd:status>
                        <!--
                        <xsl:value-of select=""/>
                        -->
                    </gmd:status>
                    <gmd:resourceMaintenance> <!-- may want this to be a selection in the future. for now default is "not planned"-->
                        <gmd:MD_MaintenanceInformation>
                            <gmd:maintenanceAndUpdateFrequency>
                                <gmd:MD_MaintenanceFrequencyCode codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_MaintenanceFrequencyCode" codeListValue="notPlanned">notPlanned</gmd:MD_MaintenanceFrequencyCode>
                            </gmd:maintenanceAndUpdateFrequency>
                        </gmd:MD_MaintenanceInformation>
                    </gmd:resourceMaintenance>
                    <gmd:descriptiveKeywords>
                        <gmd:MD_Keywords>
                            <!-- for MILES keywords to automatically be entered if user selects Yes to a field asking Yes/No is this entry related to MILES?
                            <xsl:if test="/root/record/MILES ='Yes'">
                            <gmd:keyword>
                                <gco:CharacterString>MILES</gco:CharacterString>
                            </gmd:keyword>
                            <gmd:keyword>
                                <gco:CharacterString>EPSCoR</gco:CharacterString>
                            </gmd:keyword>
                            <gmd:keyword>
                                <gco:CharacterString>IIA-1301792</gco:CharacterString>
                            </gmd:keyword>
                            </xsl:if>
                            -->
                            <!-- will need for each to have a keyword entry for each. also need to hard code/choice MILES project defaults
                            <xsl:for-each select=""></xsl:for-each> -->
                            <gmd:keyword>
                                <gco:CharacterString>
                                    <xsl:value-of select="/root/record/theme_keywords"/>
                                </gco:CharacterString>
                            </gmd:keyword>
                            <gmd:type>
                                <gmd:MD_KeywordTypeCode codeSpace="ISOTC211/19115" codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_KeywordTypeCode" codeListValue="theme">theme</gmd:MD_KeywordTypeCode>
                            </gmd:type>
                        </gmd:MD_Keywords>
                    </gmd:descriptiveKeywords>
                    <gmd:descriptiveKeywords>
                        <gmd:MD_Keywords>
                            <!-- will need for each to have a keyword entry for each. also need to hard code/choice MILES project defaults
                            <xsl:for-each select=""></xsl:for-each> -->
                            <gmd:keyword>
                                <gco:CharacterString>
                                    <xsl:value-of select="/root/record/place_keywords"/>
                                </gco:CharacterString>
                            </gmd:keyword>
                            <gmd:type>
                                <gmd:MD_KeywordTypeCode codeSpace="ISOTC211/19115" codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_KeywordTypeCode" codeListValue="place">place</gmd:MD_KeywordTypeCode>
                            </gmd:type>
                        </gmd:MD_Keywords>
                    </gmd:descriptiveKeywords>
                    <gmd:resourceConstraints>
                        <gmd:MD_LegalConstraints>
                            <gmd:accessConstraints>
                                <gmd:MD_RestrictionCode codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_RestrictionCode" codeListValue="otherRestrictions">otherRestrictions</gmd:MD_RestrictionCode>
                            </gmd:accessConstraints>
                            <gmd:accessConstraints>
                                <gmd:MD_RestrictionCode codeList="http:http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_RestrictionCode" codeListValue="license">license</gmd:MD_RestrictionCode>
                            </gmd:accessConstraints>
                            <gmd:useConstraints>
                                <gmd:MD_RestrictionCode codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_RestrictionCode" codeListValue="otherRestrictions">otherRestrictions</gmd:MD_RestrictionCode>
                            </gmd:useConstraints>
                            <gmd:useConstraints>
                                <gmd:MD_RestrictionCode codeList="http:http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#MD_RestrictionCode" codeListValue="license">license</gmd:MD_RestrictionCode>
                            </gmd:useConstraints>
                            <!-- for MILES access restrictions to automatically be entered if user selects Yes to a field asking Yes/No is this data related to MILES?
                            <xsl:if test="/root/record/MILES ='Yes'">
                            <gmd:otherConstraints>
                                <gco:CharacterString>Access constraints: Data will be provided to all who agree to appropriately acknowledge the National Science Foundation (NSF), Idaho EPSCoR and the individual investigators responsible for the data set. By downloading these data and using them to produce further analysis and/or products, users agree to appropriately acknowledge the National Science Foundation (NSF), Idaho EPSCoR and the individual investigators responsible for the data set. Use constraints: Acceptable uses of data provided by Idaho EPSCoR include any academic, research, educational, governmental, recreational, or other not-for-profit activities. Any use of data provided by the Idaho EPSCoR must acknowledge Idaho EPSCoR and the funding source(s) that contributed to the collection of the data. Users are expected to inform the Idaho EPSCoR Office and the PI(s) responsible for the data of any work or publications based on data provided. | Citation: The appropriate statement to be used when citing these data is “…data were provided by (Name, University Affiliation) through the support of the NSF Idaho EPSCoR Program and by the National Science Foundation under award number IIA-1301792. For more information, see http://www.idahoepscor.org/uploads/ID_EPSCoR_MILES_Data_Policies%20March%202014.pdf</gco:CharacterString>
                            </gmd:otherConstraints>
                            -->
                            <!-- for NKN license to automatically be entered if user selects Yes to a field asking Yes/No are these data stored with NKN?
                            <xsl:if test="/root/record/DataStore ='Yes'">
                            <gmd:otherConstraints>
                                <gco:CharacterString>Per the Northwest Knowledge Network’s terms of service (https://www.northwestknowledge.net/terms_of_service), the default license for use of this content is the Creative Commons License titled Attribution-NonCommercial-ShareAlike, unless otherwise specified by the content contributor. For more information, see http://creativecommons.org/.</gco:CharacterString>
                            </gmd:otherConstraints>
                            -->
                            <gmd:otherConstraints>
                                <!--
                                <xsl:if test="root/record/restrictions != ''">
                                    <xsl:value-of select="root/record/restrictions/use"/>
                                </xsl:if>  
                                -->
                            </gmd:otherConstraints>
                            <gmd:otherConstraints>
                                <!--
                                <xsl:if test="root/record/restrictions != ''">
                                    <xsl:value-of select="root/record/restrictions/license"/>
                                </xsl:if>  
                                -->
                            </gmd:otherConstraints>
                        </gmd:MD_LegalConstraints>
                    </gmd:resourceConstraints>
                    <gmd:language>
                        <gmd:LanguageCode codeList="http://www.loc.gov/standards/iso639-2/php/code_list.php" codeListValue="eng">eng</gmd:LanguageCode>
                    </gmd:language>
                    <gmd:topicCategory>
                        <gmd:MD_TopicCategoryCode></gmd:MD_TopicCategoryCode>
                    </gmd:topicCategory>
                    <gmd:extent>
                        <gmd:EX_Extent>
                            <!-- to automatically fill with statewide extent for Idaho if user selects Yes to a field asking Yes/No are these data statewide data for Idaho?
                            <xsl:if test="/root/record/extent/Idaho ='Yes'">
                            <gmd:geographicElement>
                                <gmd:EX_GeographicBoundingBox>
                                    <gmd:westBoundLongitude>
                                        <gco:Decimal>-117.531786</gco:Decimal>
                                    </gmd:westBoundLongitude>
                                    <gmd:eastBoundLongitude>
                                        <gco:Decimal>-110.655421</gco:Decimal>
                                    </gmd:eastBoundLongitude>
                                    <gmd:southBoundLatitude>
                                        <gco:Decimal>41.946097</gco:Decimal>
                                    </gmd:southBoundLatitude>
                                    <gmd:northBoundLatitude>
                                        <gco:Decimal>49.039542</gco:Decimal>
                                    </gmd:northBoundLatitude>
                                </gmd:EX_GeographicBoundingBox>
                            </gmd:geographicElement>
                            </xsl:if>
                            -->
                            <gmd:geographicElement>
                                <!--need an IF for if it is not empty-->
                                <gmd:EX_GeographicBoundingBox>
                                    <gmd:westBoundLongitude>
                                        <gco:Decimal>-117.531786</gco:Decimal>
                                    </gmd:westBoundLongitude>
                                    <gmd:eastBoundLongitude>
                                        <gco:Decimal>-110.655421</gco:Decimal>
                                    </gmd:eastBoundLongitude>
                                    <gmd:southBoundLatitude>
                                        <gco:Decimal>41.946097</gco:Decimal>
                                    </gmd:southBoundLatitude>
                                    <gmd:northBoundLatitude>
                                        <gco:Decimal>49.039542</gco:Decimal>
                                    </gmd:northBoundLatitude>
                                </gmd:EX_GeographicBoundingBox>
                            </gmd:geographicElement>
                            <gmd:temporalElement>
                            </gmd:temporalElement>
                        </gmd:EX_Extent>
                    </gmd:extent>     
                </gmd:MD_DataIdentification>
            </gmd:identificationInfo>
        
            <!--Distribution Info -->
            <gmd:distributionInfo>
                <!-- for NKN contact to automatically be entered if user selects Yes to a field asking Yes/No are these data stored with NKN?
                            <xsl:if test="/root/record/DataStore ='Yes'">
                <gmd:MD_Distribution>
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
                                                <gmd:URL>https://www.northwestknowledge.net/data/uuid_for_download.html</gmd:URL>
                                            </gmd:linkage>
                                        </gmd:CI_OnlineResource>
                                    </gmd:onLine>
                                    <gmd:onLine>
                                        <gmd:CI_OnlineResource>
                                            <gmd:linkage>
                                                <gmd:URL>https://www.northwestknowledge.net/services_web_address</gmd:URL>
                                            </gmd:linkage>
                                        </gmd:CI_OnlineResource>
                                    </gmd:onLine>
                                </gmd:MD_DigitalTransferOptions>
                            </gmd:distributorTransferOptions>
                        </gmd:MD_Distributor>
                        -->
                <!--
                        <xsl:for-each select="root/record/access">
                                         
                        </xsl:for-each>
                    </gmd:distributor>
                </gmd:MD_Distribution>
            </gmd:distributionInfo>
--></gmd:distributionInfo>
        <!-- Metadata background maintenance info, mostly hidden from mdedit web front end  -->
            <gmd:metadataConstraints>
                <gmd:MD_Constraints>
                    <gmd:useLimitation>
                        <gco:CharacterString>This metadata record is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike License. For more information, see http://www.northwestknowledge.net/terms_of_service</gco:CharacterString>
                    </gmd:useLimitation>
                </gmd:MD_Constraints>
            </gmd:metadataConstraints>
            <gmd:metadataMaintenance>
                <gmd:MD_MaintenanceInformation>
                    <gmd:maintenanceAndUpdateFrequency>
                        <gmd:MD_MaintenanceFrequencyCode codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml" codeListValue="asNeeded">asNeeded</gmd:MD_MaintenanceFrequencyCode>
                    </gmd:maintenanceAndUpdateFrequency>
                    <gmd:maintenanceNote>
                        <gco:CharacterString>This metadata record may be updated when information within it becomes obsolete.</gco:CharacterString>
                    </gmd:maintenanceNote>
                    <gmd:contact xlink:title="NKN">
                        <gmd:CI_ResponsibleParty uuid="0f370b7f-08ed-4727-b3f8-e98932ecd5e7">
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
                                <gmd:CI_RoleCode codeList="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#CI_RoleCode" codeListValue="custodian">custodian</gmd:CI_RoleCode>
                            </gmd:role>
                        </gmd:CI_ResponsibleParty>
                    </gmd:contact>
                </gmd:MD_MaintenanceInformation>
            </gmd:metadataMaintenance>
        </gmi:MI_Metadata>


    </xsl:template>
</xsl:stylesheet>
