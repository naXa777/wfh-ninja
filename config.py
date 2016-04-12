#!/usr/bin/env python

import os

SESSION_TYPE = 'memcached'
SECRET_KEY = os.environ.get('SECRET_KEY', '\xfb\x13\xdf\xa1@i\xd6>V\xc0\xbf\x8fp\x16#Z\x0b\x81\xeb\x16')
HOST_NAME = os.environ.get('OPENSHIFT_APP_DNS', 'localhost')
APP_NAME = os.environ.get('OPENSHIFT_APP_NAME', 'flask')
IP = os.environ.get('OPENSHIFT_PYTHON_IP', '127.0.0.1')
PORT = int(os.environ.get('OPENSHIFT_PYTHON_PORT', 8080))
SQLALCHEMY_DATABASE_URI = os.environ['OPENSHIFT_POSTGRESQL_DB_URL']
SQLALCHEMY_ECHO = False
ADMIN_REGISTRATION_SECRET_KEY = 'wfh-ninja-admin'
DEBUG = False
PROPAGATE_EXCEPTIONS = True
