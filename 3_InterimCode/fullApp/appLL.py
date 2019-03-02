###################################################
#Dependencies
###################################################

from flask import Flask, jsonify, render_template



app = Flask(__name__)


#Homepage render
@app.route("/")
def index():
    return render_template("index.html")
    