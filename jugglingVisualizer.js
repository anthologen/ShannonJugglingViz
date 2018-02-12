// Juggling Visualizer creates a Gantt Chart meant to display
// when balls are dwelling in hands

// --- Chart Object Definitions ---

// An object specifying where to draw an individual coloured rectangle
function EventObj(startTime, duration, color)
{
  this.startTime = startTime;
  this.duration = duration;
  this.color = color;
}

// A single timeline that can show multiple events
function Bar(name, iconLink=null)
{
  this.name = name;
  this.iconLink = iconLink;
  this.eventList = [];

  this.addEvent = function(eventObj)
  {
    if (eventObj instanceof EventObj)
    {
      this.eventList.push(eventObj);
      return true;
    }
    console.log("Invalid event: %o", eventObj);
    return false;
  }
}

// A group of bars
function Group(name)
{
  this.name = name;
  this.barList = [];

  this.addBar = function(bar)
  {
    if (bar instanceof Bar)
    {
      this.barList.push(bar)
      return true;
    }
    console.log("Invalid bar: %o", bar);
    return false;
  }
}

// A chart consists of a list of bar groupings
// If no intervalTime is specified, default interval is the total time
function Chart(name, maxTime, intervalTime=maxTime)
{
  this.name = name;
  this.maxTime = maxTime;
  this.intervalTime = intervalTime;
  this.groupList = [];

  this.addGroup = function(group)
  {
    if (group instanceof Group)
    {
      this.groupList.push(group);
      return true;
    }
    console.log("Invalid group: %o", group);
    return false;
  }
}

// Object of default drawing parameters
function DrawParms()
{
  this.barLength = 1000;
  this.barHeight = 30;
  this.barVerticalSpace = 10;
  this.barLeftOffset = 100;
  this.chartRightPad = 20;

  this.groupVerticalSpace = 20;
  this.titleYSpace = 40;

  this.titleFontSize = 24;
  this.barFontSize = 18;

  this.outLineColor = "black";

  this.shouldDrawIntervals = true;
  this.shouldLabelIntervals = true;
  this.intervalLabelFontSize = 8;
  this.intervalTickColor = "black";

  this.iconDistanceFromBar = 5;
}

// --- Drawing Functions ---

// Draw the given Chart object using the given drawing parameters
var drawChart = function(chart, drawParms)
{
  const groups = chart.groupList;

  // Calculate the svg size needed
  var svgHeight = drawParms.titleYSpace;

  // Space used by each group
  for (let i = 0; i < groups.length; i++)
  {
    let numBars = groups[i].barList.length;
    svgHeight += numBars * (drawParms.barHeight + drawParms.barVerticalSpace);
  }
  // Spacing between the groups
  svgHeight += groups.length * drawParms.groupVerticalSpace;

  var svgWidth = drawParms.barLeftOffset
                  + drawParms.barLength
                  + drawParms.chartRightPad;

  // Add the svg to draw on
  var svg = d3.select("body").append("svg")
    .attr("class", "chart")
    .attr("id", "canvas")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  // Add title
  var title = d3.select("#canvas").append("text")
    .attr("x", "50%")
    .attr("y", drawParms.titleFontSize)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("font-size", drawParms.titleFontSize)
    .text(chart.name);

  // Keep track of chart Y space already drawn on
  var chartYSpaceConsumed = drawParms.titleYSpace;
  // Draw groups
  for (let i = 0; i < groups.length; i++)
  {
    chartYSpaceConsumed += drawGroup(i, groups[i],
                                     chartYSpaceConsumed, chart.maxTime,
                                     chart.intervalTime, drawParms);
  }
}

var drawGroup = function(groupIdx, group,
                         yOffsetInChart, maxTime,
                         intervalTime, drawParms)
{
  let groupId = "group"+groupIdx;
  console.log("Drawing " + groupId);

  var groupG = d3.select("#canvas").append("g")
    .attr("class", "group")
    .attr("id", groupId)
    .attr("transform", "translate(0,"+yOffsetInChart+")");

  // Keep track of group Y space already drawn on
  var groupYSpaceConsumed = 0;
  const bars = group.barList;
  for (let i = 0; i < bars.length; i++)
  {
    groupYSpaceConsumed += drawBar(groupIdx, i, bars[i],
                                   groupYSpaceConsumed, maxTime,
                                   intervalTime, drawParms);
  }

  // Return Y space consumed
  return groupYSpaceConsumed + drawParms.groupVerticalSpace;
}

