#!/usr/bin/env python
# -*- coding: utf-8 -*-

# This work was created by participants in the Northwest Knowledge Network
# (NKN), and is copyrighted by NKN. For more information on NKN, see our
# web site at http://www.northwestknowledge.net
#
#   Copyright 2016 Northwest Knowledge Network
#
# Licensed under the Creative Commons CC BY 4.0 License (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   https://creativecommons.org/licenses/by/4.0/legalcode
#
# Software distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


# Stdlib.
import ConfigParser
import datetime
import os
import smtplib
import sys
import psycopg2
import uuid

class Geoportal(object):
    def __init__(self, downloadURL = None, uuid = None):
        self.downloadURL = downloadURL
        self.uuid = uuid

def gptInsertRecord(xml, title):
    # Config file is 'gptInsert.conf' located in the current directory
    config_file = os.path.dirname(__file__) + '/gptInsert.conf'
    try:
        config = get_config(config_file)
        conn_param = dict(config.items('default'))

        # We want the downloadURL out of the dictionary before sending
        # the dictionary to the SQL server
        downloadURL = conn_param.pop('downloadurl')
    except:
        print >> sys.stderr, 'Failed to get config'

    # Try to connect
    try:
        conn = psycopg2.connect(**conn_param)
    except:
        print >> sys.stderr, 'Unable to connect to the database'

    cursor = conn.cursor()

    # Get the sequence id for the next record from geoportal
    query = '''SELECT nextval('geoportal.gpt_resource_seq')'''
    try:
        cursor.execute(query)
    except:
        print >> sys.stderr, 'Geoportal sequence number SELECT failed'
    rows = cursor.fetchall()
    gpt_sequence_num = rows[0][0]

    # Generate a UUID and format it in geoportal style
    bareuuid = str(uuid.uuid4())
    docuuid = '{' + bareuuid + '}'

    print >> sys.stderr, 'Inserting geoportal record uuid=' + docuuid + ' id=' + str(gpt_sequence_num)

    # Insert the xml data into the first table
    query = '''INSERT INTO geoportal.gpt_resource_data (docuuid, id, xml) VALUES (%s,%s,%s)'''
    data = (docuuid, gpt_sequence_num, xml)
    try:
        cursor.execute(query, data)
    except Exception as e:
        print >> sys.stderr, 'INSERT into gpt_resource_data failed: ' + e.message


    # Insert the geoportal system metadata into the second table
    query =  '''INSERT INTO geoportal.gpt_resource
                    (docuuid, title, owner, inputdate, updatedate, id, approvalstatus, pubmethod, sourceuri, findable)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)'''
    # this is the "GPT Registered User ID"
    owner = 39
    inputdate = datetime.datetime.now()
    updatedate = inputdate
    approvalstatus = 'posted'
    pubmethod = 'editor'
    sourceuri = 'userid:' + str(owner) + '/' + docuuid
    findable = 'true'
    data = (docuuid, title, owner, inputdate, updatedate,
            gpt_sequence_num, approvalstatus, pubmethod, sourceuri, findable)

    try:
        cursor.execute(query, data)
    except Exception as e:
        print >> sys.stderr, 'INSERT into gpt_resource failed: ' + e.message

    # Insert the NKN system metadata into the third table
    query = '''INSERT INTO geoportal.gpt_resource_nkn
                 (docuuid, isComplete, rubricScore, clamscanRetVal, virusInfo) VALUES (%s,%s,%s,%s,%s)'''

    data = (docuuid, 'true', 0, 0, '')
    try:
        cursor.execute(query, data)
    except Exception as e:
        print >> sys.stderr, 'INSERT into gpt_resource_nkn failed: ' + e.message

    # Commit all SQL inserts
    conn.commit()

    # Return the Geoportal object with enough information to construct
    # a download link for the dataset
    output = Geoportal(downloadURL = downloadURL, uuid = bareuuid)
    send_email()
    return output

# The function to send the notification email
def send_email():
    sender = 'portal@northwestknowledge.net'
    receivers = ['publish@northwestknowledge.net']
    message = """From: NKN Geoportal <portal@northwestknowledge.net>
To: NKN Publisher Group <publish@northwestknowledge.net>
Subject: Dataset submitted for publication

Hi, NKN data publishers.  A new dataset has been approved for publication
in the geoportal interface.  Please take a look.
"""
    try:
        smtpObj = smtplib.SMTP('localhost')
        smtpObj.sendmail(sender, receivers, message)
        print "Successfully sent email"
    except SMTPException:
        print "Error: unable to send email"


# The function for reading the config file
def get_config(config_file):
    """Provide user with a ConfigParser that has read the `config_file`
        Returns:
            (ConfigParser) Config parser with a section for each config
    """
    assert os.path.isfile(config_file), "Config file %s does not exist!" \
        % os.path.abspath(config_file)
    config = ConfigParser.ConfigParser()
    config.read(config_file)
    return config
