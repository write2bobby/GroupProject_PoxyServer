/* key_mv.js
UofT SCS Data Analytics Boot Camp
Project 3 - Poxy_Server
Team Members:  Bobby Bhattacharjee, Laurel Lobo, Gobind Singh, Jose Tomines, Callan Yan
Author:        Jose Tomines
Purpose:       Used for the measles / vaccination view, this displays the map key describing the colour range indicating the % MMR Vaccination rate for each state
Source:        https://github.com/artiichoke/165_Final_Project - Leveraged code for key from the source project
*/

var width = 1100,
    height = 30,
    formatPercent = d3.format(".0%"),
    formatNumber = d3.format(".0f");

var threshold = d3.scale.threshold()
    .domain([.80, .82, .84, .86, .88, .90, .92, .94, .96, .98, 1])

    .range([
        'rgb(247, 251, 255)',
        'rgb(227, 238, 249)',
        'rgb(207, 225, 242)',
        'rgb(181, 212, 233)',
        'rgb(147, 195, 223)',
        'rgb(109, 174, 213)',
        'rgb(75, 151, 201)',
        'rgb(47, 126, 188)',
        'rgb(24, 100, 170)',
        'rgb(10, 74, 144)',
        'rgb(8, 48, 107)'
       ]);


// A position encoding for the key only.
var x = d3.scale.linear()
    .domain([.9, 1])
    .range([0, 300]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(13)
    .tickValues(threshold.domain())
    .tickFormat(function (d) {
        return d === 5 ? formatPercent(d) : formatNumber(100 * d);
    });

//positioning affects the slider
var svg2 = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

//positioning affects the key
var g = svg2.append("g")
    .attr("class", "key")
    .attr("transform", "translate(" + (width - 240) / 2 + "," + height / 2 + ")");

g.selectAll("rect")
    .data(threshold.range().map(function (color) {
        var d = threshold.invertExtent(color);
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        return d;
    }))
    .enter().append("rect")
    .attr("height", 8)
    .attr("x", function (d) {
        return x(d[0]);
    })
    .attr("width", function (d) {
        return x(d[1]) - x(d[0]);
    })
    .style("fill", function (d) {
        return threshold(d[0]);
    });

g.call(xAxis).append("text")
    .attr("class", "caption")
    .attr("y", -6)
    .attr("x", -60)
    .text("Population Vaccinated (%)");