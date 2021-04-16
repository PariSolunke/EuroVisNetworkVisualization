let box = document.querySelector('#map');
let w = box.offsetWidth;

var tooltip = d3.select('body')
.append('div')
.style('position', 'absolute')
.style('padding', '0 10px')
.style('background', 'white')
.style('opacity', 0);

multiplier=w/1920

var width = w,
    height = multiplier*830;

var projection = d3.geoMercator()
  .center([0, 42])
  .rotate([110, 0])
  .scale(250)
  .translate([width / 2, height / 2])

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var path = d3.geoPath()
    .projection(projection);

var g = svg.append("g");

// load and display the World
d3.json("world110.json").then(function(topology) {

    g.selectAll("path")
       .data(topojson.feature(topology, topology.objects.countries)
           .features)
       .enter().append("path")
       .attr("d", path);

});


topUnis()


function topUnis(){
    $( "#slider-range" ).slider({
        range: true,
        min: 1,
        max: 11,
        values: [ 1, 11 ],
        slide: function( event, ui ) {
          $( "#amount" ).html( "Filter by No. of Affiliations: " + ui.values[ 0 ] + "-" + ui.values[ 1 ] );
          drawUnis()

        }
      });
      $( "#amount" ).html( "Filter by No. of Affiliations: " + $( "#slider-range" ).slider( "values", 0 ) +
        "-" + $( "#slider-range" ).slider( "values", 1 ) );
        drawUnis()
   /* var marker = d3.symbol()
            .type(d3.symbolDiamond)
            .size(40)
*/
    function drawUnis(){
    d3.csv("topUnis.csv").then(function(uniData) 
    {
        svg.selectAll("rect").remove()

        let low=$( "#slider-range" ).slider( "values", 0 )
        let high=$( "#slider-range" ).slider( "values", 1 )
        let filtData=uniData.filter(d => (d.Affiliations>=low && d.Affiliations<=high));

        var uniColors= d3.scaleLinear()
                .domain([1,11])
                .range(["#fcfbfd","#54278f"]);


        svg.append("g")
        .selectAll("rect")
        .data(filtData)
        .enter()
        .append('rect')
        .on('mouseover', function(d) {
          
            tooltip.transition().duration(200)
              .style('opacity', .9)
              .style('pointer-events', 'none')
          
            tooltip.html('<div style=" font-weight: bold">' +d.University+'<br>Affililations: '+d.Affiliations+'</div>')
            .style('left', (d3.event.pageX -55) + 'px')
            .style('top', (d3.event.pageY +40) + 'px')
          })
          .on('mouseout', function(d) {tooltip.html('')})
        .attr("x",-2)
        .attr("y",-2)
        .attr("width",4)
        .attr("height",4)
        .style("stroke", "black")
        .style("fill", function(d) { return uniColors(d.Affiliations);})
        .attr("transform", function(d) { return "translate(" + projection([d.lng,d.lat]) + ")" + " rotate(45)"; }) 
        .transition()
        .call(zoom.transform, d3.zoomIdentity);	
    
        

       


      
    });

    
    var zoom = d3.zoom()
    .scaleExtent([1, 4])
    .on('zoom', function() {
        svg.selectAll('g')
         .attr('transform', d3.event.transform);

});

svg.call(zoom);
    
}}


function topResearchers(){

 $( "#slider-range" ).slider({
        range: true,
        min: 0,
        max: 20,
        values: [ 0, 20 ],
        slide: function( event, ui ) {
          $( "#amount" ).html( "Filter by No. of Connections: " + ui.values[ 0 ] + "-" + ui.values[ 1 ] );
          drawResearchers()


        }
      });
      $( "#amount" ).html( "Filter by No. of Connections: " + $( "#slider-range" ).slider( "values", 0 ) +
        "-" + $( "#slider-range" ).slider( "values", 1 ) );
        drawResearchers()
   /* var marker = d3.symbol()
            .type(d3.symbolDiamond)
            .size(40)
*/
    function drawResearchers(){
   
        svg.selectAll("rect").remove();


   /* var marker = d3.symbol()
            .type(d3.symbolDiamond)
            .size(40)
*/
    d3.csv("topResearchers.csv").then(function(resData) 
    {
        let low=$( "#slider-range" ).slider( "values", 0 )
        let high=$( "#slider-range" ).slider( "values", 1 )
        let filtData=resData.filter(d => (d.count>=low && d.count<=high));
        var resColors= d3.scaleLinear()
                .domain([0,20])
                .range(["#fcfbfd","#54278f"]);

        svg.append("g")
        .selectAll("rect")
        .data(filtData)
        .enter()
        .append('rect')
        .on('mouseover', function(d) {
          
            tooltip.transition().duration(200)
              .style('opacity', .9)
              .style('pointer-events', 'none')
          
            tooltip.html('<div style=" font-weight: bold">' +d.name+'<br>Institution: '+d.institution+'<br>Connections: '+d.count+'</div>')
            .style('left', (d3.event.pageX -65) + 'px')
            .style('top', (d3.event.pageY +40) + 'px')
          })
          .on('mouseout', function(d) {tooltip.html('')})
        .attr("x",-2)
        .attr("y",-2)
        .attr("width",4)
        .attr("height",4)
        .style("stroke", "black")
        .style("fill", function(d) { return resColors(d.count);})
        .attr("transform", function(d) { return "translate(" + projection([d.lng,d.lat]) + ")" + " rotate(45)"; })
        .transition()
        .call(zoom.transform, d3.zoomIdentity) ;	
       
        

       


      
    });

    
    var zoom = d3.zoom()
    .scaleExtent([1, 3])
    .on('zoom', function() {
       
         svg.selectAll('g')
         .attr('transform', d3.event.transform)
         
        
});

svg.call(zoom);
    
}
}

$('#selectType').on('change', function() {
    var selectType=document.getElementById("selectType");

    let selection=selectType.options[selectType.selectedIndex].value
    
    if (selection==1)
        topUnis();
    else
        topResearchers();
});
  
