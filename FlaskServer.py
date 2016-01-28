import sqlite3, os, sys
from contextlib import closing
from flask import *
from werkzeug import secure_filename
from threading import Thread
from FLASK_CONFIG import EXPIRATIONS
from time import *
from log import getLogger

# python string formatting
# Remove the expired pastes using 1 thread, which reads from the database

# Delete the css and HTML and design it using bootstrap
#All the debuging should utilize Debugging

# Worker thread:
# while True:
#   try:
#        do something
#   execpt:
#        log and sababa
#   sleep

app = Flask(__name__)
app.config.from_object('FLASK_CONFIG')
logging = getLogger(app.config['CONSOLE_FORMATS'], app.config['FILE_FORMATS'])


def init_db():
    with closing(connect_db()) as db:
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
            with open("BeanCipher.txt", 'r') as fr:
                db.execute('INSERT into pastes (cipher, expiration, added) values (?, ?, ?)', [fr.read(), "infinite", 0])   
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


 # wtf is job? name is not descriptive I dont know what this fucking function does   


@app.before_first_request
def start_thread():
    def worker():
        logging.info("Started working thread")
        with closing(connect_db()) as db:
            # fix sql injection
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
    flash("bla")
    return render_template('sean_bin.html'), 200


@app.route('/go', methods=['POST'])
def go():

    expiration = str(EXPIRATIONS[request.form['expiration']]) if request.form['expiration'] in EXPIRATIONS else 'infinite'
    g.db.execute('INSERT into pastes (cipher, expiration, added) values (?, ?, ?)', [request.form['imgfile'], expiration, time()])
    g.db.commit()
    logging.info("Inserted a paste to DB")
    cur = g.db.execute("SELECT id FROM pastes ORDER BY id desc LIMIT 1")
    result = cur.fetchone()
    return redirect(url_for('paste', pasteid=result[0]))

@app.route('/hello/')
@app.route('/hello/<name>')
def hello(name=None):
    cur = g.db.execute("SELECT cipher FROM pastes ORDER BY id desc LIMIT 1")
    result = cur.fetchone()
    return render_template('hello.html', name='BITCHASS NIGGA!!'), 200

@app.route('/paste/<pasteid>')
def paste(pasteid):
    url = url_for('paste', pasteid = pasteid)
    if pasteid == "demo":
        return render_template('check_bin.html', pastename=1, url = url, added = "The start of times"), 200
    elif pasteid == '1':
        flash("Not found, this paste may have expired")
        return redirect(url_for('seanbin'))
    cur = g.db.execute("SELECT cipher, added FROM pastes WHERE id=?", [pasteid] )
    result = cur.fetchone()
    if result:
        return render_template('check_bin.html', pastename=pasteid, url = url, added = strftime("%c UTC", gmtime(result[1])), added_sec=result[1]), 200
    else:
        flash("Not found, this paste may have expired")
        return redirect(url_for('seanbin'))

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

@app.route('/fonts/<filename>')
def fonts(filename):
    return send_from_directory(os.path.join(app.root_path, 'static/fonts'), secure_filename(filename))
# Pass the hardcoded path to some confugration
@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        f = request.files['file']
        print f.filename
        f.save(os.path.join(app.root_path, secure_filename(f.filename)))
        return redirect(url_for('hello'))
    return render_template('upload.html'), 200

if __name__ == '__main__':
    app.run(host = '0.0.0.0', port = 80)