var drawBar = function(groupIdx, barIdx, bar,
                       yOffsetInGroup, maxTime,
                       intervalTime, drawParms)
{
  let groupId = "group"+groupIdx;
  let barId = groupId+"bar"+barIdx;
  console.log("Drawing " + barId);

  var barG = d3.select("#"+groupId).append("g")
    .attr("class", "bar")
    .attr("id", barId);

  var barOutline = d3.select("#"+barId).append("rect")
    .attr("class", "barOutline")
    .attr("id", barId + "outline")
    .attr("x", drawParms.barLeftOffset)
    .attr("y", yOffsetInGroup)
    .attr("width", drawParms.barLength)
    .attr("height", drawParms.barHeight)
    .attr("fill", "none")
    .attr("stroke", drawParms.outLineColor);

  var barLabel = d3.select("#"+barId).append("text")
    .attr("x", 0)
    .attr("y", (yOffsetInGroup
                + (drawParms.barHeight / 2)
                + (drawParms.barFontSize / 2)))
    .attr("font-size", drawParms.barFontSize)
    .text(bar.name);

  // No validations done on events - they may overlap
  const events = bar.eventList;
  for (let i = 0; i < events.length; i++)
  {
    drawEvent(groupIdx, barIdx, i, events[i],
              yOffsetInGroup, maxTime, drawParms);
  }

  // Draw intervals
  if (drawParms.shouldDrawIntervals)
  {
    var numTicks = maxTime / intervalTime;
    var intervalSize = drawParms.barLength / numTicks;
    var intervalTimeStep = maxTime / numTicks;
    for (let tick = 0; tick < numTicks; tick++)
    {
      let xPos = drawParms.barLeftOffset + (tick * intervalSize);
      let timeText = tick * intervalTimeStep;
      drawTick(barId, xPos, yOffsetInGroup, timeText, drawParms);
    }
    // Draw last tick
    let xPos = drawParms.barLeftOffset + drawParms.barLength;
    drawTick(barId, xPos, yOffsetInGroup, maxTime, drawParms);
  }

  // Draw icon if it is provided
  if (bar.iconLink)
  {
    console.log("Bar " + barId + " using icon " + bar.iconLink);
    // Assumes squre icon
    var barIcon = d3.select("#"+barId).append("image")
      .attr("xlink:href", bar.iconLink)
      .attr("width", drawParms.barHeight)
      .attr("height", drawParms.barHeight)
      .attr("x", drawParms.barLeftOffset
                  - (drawParms.barHeight + drawParms.iconDistanceFromBar))
      .attr("y", yOffsetInGroup);
  }

  // Return Y space consumed
  return drawParms.barHeight + drawParms.barVerticalSpace;
}

var drawTick = function(barId, xBasePos, yBasePos, tickText, drawParms)
{
  var intervalTick = d3.select("#"+barId).append("line")
    .attr("x1", xBasePos)
    .attr("y1", yBasePos)
    .attr("x2", xBasePos)
    .attr("y2", yBasePos + drawParms.barHeight)
    .attr("stroke", drawParms.intervalTickColor);
  if (drawParms.shouldLabelIntervals)
  {
    var intervalLabel = d3.select("#"+barId).append("text")
      .attr("x", xBasePos)
      .attr("y", yBasePos)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("font-size", drawParms.intervalLabelFontSize)
      .text(tickText);
  }
}

var drawEvent = function(groupIdx, barIdx, eventIdx, eventObj,
                         yOffsetInGroup, maxTime, drawParms)
{
  let barId = "group"+groupIdx+"bar"+barIdx;
  let eventId = barId+"event"+eventIdx;
  console.log("Drawing " + eventId);

  var scalingFactor = drawParms.barLength / maxTime;

  var g = d3.select("#"+barId).append("rect")
    .attr("class", "event")
    .attr("id", eventId)
    .attr("x", drawParms.barLeftOffset + (eventObj.startTime * scalingFactor))
    .attr("y", yOffsetInGroup)
    .attr("width", eventObj.duration * scalingFactor)
    .attr("height", drawParms.barHeight)
    .attr("fill", eventObj.color)
    .attr("stroke", drawParms.outLineColor);
}
