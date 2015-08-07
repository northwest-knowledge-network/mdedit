# Python script for transport of generic XML to ISO XML for viewing on mdedit frontend.
# Aug 7, 2015
# Marisa Guarinello, mguarinello@uidaho.edu

# The function of this script will be to take the generic xml output from our metadata editor and pass in through our xslt to result in an ISO xml view option in the web interface of the editor. The generic xml can be found at the following type of link http://localhost:4000/api/metadata/558dce37e2103107bef450fc/xml, where the long number is the uuid created by the editor

#used info from http://stackoverflow.com/questions/16698935/how-to-transform-an-xml-file-using-xslt-in-python to write 

#### with MATT-- will above on this branch be enough to have it implemented on master once we merge? AND/OR will this install need to be part of the mdedit set-up instructions?


# set up needed library
import lxml.etree as ET

## in line order: 
# indicate xml record that will be transformed
# indicate xslt to be used to do the transformation
# create transform function
# create xml result for transform of indicated xml


md_xml = ET.parse("/Users/Marisa/Documents/GitHub/mdedit/design_doc/Aug7_use.xml")
## this points to server instance url, is still for one particular xml record
#md_xml = ET.parse("http://localhost:4000/api/metadata/55c4ba2bc26c2830e0b58c29/xml")
iso_xslt = ET.parse("/Users/Marisa/Documents/GitHub/mdedit/xslt/XSLT_for_mdedit.xsl")
transform =ET.XSLT(iso_xslt)
iso_xml = transform(md_xml)

#write results to a file; first open existing file and allow write
f = open("/Users/Marisa/Documents/GitHub/mdedit/design_doc/iso_result.xml", 'w')
f.write(ET.tostring(iso_xml, pretty_print=True))
f.close()
