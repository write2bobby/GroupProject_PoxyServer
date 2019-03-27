import os

import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func, inspect, distinct

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)


#################################################
# Database Setup
#################################################

engine = create_engine("postgres://gxxdlokrikmuew:56373f2fbd48e1486f270abfc7bb86988844e9210a50f1e66a9055d3c86d61de@ec2-107-22-238-186.compute-1.amazonaws.com:5432/da78e6ihkq1cnl")

# reflect an existing database into a new model
Base = automap_base()

# reflect the tables
Base.prepare(engine, reflect=True)
session = Session(engine)

# Save references to each table
master = Base.classes.master
states = Base.classes.states
vacc = Base.classes.vaccinations


@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")

##################################################################
# Disease dropdown
##################################################################

@app.route("/names")
def names():
    """Return a list of sample names."""

    # Use sqlalchemy to perform the sql query
    sel = [master.disease]

    results = session.query(*sel).distinct().all()

    menu_ls = []

    for r in results:
        if r[0] == "PERTUSSIS":
            continue
        else:
            menu_ls.append(r[0])

    # Return a list of the disease names
    
    return jsonify(menu_ls)

##################################################################
# Bobby's data
##################################################################
@app.route("/barGraph")
def diseases():
    sel = [master.disease,
           master.state_name,
           master.incidence_per_capita]

    results0 = session.query(*sel).\
               group_by(master.disease, master.state_name, master.incidence_per_capita).\
               order_by(master.disease.asc()).all()

    finalData_0 = []

    for r in results0:
        row = {
            'disease': r[0],
            'state_name': r[1],
            'incidence_per_capita': r[2]
            }
        finalData_0.append(row)
    
    return jsonify(finalData_0)

##################################################################
# Jose's data
##################################################################

@app.route("/mapping")
def mapping():
    sel = [vacc.state_name,
           vacc.mmr_rate,
           vacc.year]

    results1 = session.query(*sel).\
               group_by(vacc.state_name, vacc.mmr_rate, vacc.year).all()

    finalData_1 = []

    for r in results1:
        row = {
            'state': r[0],
            'MMR_rate': r[1],
            'year': r[2]
            }
        finalData_1.append(row)

    ###print(finalData_1)
    return jsonify(finalData_1)

@app.route("/incidence/<disease>")
def incidence(disease):
    sel = [states.state_name,
           states.latitude,
           states.longitude,
           master.year,
           master.cases,
           master.incidence_per_capita]

    results2 = session.query(*sel).\
               join(master, states.state_name == master.state_name).\
               filter(master.disease == disease).all()

    finalData_2 = []

    for r in results2:
        row = {
            'state': r[0],
            'latitude': r[1],
            'longitude': r[2],
            'year': r[3],
            'case_count': r[4],
            'incidence_per_capita': r[5]
            }
        finalData_2.append(row)
        
    ###print(finalData_2)
    return jsonify(finalData_2)

##################################################################
# Callan and Laurel's data
##################################################################
@app.route("/d3")
def d3():
    sel = [master.disease,
           master.year,
           func.avg(master.incidence_per_capita)]

    results3 = session.query(*sel).\
               filter(master.year.between('1974', '2002')).\
               group_by(master.disease, master.year).\
               order_by(master.disease.asc(), master.year.asc()).all()

    finalData_3 = []

    for r in results3:
        row = {'disease': r[0],
               'year': r[1],
               'incidence': r[2]
            }
        finalData_3.append(row)
    
    ###print(finalData_3)
    return jsonify(finalData_3)
    
if __name__ == "__main__":
    app.run()
