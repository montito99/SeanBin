import logging

DATABASE = 'flask.db'
DEBUG = True
SECRET_KEY = 'development key'
USERNAME = 'admin'
PASSWORD = 'default'
EXPIRATIONS = {
	'10seconds' : 10.0,
	'minute' : 60.0,
	'10minutes' : 60.0 * 10,
	'hour' : 60.0 * 60,
	'day' : 60.0 * 60 * 24,
	'week' : 60.0 * 60 * 24 * 7,
	'month' : 60.0 * 60 * 24 * 30,
	'year' : 60.0 * 60 * 24 * 365
}
CONSOLE_FORMATS = {logging.DEBUG :"DBG: %(module)s: %(lineno)d: %(message)s",
       logging.ERROR : "\033[96m%(asctime)s:\033[0m \033[91m%(levelname)s-\033[0m \033[97m%(message)s\033[0m",
       logging.INFO : "\033[96m%(asctime)s:\033[0m \033[92m%(levelname)s-\033[0m \033[97m%(message)s\033[0m",
       'DEFAULT' : "%(levelname)s: %(message)s",
       'datefmt' : "%Y-%m-%d %H:%M:%S"}

FILE_FORMATS = {'DEFAULT' : "%(asctime)s: %(levelname)s- %(message)s",
		'datefmt' : "%Y-%m-%d %H:%M:%S"}

CONTEXT = ('server.key', 'server.cert')