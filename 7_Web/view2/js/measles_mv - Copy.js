/* measles_mv.js
UofT SCS Data Analytics Boot Camp
Project 3 - Poxy_Server
Team Members:  Bobby Bhattacharjee, Laurel Lobo, Gobind Singh, Jose Tomines, Callan Yan
Author:        Jose Tomines
Purpose:       Used for the measles / vaccination view, this displays the US map with each state's % MMR vaccination rate and number of measle cases from 1995-2017
Notes:         Slider selects year of the data
               % MMR vaccination rates per State is displayed as a chloropleth
               Number of measle cases for each state is displayed as a location point with size of point showing number of cases.
               The Longitude & Latitude of the measle case points is the geographic centre of the State.  This is because the measle outbreak data was aggregated by State
               Hover displays the vaccination rate and measles data for that state
Source:        https://github.com/artiichoke/165_Final_Project - Leveraged code for measles map and adapted for larger data set
*/

/* Map heavily modeled after Mike Bostock's code from Chapter 12 (05_choropleth.js) */

// CREATE MAP

//Width and height
var w = 1000;
var h = 550;

//Define map projection
var projection = d3.geo.albersUsa()
    .translate([w / 2, h / 2])
    .scale([1100]);

//Define path generator
var path = d3.geo.path()
    .projection(projection);


//Colors taken from colorbrewer.js, included in the D3 download
//Define quantize scale to sort data values into buckets of color

var color = d3.scale.quantize()
.range([
    'rgb(8, 48, 107)',
    'rgb(10, 74, 144)',
    'rgb(24, 100, 170)',
    'rgb(47, 126, 188)',
    'rgb(75, 151, 201)',
    'rgb(109, 174, 213)',
    'rgb(147, 195, 223)',
    'rgb(181, 212, 233)',
    'rgb(207, 225, 242)',
    'rgb(227, 238, 249)',
    'rgb(247, 251, 255)'
   ]);



//Create SVG element
var svg = d3.select("body")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

//Some of the code to bind outbreak and vaccination data to the slider was inspired by this d3 visualization: http://bl.ocks.org/carsonfarmer/11478345
//Load in vaccination rates data
function display(Year) {    
    d3.csv("./data/data" + Year + ".csv", function (data) {
    data.forEach(function(d) {
               d.MMR_rates = 100 - (+d.MMR_rates);                                    
            });
    
    //Set input domain for color scale
    color.domain([
            d3.min(data, function (d) {
            return (d.MMR_rates);
        }),
            d3.max(data, function (d) {
            return (d.MMR_rates);
        })
        ]);

    //Code copied from Mike Bostock's Chater 12 choropleth.js
    //Load in GeoJSON data
    d3.json("./data/us-states.json", function (json) {
        //Merge the ag. data and GeoJSON
        //Loop through once for each ag. data value
        for (var i = 0; i < data.length; i++) {
            //Grab state name
            var dataState = data[i].State;
            //Grab data value, and convert from string to float
            var dataValue = parseFloat(data[i].MMR_rates);

            //Find the corresponding state inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {
                var jsonState = json.features[j].properties.name;

                if (dataState == jsonState) {
                    //Copy the data value into the JSON
                    json.features[j].properties.value = dataValue;

                    //Stop looking through the JSON
                    break;
                }
            }
        }

        //Bind data and create one path per GeoJSON feature
        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", function (d) {
                //Get data value
                var value = d.properties.value;

                if (value) {
                    //If value exists…
                    return color(value);
                } else {
                    //If value is undefined…
                    return "#ccc";
                }
        })
            //code modified from Mike Bostock's Chaper 12 example scripts
            .on("mouseover", function(d) {
            
                var mmr_average = 100 - Math.round((d.properties.value) * 100) / 100;
                var state = d.properties.name;
                    //Update the tooltip position and value
                    d3.select("#tooltip")
                        .style("left", d3.event.pageX + "px")
                        .style("top", d3.event.pageY + "px")						
                        .select("#value")
                        .html('<b>State:</b> ' + state + '<br/><b>Vaccination average:</b> ' + mmr_average + '%');

                    //Show the tooltip
                    d3.select("#tooltip").classed("hidden", false);
               })
               .on("mouseout", function() {
                    //Hide the tooltip
                    d3.select("#tooltip").classed("hidden", true);
               });            
                
        //Load in cities data
        d3.csv("./data/measles_outbreaks_" + Year + ".csv", function(data) {
            console.log(Year);
              data.forEach(function(d) {
               d.state = d.state.toString();
               d.lat = +d.lat;
               d.lon = +d.lon;
               d.year = +d.year;
               d.cases = +d.cases;
               //state,lat,lon,year
            });
            
            svg.selectAll(".dot")
               .data(data)
               .enter()
               .append("circle")
               .attr("class", "dot")
               .attr("cx", function(d) {
                   console.log(d.state, d.lat, d.lon, d.year, d.cases);
                   return projection([d.lon, d.lat])[0];
                   // return projection(+d.lon);
               })
               .attr("cy", function(d) {
                   return projection([d.lon, d.lat])[1];
                    // return projection(+d.lat);
               })
               .attr("r", function(d) {
                    return Math.sqrt(parseInt(Math.log(d.cases+1)*50));
               })
               .style("fill", "red")
            
            // Code modified from Mike Bostock's Chapter 12 example scripts
              .on("mouseover", function(d) {
                    // Update the tooltip position and value
                    d3.select("#tooltip")
                        .style("left", d3.event.pageX + "px")
                        .style("top", d3.event.pageY + "px")						
                        .select("#value")
                        .html('<b>State:</b> ' + d.state + '<br/><b>Cases reported:</b> ' + d.cases);

                    //Show the tooltip
                    d3.select("#tooltip").classed("hidden", false);
               })
               .on("mouseout", function() {
                    //Hide the tooltip
                    d3.select("#tooltip").classed("hidden", true);
               });

        });
    });

});
}