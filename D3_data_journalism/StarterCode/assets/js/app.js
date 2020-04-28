var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 200
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;


// SVG TO HOLD SCATTERPLOT
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)

// INITIAL PARAMS
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// FUNCTION TO UPDATE X-AXIS
function xScale(scatterData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(scatterData, d => d[chosenXAxis]) * 0.8,
        d3.max(scatterData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
  };
  
// FUNCTION TO UPDATE Y-AXIS
function yScale(scatterData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.max(scatterData, d => d[chosenYAxis]) * 0.1,
    d3.max(scatterData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;

};

// UPDATE X AXIS WITH CLICK
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
};

// UPDATE Y AXIS WITH CLICK
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
 
  return yAxis;
}

// FUNCTION FOR UPDATING CIRCLES
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
  }

function renderStates(statesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  statesGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));
    return statesGroup;    
}
 
//  FUNCTION TO UPDATE CIRCLES WITH TOOLTIP
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var xLabel;

  if (chosenXAxis === "poverty") {
    xLabel = "Poverty (%)";
  }
  else if(chosenXAxis === "age") {
    xLabel = "Age (Median)";
  }
  else {
    xLabel = "Household Income (Median)";
  }

  var yLabel;

  if (chosenYAxis === "obesity") {
    yLabel = "Obesity (%)";
  }
  else if(chosenYAxis === "smokes") {
    yLabel = "Smokes (%)";
  }
  else {
    yLabel = "Lacks Healthcare (%)";
  }
        
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xLabel}: ${d[chosenXAxis]}<br>${yLabel}: ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(d) {
    toolTip.show(d);
  })
    .on("mouseout", function(d) {
      toolTip.hide(d);
    });

  return circlesGroup;
}

// RETRIVE DATA FROM CSV FILE
d3.csv("assets/data/data.csv").then(function(scatterData, err) {
  if (err) throw err;
  console.log(scatterData)
        
  scatterData.forEach(function(d) {
    d.poverty = +d.poverty;
    d.age = +d.age;
    d.income = +d.income;
    d.obesity = +d.obesity;
    d.smokes = +d.smokes;
    d.healthcare = +d.healthcare;
  });

  var xLinearScale = xScale(scatterData, chosenXAxis);

  // var yLinearScale = yScale(scatterData, chosenYAxis);
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(scatterData, d => d[chosenYAxis])])
    .range([height, 0]);

  // var yLinearScale = d3.scaleLinear()
  // .domain([0, d3.max(scatterData, d => d[chosenYAxis])])
  // .range([height, 0]);
    

  // CREATE INITIAL AXIS FUNCTIONS
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);


  // APPEND X AXIS
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // APPEND Y AXIS
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

// APPEND INITIAL CIRCLES
  var circlesGroup = chartGroup.selectAll("circle")
    .data(scatterData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 18)
    .attr("fill", "lightblue")
    .attr("opacity", "1");

  var statesGroup = chartGroup.selectAll("null")
    .data(scatterData)
    .enter()
    .append("text")
    .text(d => d.abbr)
    .attr("class", "stateText")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]) + 18/2.5);
    // circlesGroup
    // .append('text')
    // .text(d => d.abbr)
    // .attr('x', 10)
    // .attr('y', 20)
    // .attr('x', d => xScale(d[chosenXAxis]))
    // .attr('y', d => yScale(d[chosenYAxis]) + 20/2.5)


// GROUP FOR X-AXIS LABELS
var labelsXGroup = chartGroup.append("g")
  .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
  var povertyLabel = labelsXGroup.append("text")
    .attr("x", 0)
    .attr("y", 15)
    .attr("value", "poverty") 
    .classed("active", true)
    .text("In Poverty (%)");
  
  var ageLabel = labelsXGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age")
    .classed("inactive", true)
    .text("Age (Median)");
    
  var incomeLabel = labelsXGroup.append("text")
    .attr("x", 0)
    .attr("y", 65)
    .attr("value", "income") 
    .classed("inactive", true)
    .text("Household Income (Median)");

// GROUP FOR Y-AXIS LABELS
var labelsYGroup = chartGroup.append("g")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - (height / 2));

  var obesityLabel = labelsYGroup.append("text")
    .attr("x", -150)
    .attr('y',-90)
    .attr("value", "obesity")
    .classed("active", true)
    .text("Obese (%)");
  
  var smokesLabel = labelsYGroup.append("text")
    .attr("x", -150)
    .attr("y", -65)
    .attr("value", "smokes") 
    .classed("inactive", true)
    .text("Smokes (%)");
    
  var healthcareLabel = labelsYGroup.append("text")
    .attr("x", -150)
    .attr("y", -40)
    .attr("value", "healthcare")
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");

var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

// EVENT LISTENERS
labelsXGroup.selectAll("text")
  .on("click", function() {
    var value = d3.select(this).attr("value");
    if (value != chosenXAxis) {
        chosenXAxis = value;
        xLinearScale = xScale(scatterData, chosenXAxis);
        xAxis = renderXAxis(xLinearScale, xAxis);
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        statesGroup = renderStates(statesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);

        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
            
          ageLabel
            .classed("active", false)
            .classed("inactive", true);

          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
            // .classed("inactive", false);

          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
            // .classed("inactive", true);
          
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
            // .classed("inactive", true);
        }
        else {
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
            // .classed("inactive", false);
          
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
            // .classed("inactive", true);
          
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
            // .classed("inactive", true);
        }
      }
    });
    
labelsYGroup.selectAll("text")
  .on("click", function() {
    var value = d3.select(this).attr("value");
    if (value != chosenYAxis) {
      chosenYAxis = value;
      yLinearScale = yScale(scatterData, chosenYAxis);
      yAxis = renderYAxis(yLinearScale, yAxis);
      circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
      statesGroup = renderStates(statesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    
      if (chosenYAxis === "obesity") {
        obesityLabel
          .classed("active", true)
          // .classed("inactive", false)
          .classed("inactive", false);
                
        smokesLabel
          .classed("active", false)
          // .classed("inactive", true)
          .classed("inactive", true);
              
        healthcareLabel
          .classed("active", false)
          // .classed("inactive", true)
          .classed("inactive", true);
      }
      else if (chosenYAxis === "smokes") {
        smokesLabel
          .classed("active", true)
          // .classed("inactive", false)
          .classed("inactive", false);
    
        healthcareLabel
          .classed("active", false)
          // .classed("inactive", true)
          .classed("inactive", true);
              
        obesityLabel
          .classed("active", false)
          // .classed("inactive", true)
          .classed("inactive", true);
      }
      else {
        healthcareLabel
          .classed("active", true)
          // .classed("inactive", false)
          .classed("inactive", false);
              
        obesityLabel
          .classed("inactive", true)
          // .classed("active", false)
          .classed("active", false);
    
        smokesLabel
          .classed("inactive", true)
          // .classed("active", false)
          .classed("active", false);

      }
    }  
  });
}).catch(function(error) {
  console.log(error);
});
       