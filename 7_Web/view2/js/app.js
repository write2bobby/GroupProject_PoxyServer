function buildMetadata(sample) {

  // Use `d3.json` to fetch the metadata for a sample from the appropriate route
  d3.json(`/metadata/${sample}`).then(function (data) {
    
    // Use d3 to select the panel with id of `#sample-metadata`
    var metaPanel = d3.select("#sample-metadata")

    // Use `.html("") to clear any existing metadata
    metaPanel.html("")

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    
    Object.entries(data).map(([key,value]) => metaPanel.append('p').append('span').text(`${key} : ${value}`))

    //Building gauge
    // buildGauge(data.WFREQ)
    var level = (((data.WFREQ) + 1)*18) - 9
    
    // Trig to calc meter point
    var degrees = 180 - level,
        radius = .5;

    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';

    var path = mainPath.concat(pathX,space,pathY,pathEnd);

    var data = [{ type: 'scatter',
      x: [0], y:[0],
        marker: {size: 28, color:'850000'},
        showlegend: false,
        name: 'Washing Frequency',
        text: level,
        hoverinfo: 'text+name'},
      { values: [50/10, 50/10, 50/10, 50/10, 50/10, 50/10, 50/10, 50/10, 50/10, 50/10, 50],
      rotation: 90,
      text: ['9', '8', '7', '6',
                '5', '4', '3', '2', '1', '0', ''],
      textinfo: 'text',
      textposition:'inside',
      marker: {colors:['rgb(238, 248, 252)',
                      'rgb(213, 228, 248)',
                      'rgb(188, 209, 245)',
                      'rgb(163, 189, 242)',
                      'rgb(139, 170, 239)',
                      'rgb(114, 150, 235)',
                      'rgb(106, 144, 234)',
                      'rgb(84, 126, 231)',
                      'rgb(62, 109, 228)',
                      'rgb(40, 92, 226)',
                      'rgb(255, 255, 255)']},
      labels: ['Nice and clean!', 'Common, just a little more!', 'You can now go to a beach', 'You are now acceptable for a date', 'I hear rubbing alcohol helps', 'You are now allowed outside', 'Scrub harder!', 'start scrubbing', 'Jesus', 'Does your mother know?', ''],
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false
    }];

    var layout = {
      shapes:[{
          type: 'path',
          path: path,
          fillcolor: '850000',
          line: {
            color: '850000'
          }
        }],
      title: 'Washing Frequency',
      xaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]},
      yaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]}
    };

    Plotly.newPlot('gauge', data, layout);
  //*/
  })};

function buildCharts(sample) {

  // Setting the url for data fetch
  var samples = `/samples/${sample}`
  
  //Obtaining the values from the url and pushing into a new array 
  d3.json(samples).then(function (sampleData) {
    
    //Extract values and store in new array
    var sample_values=sampleData.sample_values
    var otu_ids=sampleData.otu_ids
    var otu_labels=sampleData.otu_labels

    //create new JSON of sample data as a mirror of the url data
    
    var len = sample_values.length;
    var finalSampleData = []
    
    for (var i = 0; i < len; i++) {
      var element = {
        "sample_values": sample_values[i],
        "otu_ids": otu_ids[i],
        "otu_labels": otu_labels[i]
      };

      finalSampleData.push(element);
    };
    
    //Sort, slice and reverse sampleData to get top 10
    
    finalSampleData.sort(function(a, b) {
      return parseFloat(b.sample_values) - parseFloat(a.sample_values);
    })

    topTen = finalSampleData.slice(0, 10);


    topTen = topTen.reverse();
    
    //Build a Pie Chart
    var pieTrace={
      values: topTen.map(data => data.sample_values),
      labels: topTen.map(data => data.otu_ids),
      text: topTen.map(data => data.otu_labels),
      textinfo: 'percent',
      type: 'pie',
      hoverinfo: 'label + percent + text'
    }

    var pieData = [pieTrace]

    var pieLayout = {
      title: "Belly Button Microbe Distribution"
    }

    Plotly.newPlot('pie', pieData, pieLayout)
    
    //Build a Bubble Chart

    var bubbleTrace={
      x: topTen.map(data => data.otu_ids),
      y: topTen.map(data => data.sample_values),
      text: topTen.map(data => data.otu_labels),
      mode: 'markers',
      marker: {
        size: topTen.map(data => data.sample_values),
        color: topTen.map(data => data.otu_ids)
      },
      hoverinfo: 'text + x + y'
    };

    var bubbleData=[bubbleTrace];

    var bubbleLayout={
      xaxis: {
        title: "OTU ID"
      },
      yaxis: {
        title: "Count"
      },
      autosize: true
    }
    
    Plotly.newPlot('bubble', bubbleData, bubbleLayout);
  })
};

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
