/* slider_mv.js
UofT SCS Data Analytics Boot Camp
Project 3 - Poxy_Server
Team Members:  Bobby Bhattacharjee, Laurel Lobo, Gobind Singh, Jose Tomines, Callan Yan
Author:        Jose Tomines
Purpose:       Used for the measles / vaccination view, this displays the slider to select the year of data to view on the map
Source:        https://github.com/artiichoke/165_Final_Project - Leveraged code for slider from the source project and adapted for the larger data set used in this project
*/

var step = 0;
var current_year = 1995;
//var filename = ("mmr/data/data" + current_year + ".csv").toString();

display(current_year);

d3.select("#slider").on('change', function(d) {       
       var incrementation = parseInt(this.value);
       current_year = (1995 + incrementation);
       d3.select("#year").text(""+current_year);
       svg.selectAll("path").remove();
       svg.selectAll(".dot").remove();
       return display(current_year);
});