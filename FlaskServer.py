import sqlite3, os, sys
from contextlib import closing
from flask import *
from werkzeug import secure_filename
from threading import Thread
from FLASK_CONFIG import EXPIRATIONS
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
    def worker():
        logging.info("Started working thread")
        with closing(connect_db()) as db:
            while True:
                try:
                    cur_time = int(time())
                    cur = db.execute("SELECT id FROM pastes WHERE expiration+0=expiration and ?>added+expiration", [cur_time])

                    ids = [x[0] for x in cur.fetchall()]
                    if len(ids)>0:
                        logging.debug("Deleted from database ids %s", ids)
                    db.execute("DELETE FROM pastes WHERE expiration+0=expiration and ?>added+expiration", [cur_time])
                    db.commit()

                except Exception as e:
                    logging.error(e)
                finally:
                    sleep(2)
    Thread(target=worker).start()
#!---Routes---!#

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/')
def seanbin():
    return render_template('sean_bin.html'), 200

@app.route('/go', methods=['POST'])
def go():
    if len(request.form['imgfile']) > 607062:
        logging.info("A paste was rejected due to it being too long (%d Bytes)" % len(request.form['imgfile']))
        flash("The paste was not accepted, submit a smaller image file")
        return render_template('sean_bin.html'), 200
    expiration = str(EXPIRATIONS[request.form['expiration']]) if request.form['expiration'] in EXPIRATIONS else 'infinite'
    g.db.execute('INSERT into pastes (cipher, expiration, added) values (?, ?, ?)', [request.form['imgfile'], expiration, time()])
    g.db.commit()
    logging.info("Inserted a paste to DB")
    cur = g.db.execute("SELECT id FROM pastes ORDER BY id desc LIMIT 1")
    result = cur.fetchone()
    return redirect(url_for('paste', pasteid=result[0]))

@app.route('/paste/<pasteid>')
def paste(pasteid):
    url = url_for('paste', pasteid = pasteid)
    if pasteid == "demo":
        return render_template('check_bin.html', pastename=1, url = url, added = "The start of times"), 200
    elif pasteid == '1':
        flash("Not found, this paste may have expired")
        return redirect(url_for('seanbin'), code=301)
    cur = g.db.execute("SELECT cipher, added FROM pastes WHERE id=?", [pasteid] )
    result = cur.fetchone()
    if result:
        return render_template('check_bin.html', pastename=pasteid, url = url, added = strftime("%c UTC", gmtime(result[1])), added_sec=result[1]), 200
    else:
        flash("Not found, this paste may have expired")
        return redirect(url_for('seanbin'), code=301)

@app.route('/ciphers/<int:pasteid>')
def demo(pasteid):
    if pasteid < 1:
        abort(400)
    cur = g.db.execute("SELECT cipher FROM pastes WHERE id=?", [pasteid])
    try:
        result = cur.fetchone()
        cipher = result[0]
    except TypeError:
        abort(404)
    return cipher

@app.route('/Fonts/<filename>')
def fonts(filename):
    return send_from_directory(os.path.join(app.root_path, 'static/Fonts'), secure_filename(filename))

@app.route('/faq')
def faq():
    return render_template('FAQ.html'), 200
@app.route('/video.mp4')
def vid():
    print "Someone is watching the video"
    return send_from_directory(app.root_path, 'video.mp4')
@app.route('/files/<filename>')
def sendfile(filename):
    return send_from_directory(app.root_path, 'wish.mp3')
if __name__ == '__main__':
    app.run(host = '0.0.0.0', port = 80)