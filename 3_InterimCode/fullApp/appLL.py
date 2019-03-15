###################################################
#Dependencies
###################################################
import os

import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

##################################################
# Database config
##################################################

#################################################
# Database Setup
#################################################

engine = create_engine("postgres://gxxdlokrikmuew:56373f2fbd48e1486f270abfc7bb86988844e9210a50f1e66a9055d3c86d61de@ec2-107-22-238-186.compute-1.amazonaws.com:5432/da78e6ihkq1cnl")

# reflect an existing database into a new model
Base = automap_base()

# reflect the tables
Base.prepare(db.engine, reflect=True)
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
            
    menu_data = []

    for x in menu_ls:
        menu_row = {
            'disease': x
        }
        menu_data.append(menu_row)

    # Return a list of the column names (sample names)
    
    
    return jsonify(menu_data)


# Disease data retrieval
@app.route("/diseases/<sample>")
def samples(sample):
    """Return `otu_ids`, `otu_labels`,and `sample_values`."""
    stmt = db.session.query(MasterTable).statement
    df = pd.read_sql_query(stmt, db.session.bind)

    # Filter the data based on the disease name
    sample_data = df.loc[df[disease] == sample, ["state_name", "year", "incidence_per_capita", sample]]
    # Format the data to send as json
    data = {
        "state_name": sample_data.state_name.values.tolist(),
        "incidence_per_capita": sample_data[sample].values.tolist(),
        "otu_labels": sample_data.otu_label.tolist(),
    }
    return jsonify(data)
    
if __name__ == "__main__":
    app.run()
