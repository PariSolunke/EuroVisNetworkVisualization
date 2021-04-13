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
  .center([0, 40])
  .rotate([50, 0])
  .scale(460)
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
    svg.selectAll("rect").remove()

   /* var marker = d3.symbol()
            .type(d3.symbolDiamond)
            .size(40)
*/
    d3.csv("topUnis.csv").then(function(uniData) 
    {

        var uniColors= d3.scaleLinear()
                .domain([4,11])
                .range(["#eff3ff","#08519c"]);

        svg.append("g")
        .selectAll("rect")
        .data(uniData)
        .enter()
        .append('rect')
        .on('mouseover', function(d) {
          
            tooltip.transition().duration(200)
              .style('opacity', .9)
              .style('pointer-events', 'none')
          
            tooltip.html('<div style=" font-weight: bold">' +d.University+'<br>Affililations: '+d.Affiliations+'</div>')
            .style('left', (d3.event.pageX -65) + 'px')
            .style('top', (d3.event.pageY +40) + 'px')
          })
          .on('mouseout', function(d) {tooltip.html('')})
        .attr("x",-4)
        .attr("y",-4)
        .attr("width",8)
        .attr("height",8)
        .style("stroke", "black")
        .style("fill", function(d) { return uniColors(d.Affiliations);})
        .attr("transform", function(d) { return "translate(" + projection([d.lng,d.lat]) + ")" + " rotate(45)"; }) 
        .transition()
        .call(zoom.transform, d3.zoomIdentity);	
    
        

       


      
    });

    
    var zoom = d3.zoom()
    .scaleExtent([1, 3])
    .on('zoom', function() {
        svg.selectAll('g')
         .attr('transform', d3.event.transform);

});

svg.call(zoom);
    
}


function topResearchers(){
    svg.selectAll("rect").remove();

   /* var marker = d3.symbol()
            .type(d3.symbolDiamond)
            .size(40)
*/
    d3.csv("topResearchers.csv").then(function(resData) 
    {

        var resColors= d3.scaleLinear()
                .domain([12,20])
                .range(["#fcfbfd","#54278f"]);

        svg.append("g")
        .selectAll("rect")
        .data(resData)
        .enter()
        .append('rect')
        .on('mouseover', function(d) {
          
            tooltip.transition().duration(200)
              .style('opacity', .9)
              .style('pointer-events', 'none')
          
            tooltip.html('<div style=" font-weight: bold">' +d.Name+'<br>Institution: '+d.Affiliation+'<br>Connections: '+d.count+'</div>')
            .style('left', (d3.event.pageX -65) + 'px')
            .style('top', (d3.event.pageY +40) + 'px')
          })
          .on('mouseout', function(d) {tooltip.html('')})
        .attr("x",-4)
        .attr("y",-4)
        .attr("width",8)
        .attr("height",8)
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

$('#selectType').on('change', function() {
    var selectType=document.getElementById("selectType");

    let selection=selectType.options[selectType.selectedIndex].value
    
    if (selection==1)
        topUnis();
    else
        topResearchers();
});
  
