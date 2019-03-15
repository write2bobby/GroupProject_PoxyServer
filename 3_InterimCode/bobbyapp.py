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


@app.route("/names")
def names():
    """Return a list of sample names."""

    # Use Pandas to perform the sql query
    sel = [master.disease]

    results = session.query(*sel).distinct().all()

    menu_ls = []

    for r in results:
        if r[0] == "PERTUSSIS":
            continue
        else:
            menu_ls.append(r[0])

    # Return a list of the column names (sample names)
    
    
    return jsonify(menu_ls)

'''
@app.route("/metadata/<sample>")
def sample_metadata(sample):
    """Return the MetaData for a given sample."""
    sel = [
        Samples_Metadata.sample,
        Samples_Metadata.ETHNICITY,
        Samples_Metadata.GENDER,
        Samples_Metadata.AGE,
        Samples_Metadata.LOCATION,
        Samples_Metadata.BBTYPE,
        Samples_Metadata.WFREQ,
    ]

    results = db.session.query(*sel).filter(Samples_Metadata.sample == sample).all()

    # Create a dictionary entry for each row of metadata information
    sample_metadata = {}
    for result in results:
        sample_metadata["sample"] = result[0]
        sample_metadata["ETHNICITY"] = result[1]
        sample_metadata["GENDER"] = result[2]
        sample_metadata["AGE"] = result[3]
        sample_metadata["LOCATION"] = result[4]
        sample_metadata["BBTYPE"] = result[5]
        sample_metadata["WFREQ"] = result[6]

    print(sample_metadata)
    return jsonify(sample_metadata)
'''

@app.route("/barGraph")
def samples():
    """Return `otu_ids`, `otu_labels`,and `sample_values`."""
    sel = [master.disease,
           master.state_name,
           func.avg(master.incidence_per_capita)]


    disease_data = []
    state_data = []
    incidence_per_capita_data = []

    results1 = session.query(*sel).\
            group_by(master.disease, master.state_name).\
            order_by(master.disease.asc()).all()

    for r in results1:
        disease_data.append(r[0])
        state_data.append(r[1])
        incidence_per_capita_data.append(r[2])
    # Format the data to send as json
    data = {
        "disease": disease_data,
        "state_name": state_data,
        "incidence_per_capita": incidence_per_capita_data,
    }
    return jsonify(data)


if __name__ == "__main__":
    app.run()
