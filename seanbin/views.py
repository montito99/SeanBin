from flask import *
from FLASK_CONFIG import EXPIRATIONS
from string import printable as printable_chars
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
    if not set(request.form["imgfile"]).issubset(set(printable_chars)):
        flash("The selected file is not an image, submit a valid image file!")
        resp = Response("")
        resp.headers['Location'] = url_for('index')
        return resp, 200

    if len(request.form["imgfile"]) > 607062:
        logging.info("A paste was rejected due to it being too long (%d Bytes)" % len(request.form["imgfile"]))
        flash("The paste was not accepted, submit a smaller image file")
        resp = Response("")
        resp.headers['Location'] = url_for('index')
        return resp, 200

    if request.form['expiration'] in EXPIRATIONS:
        expiration = str(EXPIRATIONS[request.form['expiration']])
    else:
        flash("Enter valid values!")
        resp = Response("")
        resp.headers['Location'] = url_for('index')
        return resp, 200
    g.db.execute("INSERT into pastes (cipher, expiration, added) values (?, ?, ?)", [request.form["imgfile"], expiration, time()])
    g.db.commit()
    cur = g.db.execute("SELECT id FROM pastes ORDER BY id desc LIMIT 1")
    result = cur.fetchone()

    logging.debug("Inserted a paste to DB [%s]" % result)
    cur = g.db.execute("SELECT id FROM pastes ORDER BY id desc LIMIT 1")
    result = cur.fetchone()

    resp = Response("")
    resp.headers['Location'] = url_for('paste', pasteid=result[0])
    return resp, 200

@app.route('/paste/<pasteid>')
def paste(pasteid):
    url = url_for('paste', pasteid = pasteid)
    if pasteid == "demo":
        return render_template('check_bin.html', pastename=1, url = url, added = "The start of times"), 200
    elif pasteid != '1':
        cur = g.db.execute("SELECT cipher, added FROM pastes WHERE id=?", [pasteid] )
        result = cur.fetchone()
        if result:
            return render_template('check_bin.html', pastename=pasteid, url = url, added = strftime("%c UTC", gmtime(result[1])), added_sec=result[1]), 200
    else:
        flash("Not found, this paste may have expired")
        return redirect(url_for('index'), code=302)

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
