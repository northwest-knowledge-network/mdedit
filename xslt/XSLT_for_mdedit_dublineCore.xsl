<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:dcmiBox="http://dublincore.org/documents/2000/07/11/dcmi-box/"
    xmlns:dct="http://purl.org/dc/terms/" xmlns:ows="http://www.opengis.net/ows">
    <!--Specify output method as xml. This will take xml document of mdedit format and transform it to Dublin Core metadata format-->
    <xsl:output method="xml" indent="yes"/>
    <!-- Sets up XML template when root node in mdedit XML is encountered -->
    <xsl:template match="/">
        <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:dcmiBox="http://dublincore.org/documents/2000/07/11/dcmi-box/"
            xmlns:dct="http://purl.org/dc/terms/" xmlns:ows="http://www.opengis.net/ows">
            <!--Selects values from mdedit XML for corresponding DC elements -->
            <rdf:Description rdf:about="https://www.northwestknowledge.net/">
                <dc:identifier>nkn:<xsl:value-of select="/root/record/_id/key"/></dc:identifier>
                <dc:title>
                    <xsl:value-of select="/root/record/title"/>
                </dc:title>
                <dc:description>
                    <xsl:value-of select="root/record/summary"/>
                </dc:description>
                <xsl:for-each select="/root/record/online/item">
                    <dct:references>
                        <xsl:value-of select="url"/>
                    </dct:references>
                </xsl:for-each>
                <xsl:for-each select="/root/record/attachments/item">
                    <dct:references>
                        <xsl:value-of select="url"/>
                    </dct:references>
                </xsl:for-each>
                <xsl:for-each select="/root/record/citation/item">
                    <dc:creator><xsl:value-of select="name"/>, <xsl:value-of select="org"/>,
                            <xsl:value-of select="email"/>, <xsl:value-of select="address"/>,
                            <xsl:value-of select="city"/>, <xsl:value-of select="state"/>,
                            <xsl:value-of select="zipcode"/>, <xsl:value-of select="country"
                        /></dc:creator>
                </xsl:for-each>
                <dc:date>
                    <xsl:value-of select="/root/record/first_pub_date"/>
                </dc:date>
                <dc:language>eng</dc:language>
                <xsl:for-each select="/root/record/topic_category/item">
                    <dc:subject>
                        <xsl:value-of select="word"/>
                    </dc:subject>
                </xsl:for-each>
                <xsl:for-each select="/root/record/thematic_keywords/item">
                    <dc:subject>
                        <xsl:value-of select="word"/>
                    </dc:subject>
                </xsl:for-each>
                <xsl:for-each select="/root/record/place_keywords/item">
                    <dc:subject>
                        <xsl:value-of select="word"/>
                    </dc:subject>
                </xsl:for-each>
                <ows:WGS84BoundingBox rdf:parseType="Literal">
                    <ows:LowerCorner>
                        <xsl:value-of select="/root/record/south_lat"/>
                        <xsl:value-of select="/root/record/west_lon"/>
                    </ows:LowerCorner>
                    <ows:UpperCorner>
                        <xsl:value-of select="/root/record/north_lat"/>
                        <xsl:value-of select="/root/record/east_lon"/>
                    </ows:UpperCorner>
                </ows:WGS84BoundingBox>
                <dc:rights>
                    <xsl:value-of select="/root/record/use_restrictions"/>
                </dc:rights>
                <xsl:for-each select="/root/record/access/item">
                    <dc:publisher><xsl:value-of select="name"/>, <xsl:value-of select="org"/>,
                            <xsl:value-of select="email"/>, <xsl:value-of select="address"/>,
                            <xsl:value-of select="city"/>, <xsl:value-of select="state"/>,
                            <xsl:value-of select="zipcode"/>, <xsl:value-of select="country"
                        /></dc:publisher>
                </xsl:for-each>
            </rdf:Description>
        </rdf:RDF>
    </xsl:template>
</xsl:stylesheet>
