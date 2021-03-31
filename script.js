let box = document.querySelector('#viz');
let w = box.offsetWidth;
let box2 = document.querySelector('#side');
console.log(box2.offsetWidth)

var margin = {top: 100, right: 20, bottom: 0, left: 120},
    width = 1100,
    height = 840;
var selected=[];
var insertIndex=0;
var showIndex=0;
var x = d3.scaleBand().range([0, width]),
    y = d3.scaleBand().range([0, height]),

    z = d3.scaleLinear().domain([0, 4]).clamp(true),
    c = d3.scaleOrdinal(d3.schemeCategory10);

var svg = d3.select("#viz").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("margin-left", margin.left + "px")
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

  // Precompute the orders.
  var orders = {

    name: d3.range(n).map(function(n) {return n}),

  };

  // The default sort order.
  x.domain(orders.name);
  y.domain(orders.name);

  svg.append("rect")
      .attr("class", "background")
      .attr("width", width)
      .attr("height", height);

  var tooltip = d3.select('body')
      .append('div')
      .style('position', 'absolute')
      .style('padding', '0 10px')
      .style('background', 'white')
      .style('opacity', 0);

  var row = svg.selectAll(".row")
      .data(matrix)
    .enter().append("g")
      .attr("class", "row")
     
      .attr("transform", function(d, i) { return "translate(0," + y(i) + ")"; })
      .each(row);

  row.append("line")
      .attr("x2", width);

  row.append("text")
      .attr("x", -6)
      .attr("y", y.bandwidth() / 2)
      .attr("text-anchor", "end")
      .attr("id", function(d,i) { return "rowlabel"+nodes[i].name; })
      .text(function(d, i) { return nodes[i].name; })
      .on("mouseover", mouseoverLabelRow)
      .on("mouseout", mouseoutLabel)
      .on("click",LabelClick);
  var column = svg.selectAll(".column")
      .data(matrix)
    .enter().append("g")
      .attr("class", "column")
      .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

  column.append("line")
      .attr("x1", -width);

  column.append("text")
      .attr("x", 6)
      .attr("y", x.bandwidth() / 2)
      .attr("id", function(d,i) { return "collabel"+nodes[i].name; })

      .attr("text-anchor", "start")
      .text(function(d, i) { return nodes[i].name; })
      .attr("transform", "rotate(20)" )
      .on("mouseover", mouseoverLabel)
        .on("mouseout", mouseoutLabel)
        .on("click",LabelClick);


  function row(row) {
    var cell = d3.select(this).selectAll(".cell")
        .data(row.filter(function(d) { return d.z; }))
      .enter().append("rect")
  
        .attr("class", function(d) { return "cell x"+d.x+" y"+d.y; })
        

        .attr("x", function(d) { return x(d.x); })
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
       // .style("fill-opacity", function(d) { return z(d.z); })
        .style("fill", function(d) { 
                                  if(d.connection!='Uni')
                                      return "#7fdb6b";
                                    else
                                  return  "#005a32"})
        .on("mouseover", mouseoverCell)
        .on("mouseout", mouseoutCell);
  }
  LabelClick(matrix,20);
  function mouseoverCell(p) {
    d3.selectAll(".row text").classed("active", function(d, i) { return i == p.y; });
    d3.selectAll(".column text").classed("active", function(d, i) { return i == p.x; });
    
    tooltip.transition().duration(100)
    .style('opacity', 1)
    .style('pointer-events', 'none');
  if(p.connection=='Uni'){
  tooltip.html(
    '<div style="font-weight: bold">' +'Names: '+nodes[p.x].name+','+nodes[p.y].name+
     '<br>Connection Type: Permanent (Common University) <br>Common Affiliation: '+p.value +'</div>'
  )
    .style('left', (d3.event.pageX +70) + 'px')
    .style('top', (d3.event.pageY -50) + 'px');
  }
  else{
    tooltip.html(
      '<div style="font-weight: bold">' +'Names: '+nodes[p.x].name+','+nodes[p.y].name+
       '<br>Connection Type: Temporary (Coresearchers)</div>'
    ).style('left', (d3.event.pageX +70) + 'px')
    .style('top', (d3.event.pageY -50) + 'px');
  }
}


 function LabelClick(d,p)
 {
   console.log(selected,insertIndex)
  d3.selectAll(".cell").classed("cellStrong", false);
  d3.selectAll("text").classed("selected", false);

  if(selected.includes(p))
  {
    const index = selected.indexOf(p);   
    selected.splice(index, 1);
    insertIndex=selected.length;
    if(showIndex==index)
    showIndex=insertIndex-1;
    else
    showIndex=showIndex-1
  }

  else{
  selected[insertIndex]=p;
  showIndex=insertIndex;
  insertIndex=(insertIndex+1)%5;

  }
  if(selected.length>0)
  {
  selected.forEach(element => {
  if(element!=-1)
  {
    var selectedName=nodes[element].name  
    var a=document.getElementById("rowlabel"+selectedName)
    var b=document.getElementById("collabel"+selectedName)
    d3.select(a).classed("selected", true);
    d3.select(b).classed("selected", true);
    d3.selectAll(".x"+element).classed("cellStrong", true);
    d3.selectAll(".y"+element).classed("cellStrong", true);
  }

  });
}
if(selected.length>1)
  {
    document.getElementById("lbtn").disabled = false;
    document.getElementById("rbtn").disabled = false;

  }
  else
  {
    document.getElementById("lbtn").disabled = true;
    document.getElementById("rbtn").disabled = true;


  }

  if(showIndex<0)
  showIndex=0;
  displayTable()
 }

 document.getElementById("lbtn").addEventListener("click", function() {
  
  showIndex=(showIndex+1) % selected.length
  displayTable()
  
});

document.getElementById("rbtn").addEventListener("click", function() {
  showIndex=(showIndex+1) % selected.length

  displayTable()
});

 function displayTable(){

  document.getElementById("side").innerHTML="";
  if(selected.length>0)
  {
  document.getElementById("side").innerHTML='<div style="font-weight: bold; text-align:center;font-size:18px"> Node: '+nodes[selected[showIndex]].name+', Current Affiliation: '+nodes[selected[showIndex]].institution+'</div>'
 var tableData=[]
  var len=Object.keys(nodes[selected[showIndex]].targets).length; 

  for(i=0;i<len;i++)
  {
    tableData[i] = {
      Name: "",
      Connection: ""
  };
    tableData[i].Name=nodes[selected[showIndex]].targets[i]
    if(nodes[selected[showIndex]].convalues[i]==0)
      tableData[i].Connection="Temporary, Research Connection";
    else
      tableData[i].Connection="Permanent, "+nodes[selected[showIndex]].convalues[i];
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

  function mouseoutCell() {
    tooltip.html('')
    tooltip
    .style('opacity', 0)
    d3.selectAll("text").classed("active", false);
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

  
});