let box = document.querySelector('#viz');
let w = box.offsetWidth;
let box2 = document.querySelector('#side');

multiplier=window.innerWidth/1920





var margin = {top: 20, right: 20, bottom: 0, left: 20},
    width = w-margin.left-margin.right,
    height = multiplier*830;
var selected=-1;
var uniSelect=document.getElementById("uniSelect");
var orderSelect=document.getElementById("orderSelect");


var tooltip = d3.select('body')
.append('div')
.attr('id','tooltip')
.style('position', 'absolute')
.style('padding', '0 10px')
.style('background', 'white')
.style('opacity', 0);



var x = d3.scaleLinear().range([0, width]),
    y = d3.scaleLinear().range([0, height]);



  

d3.json("CommitteeConnections.json").then(function(CommitteeConnections) {
  draw();
  function draw(){

document.getElementById("viz").innerHTML="";

var svg = d3.select("#viz").append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")"); 
  var nodes = CommitteeConnections.nodes;
  
      var selOrder=orderSelect.options[orderSelect.selectedIndex].value;
      console.log("SelOrder:"+selOrder)
  if(selOrder==0)        
  nodes.sort((a, b) => (a.group > b.group) ? 1 : (a.group === b.group) ? ((a.name > b.name) ? 1 : -1) : -1 );
  else
  nodes.sort((a, b) => (a.year > b.year) ? 1 : (a.year === b.year) ? ((a.name > b.name) ? 1 : -1) : -1 );
    

  // Compute index per node.
  nodes.forEach(function(node, i) {
    node.index = i;
    node.count = 0;
    node.targets=[]
    node.convalues=[]
  });

  let uniSet = new Set()
  
  
  CommitteeConnections.links.forEach(function(link) {
    var sindex,tindex,con,val;
    for (i = 0; i < 84; i++) 
    {
      if (nodes[i].name == link.source)
      {
        nodes[i].targets.push(link.target)
        nodes[i].convalues.push(link.value)
        uniSet.add(link.value)
        sindex=i;  
      }
      else if (nodes[i].name == link.target)
      {
      nodes[i].targets.push(link.source)
      nodes[i].convalues.push(link.value)
      uniSet.add(link.value)
      tindex=i;
      }
    }
   
    nodes[sindex].count += 1;
    nodes[tindex].count += 1;
    
    
  });

  
  x.domain([0, 6]);
  y.domain([0, 14]);
  uniSet.delete("0");
  unis=Array.from(uniSet);
  unis.sort();

  unis.forEach(addOption);
  uniDict={}
  
  /*
  unis.forEach(function(uni) {
    let authSet = new Set()
    uniDict[uni]=0
    CommitteeConnections.links.forEach(function(link) {
      if (link.value==uni)
      {
        console.log(uni)
        authSet.add(link.source)
        authSet.add(link.target)

      }
      uniDict[uni]=authSet.size;



    })
    
     });
*/
//console.log(JSON.stringify(uniDict));


var group = svg.selectAll("g")
    .data(nodes)
  .enter().append("g")
    .attr("class", "cell")
    .attr("transform", function(d, i) { return "translate("+x(i%6)+"," + y(Math.floor(i/6)) + ")"; })
    .attr("id", function(d,i){return d.name})
    .on("click",function(){cellClick(this)})
    .on("mouseover",function(){mouseoverCell(this)})
    .on("mouseout",function(){mouseoutCell(this)});


group.append("rect")
    .attr("width", 0.9*(width/6))
    .attr("height", 0.9*(height/14))
    
    .attr("rx",1)
    
    


group.append("text")
    .attr("transform", function(d, i) { return "translate("+0.9*(width/6)/2+"," + (height/14)/2 + ")"; })
    .text(function(d) { return d.name})
    .attr("text-anchor", "middle")
    .style("font-size", (multiplier*18)+"px")
    .attr("dy","-0.5em");

group.append("text")
    .attr("transform", function(d, i) { return "translate("+0.9*(width/6)/2+"," + (height/14)/2 + ")"; })
    .text(function(d) { if(selOrder==0) return d.group; else return d.year;})
    .attr("text-anchor", "middle")
    .style("font-size", (multiplier*13)+"px")
    .attr("dy","1.1em");
  

  function mouseoverCell(element) {
    var n=d3.select(element).attr("id");
    var p=0;
    for(i=0;i<nodes.length;i++)
    { 
      if (nodes[i].name==n)
        {
          p=i;
          break;
        }

    } 
    tooltip.transition().duration(100)
    .style('opacity', .95)
  tooltip.html(
    '<div style="font-weight: bold">' +'Name: '+nodes[p].name+'<br>Affiliation: '+nodes[p].institution+
     '<br>Region: '+nodes[p].group +'<br>Connections: '+nodes[p].count +'</div>'
  )
    .style('left', (d3.event.pageX +70) + 'px')
    .style('top', (d3.event.pageY -50) + 'px');
   
}

function mouseoutCell() {
  document.getElementById("tooltip").innerHTML="";
  document.getElementById("tooltip").style.opacity=0;

  
}


 function cellClick(element)
 {
  $('#uniSelect').val("0");

  document.getElementById("tablediv").style.display="block";
  document.getElementById("uniLegend").style.display="none";

  d3.selectAll(".cell").classed("uniSelected", false);
   d3.selectAll(".cell").classed("selected", false);
   d3.selectAll(".cell").classed("permaactive", false);
   d3.selectAll(".cell").classed("tempactive", false);

  
  d3.select(element).classed("selected","true");
  
  var n=d3.select(element).attr("id")
  nodes.forEach(function(node, i) {
    if (node.name==n)
    {
      selected=i;
      displayTable()
      
    }
     });
  
 }


 function displayTable(){

  document.getElementById("side").innerHTML="";
  if(selected!=-1)
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

function addOption(value){
  uniSelect.options[uniSelect.options.length] = new Option(value, value);


}


function changeSelect(){
  var uniName = uniSelect.options[uniSelect.selectedIndex].value;
  document.getElementById("uniLegend").innerHTML="";
  d3.selectAll(".cell").classed("uniSelected", false);
  if (uniName!='0')
  {
    
   selected=-1;
   document.getElementById("tablediv").style.display="none";
   document.getElementById("uniLegend").style.display="block";

   d3.selectAll(".cell").classed("selected", false);
   d3.selectAll(".cell").classed("permaactive", false);
   d3.selectAll(".cell").classed("tempactive", false);

   nodes.forEach(function(node) {
    if (node.convalues.includes(uniName))
    {
      document.getElementById(node.name).classList.add("uniSelected")
    }

   })
   document.getElementById("uniLegend").innerHTML='<svg width="18" height="16"> <rect width="18" height="16" style="fill:#2c8150;" /> </svg>'+ uniName;
  
   displayTable();

  }
  else{
    document.getElementById("tablediv").style.display="block";
    document.getElementById("uniLegend").style.display="none";

  }


}

  
  $('table').css({'font-size' : (18*multiplier)+'px'});
$('table').css({'width' : (multiplier*450)+'px'});
$('table').css({'border-spacing' : '1 '+(multiplier*7)+'px'});

$('#uniSelect').on('change', function() {
  changeSelect();

});
  


cellClick(document.getElementById("A Abdul-Rahman"))  
}
$('#orderSelect').on('change', function() {
  console.log("change")
  draw();

});

});

