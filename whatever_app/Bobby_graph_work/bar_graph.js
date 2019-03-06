import pandas as pd
import numpy as np
import plotly.plotly as py
import plotly.graph_objs as go

# Import data from csv
df = pd.read_csv('hepatitis_byYear_cases.csv')
df.head()

trace1 = go.Scatter(
    x=df['x'], y=df['logx'], # Data
    mode='lines', name='logx' # Additional options
   )
trace2 = go.Scatter(x=df['x'], y=df['sinx'], mode='lines', name='sinx' )
trace3 = go.Scatter(x=df['x'], y=df['cosx'], mode='lines', name='cosx')

layout = go.Layout(title='Simple Plot from csv data',
   plot_bgcolor='rgb(230, 230,230)')

fig = go.Figure(data=[trace1, trace2, trace3], layout=layout)

# Plot data in the notebook
py.iplot(fig, filename='simple-plot-from-csv')