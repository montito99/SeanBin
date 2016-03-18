import logging
import sys




class SpecialFormatter(logging.Formatter):
	def __init__(self, FORMATS):
		self.FORMATS = FORMATS
		self.datefmt = FORMATS['datefmt']

	def format(self, record):
		self._fmt = self.FORMATS.get(record.levelno, self.FORMATS['DEFAULT'])
		return logging.Formatter.format(self, record)


def GetLogger(CONSOLE_FORMATS, FILE_FORMATS):
	root = logging.getLogger()
	root.setLevel(logging.DEBUG)

	hdlr = logging.StreamHandler(sys.stderr)
	hdlr.setFormatter(SpecialFormatter(CONSOLE_FORMATS))
	hdlr.setLevel(logging.INFO)
	root.addHandler(hdlr)


	fileHandler = logging.FileHandler("log.log")
	fileHandler.setFormatter(SpecialFormatter(FILE_FORMATS))
	fileHandler.setLevel(logging.DEBUG)
	root.addHandler(fileHandler)

	return root

if __name__ == "__main__":

	CONSOLE_FORMATS = {logging.DEBUG :"DBG: %(module)s: %(lineno)d: %(message)s",
	       logging.ERROR : "\033[96m%(asctime)s:\033[0m \033[91m%(levelname)s-\033[0m \033[97m%(message)s\033[0m",
	       logging.INFO : "\033[96m%(asctime)s:\033[0m \033[92m%(levelname)s-\033[0m \033[97m%(message)s\033[0m",
	       'DEFAULT' : "%(levelname)s: %(message)s",
	       'datefmt' : "%Y-%m-%d %H:%M:%S"}

	FILE_FORMATS = {'DEFAULT' : "%(asctime)s: %(levelname)s- %(message)s",
			'datefmt' : "%Y-%m-%d %H:%M:%S"}

	logger = getLogger(CONSOLE_FORMATS, FILE_FORMATS)
	logger.info("hi")