let box = document.querySelector('#viz');
let w = box.offsetWidth;
let box2 = document.querySelector('#side');

multiplier=window.innerWidth/1920





var margin = {top: 100, right: 20, bottom: 0, left: 20},
    width = w-margin.left-margin.right,
    height = multiplier*830;
var selected=-1;


var x = d3.scaleLinear().range([0, width]),
    y = d3.scaleLinear().range([0, height]),
    z = d3.scaleLinear().domain([0, 4]).clamp(true);

var svg = d3.select("#viz").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("CommitteeConnections.json").then(function(CommitteeConnections) {
  var matrix = [],
      nodes = CommitteeConnections.nodes,
      n = nodes.length;

  // Compute index per node.
  nodes.forEach(function(node, i) {
    node.index = i;
    node.count = 0;
    node.targets=[]
    node.convalues=[]
    matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, z: 0, connection:"", value:""}; });
  });
  
  // Convert links to matrix; count character occurrences.
  CommitteeConnections.links.forEach(function(link) {
    var sindex,tindex,con,val;
    for (i = 0; i < 84; i++) 
    {
      if (nodes[i].name == link.source)
      {
        nodes[i].targets.push(link.target)
        nodes[i].convalues.push(link.value)
        sindex=i;  
      }
      else if (nodes[i].name == link.target)
      {
      nodes[i].targets.push(link.source)
      nodes[i].convalues.push(link.value)

      tindex=i;
      }
    }
   
    matrix[sindex][tindex].z += 1;
    matrix[tindex][sindex].z += 1;
    matrix[sindex][tindex].connection=link.connection;
    matrix[sindex][tindex].value=link.value;
    matrix[tindex][sindex].value = link.value;
    matrix[tindex][sindex].connection = link.connection;
    nodes[sindex].count += 1;
    nodes[tindex].count += 1;
    
    
  });

  // The default sort order.
  x.domain([0, 6]);
  y.domain([0, 14]);


var group = svg.selectAll("g")
    .data(nodes)
  .enter().append("g")
    .attr("class", "cell")
    .attr("transform", function(d, i) { return "translate("+x(i%6)+"," + y(Math.floor(i/6)) + ")"; })
    .attr("id", function(d,i){return d.name})
    .on("click",function(){cellClick(this)});


group.append("rect")
    .attr("width", 0.9*(width/6))
    .attr("height", 0.9*(height/14))
    
    .attr("rx",1)
    
    


group.append("text")
    .attr("transform", function(d, i) { return "translate("+0.9*(width/6)/2+"," + (height/14)/2 + ")"; })
    .text(function(d) { return d.name; })
    .attr("text-anchor", "middle")
    .style("font-size", "13px");




  


  var tooltip = d3.select('body')
      .append('div')
      .style('position', 'absolute')
      .style('padding', '0 10px')
      .style('background', 'white')
      .style('opacity', 0);

  
  function mouseoverCell(p) {
   
}


 function cellClick(element)
 {
   d3.selectAll(".cell").classed("selected", false);
   d3.selectAll(".cell").classed("permaactive", false);
   d3.selectAll(".cell").classed("tempactive", false);
  //d3.selectAll("text").classed("selected", false);

  
  d3.select(element).classed("selected","true");
  
  var n=d3.select(element).attr("id")
  nodes.forEach(function(node, i) {
    if (node.name==n)
    {
      selected=i;
      displayTable()
      
    }
     });
  
  //d3.select(element+">rect").style("fill","red")

  //selected=p;
  
 }


 function displayTable(){

  document.getElementById("side").innerHTML="";
  if(selected.length!=-1)
  {
  document.getElementById("side").innerHTML='<div style="font-weight: bold; text-align:center;font-size:'+(multiplier*18)+'px"> Node: '+nodes[selected].name+', Current Affiliation: '+nodes[selected].institution+'</div>'
 var tableData=[]
  var len=Object.keys(nodes[selected].targets).length; 

  for(i=0;i<len;i++)
  {
    tableData[i] = {
      Name: "",
      Connection: ""
  };
    tableData[i].Name=nodes[selected].targets[i]
    if(nodes[selected].convalues[i]==0)
      {
        document.getElementById(nodes[selected].targets[i]).classList.add("tempactive")
        
      tableData[i].Connection="Temporary, Research Connection";
      }
    else
    {
      document.getElementById(nodes[selected].targets[i]).classList.add("permaactive");  
          tableData[i].Connection="Permanent, "+nodes[selected].convalues[i];
    }
  }
  let table=document.getElementById("side").appendChild(document.createElement("table"));
  let data = Object.keys(tableData[0]);
generateTableHead(table, data);
generateTable(table, tableData);
  }

 }                                                                

 function generateTableHead(table, data) {
  let thead = table.createTHead();
  let row = thead.insertRow();
  for (let key of data) {
    let th = document.createElement("th");
    let text = document.createTextNode(key);
    th.appendChild(text);
    row.appendChild(th);
  }
}

