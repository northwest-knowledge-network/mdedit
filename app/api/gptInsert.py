#!/usr/bin/env python
# -*- coding: utf-8 -*-

# This work was created by participants in the Northwest Knowledge Network
# (NKN), and is copyrighted by NKN. For more information on NKN, see our
# web site at http://www.northwestknowledge.net
#
#   Copyright 20015 Northwest Knowledge Network
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
import os
import sys
import psycopg2
import uuid

def gptInsertRecord(xml_path):

  #todo: Load the xml into a string called xml
  with open (xml_path, 'r') as xml_file:
    xml = xml_file.read()

#  '''<?xml version="1.0" encoding="UTF-8"?>
#<metadata>
#    <title>title text</title>
#    <element>thing</element>
#</metadata>
#'''

  #print 'Starting db connect\n'
  #Config file is 'gptInsert.conf' located in the current directory
  config_file = os.path.dirname(__file__) + '/gptInsert.conf'
  config = get_config(config_file)
  conn_param = dict(config.items('default'))

  # Try to connect
  try:
    conn=psycopg2.connect(**conn_param)
  except:
    print 'Unable to connect to the database'
  cursor = conn.cursor()

  query = '''SELECT nextval('geoportal.gpt_resource_seq')'''
  try:
    cursor.execute(query, data)
  except:
    print 'Insert failed'

  rows = cur.fetchall()
  gpt_sequence_num = row[1]
  docuuid = uuid.uuid4()

  query = '''INSERT INTO geoportal.gpt_resource_data (docuuid, id, xml) VALUES (%s,%s,%s)'''
  data = (docuuid, gpt_sequence_num, xml)
  try:
    cursor.execute(query, data)
  except:
    print 'Insert failed'

  query =  '''INSERT INTO geoportal.gpt_resource
                (docuuid, title, owner, inputdate, updatedate, id, approvalstatus, pubmethod, sourceuri, findable)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)'''
  title = 'placeholder title' #todo: get title from xml using xpath query
  owner = 39
  inputdate = now
  updatedate = now
  approvalstatus = 'posted'
  pubmethod = 'editor'
  sourceuri = 'userid:' + owner + '/\{' + docuuid + '\}'
  findable = 'true'
  data = (docuuid, title, owner, inputdate, updatedate, gpt_sequence_num, approvalstatus, pubmethod, sourceuri, findable)
  try:
    cursor.execute(query, data)
  except:
    print 'Insert failed'

  query = '''INSERT INTO geoportal.gpt_resource_nkn
             (docuuid, isComplete, rubricScore, clamscanRetVal, virusInfo) VALUES (%s,%s,%s,%s,%s)'''
  data = (docuuid, 'true', 0, 0, '')
  try:
    cursor.execute(query, data)
  except:
    print 'Insert failed'


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
