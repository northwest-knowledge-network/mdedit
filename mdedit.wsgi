#!/usr/bin/env python
# -*- coding: utf-8 -*-

# This work was created by participants in the Northwest Knowledge Network
# (NKN), and is copyrighted by NKN. For more information on NKN, see our
# web site at http://www.northwestknowledge.net
#
#   Copyright 2015 Northwest Knowledge Network
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

import sys
sys.path.insert(0, '/var/www/shared/mdedit')

import os
#Change for production!
os.environ["MDEDIT_PREPROD_DIRECTORY"] = '/datastore-pre/uploads/'
#os.environ["MDEDIT_PREPROD_DIRECTORY"] = '/local-datastore/'
os.environ["MDEDIT_PROD_DIRECTORY"] = '/datastore-pre/published/'
os.environ["FLASKCONFIG"] = 'development-server'

from manage import app as application
