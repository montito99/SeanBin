import sqlite3, os, sys
from contextlib import closing
from flask import *
from werkzeug import secure_filename
from threading import Thread
from time import *
from log import *

app = Flask(__name__)
app.config.from_object('FLASK_CONFIG')


logging = GetLogger(app.config['CONSOLE_FORMATS'], app.config['FILE_FORMATS'])

def init_db():
    with closing(connect_db()) as db:
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
            db.execute('INSERT into pastes (cipher, expiration, added) values (?, ?, ?)', [app.config['BEANCIPHER'], "infinite", 0])   
        db.commit()

def connect_db():
    return sqlite3.connect(app.config['DATABASE'])

@app.before_request
def before_request():
    g.db = connect_db()

@app.teardown_request
def teardown_request(exception):
    db = getattr(g, 'db', None)
    if db is not None:
        db.close()

@app.before_first_request
def start_thread():
    def delete_thread():
        logging.info("Started working thread")
        with closing(connect_db()) as db:
            while True:
                try:
                    cur_time = int(time())
                    cur = db.execute("SELECT id FROM pastes WHERE expiration+0=expiration and ?>added+expiration", [cur_time])

                    ids = [x[0] for x in cur.fetchall()]
                    if len(ids)>0:
                        logging.debug("Deleted from database (ids {%s})" % ", ".join(map(lambda x: str(x), ids)))
                    db.execute("DELETE FROM pastes WHERE expiration+0=expiration and ?>added+expiration", [cur_time])
                    db.commit()

                except Exception as e:
                    logging.error(e)
                finally:
                    sleep(app.config["THREAD_SLEEP"])
    Thread(target=delete_thread).start()

def redirectToIndex(code=200):
    resp = Response("")
    resp.headers['Location'] = url_for('index')
    return resp, code

#!---Routes---!#
import seanbin.views
