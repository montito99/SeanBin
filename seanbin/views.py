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

@app.route('/submit', methods=['POST'])
def submit():
    try:
        request.form = json.loads(request.get_data())
    except ValueError:
        flash("Enter valid values!")
        return redirectToIndex(422)

    if not set(request.form["imgfile"]).issubset(set(printable_chars)):
        flash("The selected file is not an image, submit a valid image file!")
        return redirectToIndex(422)

    if len(request.form["imgfile"]) > 607062:
        logging.info("A paste was rejected due to it being too long (%d Bytes)" % len(request.form["imgfile"]))
        flash("The paste was not accepted, submit a smaller image file")
        return redirectToIndex(400)


    if request.form['expiration'] in EXPIRATIONS:
        expiration = str(EXPIRATIONS[request.form['expiration']])
    else:
        flash("Enter valid values!")
        return redirectToIndex(422)
    g.db.execute("INSERT into pastes (cipher, expiration, added) values (?, ?, ?);",
        [request.form["imgfile"], expiration, time()])

    g.db.commit()
    cur = g.db.execute("SELECT id FROM pastes ORDER BY id desc LIMIT 1")
    result = cur.fetchone()

    logging.debug("Inserted a paste to DB [%s]" % result)

    resp = Response("")
    resp.headers['Location'] = url_for('paste', pasteid=result[0])
    return resp, 200

@app.route('/paste/<pasteid>')
def paste(pasteid):
    url = url_for('paste', pasteid = pasteid)
    if pasteid == "demo":
        return render_template('check_bin.html', pastename=1, url = url, added = "The start of times"), 200
    elif pasteid != '1':
        cur = g.db.execute("SELECT added FROM pastes WHERE id=?", [pasteid] )
        result = cur.fetchone()
        if result:
            return render_template('check_bin.html', pastename=pasteid, url = url, added = strftime("%c UTC", gmtime(result[0])), added_sec=result[0]), 200
    flash("Not found, this paste may have expired")
    return redirect(url_for('index'), code=302)

@app.route('/ciphers/<int:pasteid>')
def get_cipher(pasteid):
    if pasteid < 1:
        abort(422)
    cur = g.db.execute("SELECT cipher FROM pastes WHERE id=?", [pasteid])
    try:
        result = cur.fetchone()
        cipher = result[0]
    except TypeError:
        abort(404)
    return cipher, 200

@app.route('/Fonts/<filename>')
def fonts(filename):
    return send_from_directory(os.path.join(app.root_path, 'static/Fonts'), secure_filename(filename))

@app.route('/faq')
def faq():
    return render_template('FAQ.html'), 200
