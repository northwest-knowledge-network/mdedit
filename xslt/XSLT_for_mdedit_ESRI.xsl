<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0"
    xmlns:q="http://www.esri.com/metadata/translator/template/"	
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:xsi="http://www.w3.org/2001/XMLSchemainstance"
    xmlns:r="http://www.esri.com/metadata/translator/reader/"
    xmlns:es="http://www.esri.com/metadata/translator/schema/"
    xmlns:ec="http://www.esri.com/metadata/translator/ctrl/"
    xmlns:v="http://www.esri.com/metadata/translator/var/"
    xmlns:em="http://www.esri.com/metadata/translator/instance/"
    xmlns:gmx="http://www.isotc211.org/2005/gmx"
    xmlns:gmxRes="http://www.isotc211.org/2005/resources/Codelist/gmxCodelists.xml#"
    xmlns:nato="http://coregis/Resources/Geo_Tools/GeoMetadata_Tools/NATO_Codelists/NATO_CodelistCatalog.xml#">

    <!--Specify output method as xml. This will take xml document of mdedit format and transform it to ESRI-ISO xml metadata format for viewing in ArcCatalog-->
    <xsl:output method="xml" indent="yes"/>
    <!-- Sets up XML template when root node in mdedit XML is encountered -->
    <xsl:template match="/">
        <!-- Sets up the XML document as a metadata document and references related schema documents  -->
        <metadata xml:lang="en">
            <Esri>
                <CreaDate><xsl:value-of select="/root/record/first_pub_date"/></CreaDate>
                <DataProperties>
                    <itemProps>
                        <itemName><xsl:value-of select="/root/record/title"/></itemName>
                    </itemProps>
                    <coordRef>
                        <geogcsn Sync="TRUE">GCS_WGS_1984</geogcsn>
                    </coordRef>
                </DataProperties>
                <ModDate><xsl:value-of select="/root/record/last_mod_date"/></ModDate>
            </Esri>
            <dataIdInfo>
                <idCitation>
                    <resTitle><xsl:value-of select="/root/record/title"/></resTitle>
                    <date>
                        <createDate><xsl:value-of select="/root/record/last_mod_date"/></createDate>
                        <pubDate><xsl:value-of select="/root/record/first_pub_date"/></pubDate>
                    </date>
                </idCitation>
                <idPurp><xsl:value-of select="root/record/summary"/></idPurp>
                <idAbs><xsl:value-of select="root/record/summary"/></idAbs>
                <idCredit><xsl:for-each select="/root/record/citation/item"><xsl:value-of select="name"/>, <xsl:value-of select="org"/>;  </xsl:for-each></idCredit>
                <xsl:for-each select="/root/record/citation/item">
                <idPoC>
                    <rpIndName><xsl:value-of select="name"/></rpIndName>
                    <rpOrgName><xsl:value-of select="org"/></rpOrgName>
                    <rpCntInfo>
                        <cntAddress>
                            <delPoint><xsl:value-of select="address"/></delPoint>
                            <city><xsl:value-of select="city"/></city>
                            <adminArea><xsl:value-of select="state"/></adminArea>
                            <postCode><xsl:value-of select="zipcode"/></postCode>
                            <country><xsl:value-of select="country"/></country>
                        </cntAddress>
                        <eMailAdd><xsl:value-of select="email"/></eMailAdd>
                        <cntPhone><xsl:value-of select="phone"/></cntPhone>
                    </rpCntInfo>
                    <role>
                        <RoleCd value="006"/>
                    </role>
                </idPoC>
                </xsl:for-each>
                <xsl:for-each select="/root/record/access/item">
                    <idPoC>
                        <rpIndName><xsl:value-of select="name"/></rpIndName>
                        <rpOrgName><xsl:value-of select="org"/></rpOrgName>
                        <rpCntInfo>
                            <cntAddress>
                                <delPoint><xsl:value-of select="address"/></delPoint>
                                <city><xsl:value-of select="city"/></city>
                                <adminArea><xsl:value-of select="state"/></adminArea>
                                <postCode><xsl:value-of select="zipcode"/></postCode>
                                <country><xsl:value-of select="country"/></country>
                            </cntAddress>
                            <eMailAdd><xsl:value-of select="email"/></eMailAdd>
                            <cntPhone><xsl:value-of select="phone"/></cntPhone>
                        </rpCntInfo>
                        <role>
                            <RoleCd value="005"/>
                        </role>
                    </idPoC>
                </xsl:for-each>
                <resMaint>
                    <maintFreq>
                        <xsl:if test="root/record/update_frequency = 'continual'">
                            <MaintFreqCd value="001"/>
                        </xsl:if>
                        <xsl:if test="root/record/update_frequency = 'daily'">
                            <MaintFreqCd value="002"/>
                        </xsl:if>
                        <xsl:if test="root/record/update_frequency = 'weekly'">
                            <MaintFreqCd value="003"/>
                        </xsl:if>
                        <xsl:if test="root/record/update_frequency = 'fortnightly'">
                            <MaintFreqCd value="004"/>
                        </xsl:if>
                        <xsl:if test="root/record/update_frequency = 'monthly'">
                            <MaintFreqCd value="005"/>
                        </xsl:if>
                        <xsl:if test="root/record/update_frequency = 'quarterly'">
                            <MaintFreqCd value="006"/>
                        </xsl:if>
                        <xsl:if test="root/record/update_frequency = 'biannually'">
                            <MaintFreqCd value="007"/>
                        </xsl:if>
                        <xsl:if test="root/record/update_frequency = 'annually'">
                            <MaintFreqCd value="008"/>
                        </xsl:if>
                        <xsl:if test="root/record/update_frequency = 'as needed'">
                            <MaintFreqCd value="009"/>
                        </xsl:if>
                        <xsl:if test="root/record/update_frequency = 'irregular'">
                            <MaintFreqCd value="010"/>
                        </xsl:if>                        
                        <xsl:if test="root/record/update_frequency = 'not planned'">
                            <MaintFreqCd value="011"/>
                        </xsl:if>
                        <xsl:if test="root/record/update_frequency = 'unknown'">
                            <MaintFreqCd value="012"/>
                        </xsl:if>
                    </maintFreq>
                </resMaint>
                <placeKeys xmlns="">
                    <xsl:for-each select="/root/record/place_keywords/item">
                        <keyword><xsl:value-of select="word"/></keyword>
                    </xsl:for-each>
                </placeKeys>
                <themeKeys xmlns="">
                    <xsl:for-each select="/root/record/thematic_keywords/item">
                        <keyword><xsl:value-of select="word"/></keyword>
                    </xsl:for-each>
                </themeKeys>
                <xsl:if test="root/record/spatial_dtype = 'vector'">
                <spatRpType>
                    <SpatRepTypCd value="001" Sync="TRUE"/>
                </spatRpType>
                </xsl:if>
                <xsl:if test="root/record/spatial_dtype = 'grid'">
                    <spatRpType>
                        <SpatRepTypCd value="002" Sync="TRUE"/>
                    </spatRpType>
                </xsl:if>
                <xsl:if test="root/record/spatial_dtype = 'table or text'">
                    <spatRpType>
                        <SpatRepTypCd value="003" Sync="TRUE"/>
                    </spatRpType>
                </xsl:if>
                <xsl:if test="root/record/spatial_dtype = 'triangulated irregular network'">
                    <spatRpType>
                        <SpatRepTypCd value="004" Sync="TRUE"/>
                    </spatRpType>
                </xsl:if>
                <xsl:if test="root/record/spatial_dtype = 'stereographic imaging'">
                    <spatRpType>
                        <SpatRepTypCd value="005" Sync="TRUE"/>
                    </spatRpType>
                </xsl:if>
                <xsl:if test="root/record/spatial_dtype = 'video recording of a scene'">
                    <spatRpType>
                        <SpatRepTypCd value="006" Sync="TRUE"/>
                    </spatRpType>
                </xsl:if>
                <dataLang>
                    <languageCode value="eng"/>
                </dataLang>
                <dataChar>
                    <CharSetCd value="004"/>
                </dataChar>
                <dataExt>
                    <geoEle xmlns="">
                        <GeoBndBox esriExtentType="search">
                            <exTypeCode Sync="TRUE">1</exTypeCode>
                            <westBL><xsl:value-of select="root/record/west_lon"/></westBL>
                            <eastBL><xsl:value-of select="root/record/east_lon"/></eastBL>
                            <southBL><xsl:value-of select="root/record/south_lat"/></southBL>
                            <northBL><xsl:value-of select="root/record/north_lat"/></northBL>
                        </GeoBndBox>
                    </geoEle>
                    <tempEle>
                        <TempExtent>
                            <exTemp>
                                <TM_Period>
                                    <tmBegin><xsl:value-of select="root/record/start_date"/></tmBegin>
                                    <tmEnd><xsl:value-of select="root/record/end_date"/></tmEnd>
                                </TM_Period>
                            </exTemp>
                        </TempExtent>
                    </tempEle>
                </dataExt>
                <xsl:if test="root/record/topic_category/item/word = 'farming'">
                <tpCat>
                    <TopicCatCd value="001"/>
                </tpCat>
                </xsl:if>
                <xsl:if test="root/record/topic_category/item/word = 'biota'">
                <tpCat>
                    <TopicCatCd value="002"/>
                </tpCat>
                </xsl:if>
                <xsl:if test="root/record/topic_category/item/word = 'boundaries'">
                <tpCat>
                    <TopicCatCd value="003"/>
                </tpCat>
                </xsl:if>
                <xsl:if test="root/record/topic_category/item/word = 'climatologyMeteorologyAtmosphere'">
                <tpCat>
                    <TopicCatCd value="004"/>
                </tpCat>
                </xsl:if>
                <xsl:if test="root/record/topic_category/item/word = 'economy'">
                <tpCat>
                    <TopicCatCd value="005"/>
                </tpCat>
                </xsl:if>
                <xsl:if test="root/record/topic_category/item/word = 'elevation'">
                <tpCat>
                    <TopicCatCd value="006"/>
                </tpCat>
                </xsl:if>
                <xsl:if test="root/record/topic_category/item/word = 'environment'">
                <tpCat>
                    <TopicCatCd value="007"/>
                </tpCat>
                </xsl:if>
                <xsl:if test="root/record/topic_category/item/word = 'geoscientificInformation'">
                <tpCat>
                    <TopicCatCd value="008"/>
                </tpCat>
                </xsl:if>
                <xsl:if test="root/record/topic_category/item/word = 'health'">
                <tpCat>
                    <TopicCatCd value="009"/>
                </tpCat>
                </xsl:if>
                <xsl:if test="root/record/topic_category/item/word = 'imageryBaseMapsEarthCover'">
                <tpCat>
                    <TopicCatCd value="010"/>
                </tpCat>
                </xsl:if>
                <xsl:if test="root/record/topic_category/item/word = 'intelligenceMilitary'">
                <tpCat>
                    <TopicCatCd value="011"/>
                </tpCat>
                </xsl:if>
                <xsl:if test="root/record/topic_category/item/word = 'inlandWaters'">
                <tpCat>
                    <TopicCatCd value="012"/>
                </tpCat>
                </xsl:if>
                <xsl:if test="root/record/topic_category/item/word = 'location'">
                <tpCat>
                    <TopicCatCd value="013"/>
                </tpCat>
                </xsl:if>
                <xsl:if test="root/record/topic_category/item/word = 'oceans'">
                <tpCat>
                    <TopicCatCd value="014"/>
                </tpCat>
                </xsl:if>
                <xsl:if test="root/record/topic_category/item/word = 'planningCadastre'">
                <tpCat>
                    <TopicCatCd value="015"/>
                </tpCat>
                </xsl:if>
                <xsl:if test="root/record/topic_category/item/word = 'society'">
                <tpCat>
                    <TopicCatCd value="016"/>
                </tpCat>
                </xsl:if>
                <xsl:if test="root/record/topic_category/item/word = 'structure'">
                <tpCat>
                    <TopicCatCd value="017"/>
                </tpCat>
                </xsl:if>
                <xsl:if test="root/record/topic_category/item/word = 'transportation'">
                <tpCat>
                    <TopicCatCd value="018"/>
                </tpCat>
                </xsl:if>
                <xsl:if test="root/record/topic_category/item/word = 'utilitiesCommunication'">
                <tpCat>
                    <TopicCatCd value="019"/>
                </tpCat>
                </xsl:if>
                <resConst>
                    <Consts>
                        <useLimit><xsl:value-of select="root/record/use_restrictions"/></useLimit>
                    </Consts>
                </resConst>
                <resConst>
                    <LegConsts>
                        <othConsts><xsl:value-of select="root/record/use_restrictions"/></othConsts>
                    </LegConsts>
                </resConst>
            </dataIdInfo>
            <distInfo>
                <xsl:for-each select="/root/record/data_format/item">
                <distFormat>
                    <formatName><xsl:value-of select="word"/></formatName>
                </distFormat>
                </xsl:for-each>
                <distTranOps>
                    <xsl:for-each select="/root/record/online/item">
                    <onLineSrc>
                        <linkage><xsl:value-of select="url"/></linkage>
                    </onLineSrc>
                    </xsl:for-each>
                </distTranOps>
            </distInfo>
            <mdFileID>nkn:<xsl:value-of select="/root/record/_id/key"/></mdFileID>
            <mdLang>
                <languageCode value="eng" Sync="TRUE"/>
            </mdLang>
            <mdChar>
                <CharSetCd value="004" Sync="TRUE"/>
            </mdChar>
            <mdHrLvName><xsl:value-of select="root/record/hierarchy_level"/></mdHrLvName>
            <mdMaint>
                <maintFreq>
                    <MaintFreqCd value="009"/>
                </maintFreq>
            </mdMaint>
            <mdContact>
                <rpOrgName>Northwest Knowledge Network</rpOrgName>
                <rpCntInfo>
                    <cntAddress>
                        <delPoint>875 Perimeter Drive, MS 2358</delPoint>
                        <city>Moscow</city>
                        <adminArea>ID</adminArea>
                        <postCode>83844-2350</postCode>
                        <country>USA</country>
                    </cntAddress>
                    <eMailAdd>info@northwestknowledge.net</eMailAdd>
                    <cntPhone>(208)885-8456</cntPhone>
                </rpCntInfo>
                <role>
                    <RoleCd value="002"/>
                </role>
            </mdContact>
            <mdDateSt><xsl:value-of select="/root/record/last_mod_date"/></mdDateSt>
            <mdStanName>"ESRI-ISO"</mdStanName>
        </metadata>
    </xsl:template>
</xsl:stylesheet>
