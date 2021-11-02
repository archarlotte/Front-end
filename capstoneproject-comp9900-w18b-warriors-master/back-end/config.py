import os
# Connection credentials
DIALECT = 'mysql'
DRIVER = 'mysqlconnector'
USERNAME = 'admin'
PASSWORD = '12345678'
HOST = 'project.cyz77vt8v1th.ap-southeast-2.rds.amazonaws.com'
PORT = '3306'
# USERNAME = 'root'
# PASSWORD = 'root'
# HOST = 'localhost'
# PORT = '8889'
DATABASE = 'project_db'

SQLALCHEMY_DATABASE_URI = "{}+{}://{}:{}@{}:{}/{}".format(DIALECT, DRIVER, USERNAME, PASSWORD, HOST, PORT, DATABASE)
SQLALCHEMY_TRACK_MODIFICATIONS = True

DEBUG = True

SECRET_KEY = os.urandom(24)