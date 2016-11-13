from flask import *
from FLASK_CONFIG import EXPIRATIONS
from time import *
from seanbin import app, logging
import json
import os

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/')
def index():
    return render_template('sean_bin.html'), 200

@app.route('/go', methods=['POST'])
def go():
    request.form = json.loads(request.get_data())
    # return render_template("FAQ.html")

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
    # return redirect("https://www.facebook.com/", code=301)
    resp = Response("")
    resp.headers['Location'] = url_for('paste', pasteid=result[0])
    return resp, 200

@app.route('/paste/<pasteid>')
def paste(pasteid):
    url = url_for('paste', pasteid = pasteid)
    if pasteid == "demo":
        return render_template('check_bin.html', pastename=1, url = url, added = "The start of times"), 200
    elif pasteid == '1':
        flash("Not found, this paste may have expired")
        return redirect(url_for('index'), code=301)
    cur = g.db.execute("SELECT cipher, added FROM pastes WHERE id=?", [pasteid] )
    result = cur.fetchone()
    if result:
        return render_template('check_bin.html', pastename=pasteid, url = url, added = strftime("%c UTC", gmtime(result[1])), added_sec=result[1]), 200
    else:
        flash("Not found, this paste may have expired")
        return redirect(url_for('index'), code=301)

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