function generateTable(table, data) {
  for (let element of data) {
    let row = table.insertRow();
    for (key in element) {
      let cell = row.insertCell();
      let text = document.createTextNode(element[key]);
      cell.appendChild(text);
    }
  }
}


  function mouseoverLabel(d,p) {
    nodes[p].targets.forEach(function(target, i) 
    {
      var a=document.getElementById("rowlabel"+target)
      var b=document.getElementById("collabel"+target)
      d3.select(a).classed("active", true);
      d3.select(b).classed("active", true);
    });
    var a=document.getElementById("rowlabel"+nodes[p].name)
      var b=document.getElementById("collabel"+nodes[p].name)
    d3.select(a)
    .classed("hovered",true)
    d3.select(b)
    .classed("hovered",true)


    tooltip.transition().duration(100)
    .style('opacity', .95)
    .style('pointer-events', 'none')
  tooltip.html(
    '<div style="font-weight: bold">' +'Name: '+nodes[p].name+'<br>Affiliation: '+nodes[p].institution+
     '<br>Region: '+nodes[p].group +'<br>Connections: '+nodes[p].count +'</div>'
  )
    .style('left', (d3.event.pageX +70) + 'px')
    .style('top', (d3.event.pageY -50) + 'px');
  
  }
  
  function mouseoverLabelRow(d,p) {
    nodes[p].targets.forEach(function(target, i) 
    {
      var a=document.getElementById("rowlabel"+target)
      var b=document.getElementById("collabel"+target)

      d3.select(a).classed("active", true);
      d3.select(b).classed("active", true);


    });
    var a=document.getElementById("rowlabel"+nodes[p].name)
    var b=document.getElementById("collabel"+nodes[p].name)
  d3.select(a)
  .classed("hovered",true)
  d3.select(b)
  .classed("hovered",true)
  
  tooltip.transition().duration(100)
    .style('opacity', 1)
    .style('pointer-events', 'none');  
  tooltip.html(
    '<div style="font-weight: bold">' +'Name: '+nodes[p].name+'<br>Affiliation: '+nodes[p].institution+
     '<br>Region: '+nodes[p].group +'<br>Connections: '+nodes[p].count +'</div>'
  )
    .style('left', (d3.event.pageX +50 ) + 'px')
    .style('top', (d3.event.pageY -110) + 'px');
  
  }

  function mouseoutLabel() {
    d3.selectAll("text").classed("active", false);
    d3.selectAll("text").classed("hovered", false);

    tooltip.html('')
    tooltip
    .style('opacity', 0)
    
  }
  $('table').css({'font-size' : (18*multiplier)+'px'});
$('table').css({'width' : (multiplier*450)+'px'});
$('table').css({'border-spacing' : '1 '+(multiplier*7)+'px'});
$('svg').css({'font-size' : (multiplier*12)+'px'});
$('.selected').css({'font-size' : (multiplier*14)+'px'});
$('.hovered').css({'font-size' : (multiplier*14)+'px'});
$('text.active').css({'font-size' : (multiplier*14)+'px'});

cellClick(document.getElementById("A Abdul-Rahman"))  
});