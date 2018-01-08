// Customizable Constants
const BAR_LENGTH = 1000;
const BAR_HEIGHT = 30;
const BAR_VERTICAL_SPACE = 10;
const BAR_LEFT_OFFSET = 50;
const GROUP_VERTICAL_SPACE = 20;
const OUTLINE_COLOR = "black";

var drawChart = function(chart)
{
  const groups = chart.groupList;

  // Calculate the svg size needed
  var svgHeight = 0;

  // Space used by each group
  for (let i = 0; i < groups.length; i++)
  {
    let numBars = groups[i].barList.length;
    svgHeight += numBars * (BAR_HEIGHT + BAR_VERTICAL_SPACE);
  }
  // Spacing between the groups
  svgHeight += groups.length * GROUP_VERTICAL_SPACE;

  var svgWidth = BAR_LEFT_OFFSET + BAR_LENGTH;

  // Add the svg to draw on
  var svg = d3.select("body").append("svg")
    .attr("class", "chart")
    .attr("id", "canvas")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  // Keep track of chart Y space already drawn on
  var chartYSpaceConsumed = 0;
  // Draw groups
  for (let i = 0; i < groups.length; i++)
  {
    chartYSpaceConsumed += drawGroup(chartYSpaceConsumed, i, groups[i]);
  }
}

var drawGroup = function(yOffsetInChart, groupIdx, group)
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
    groupYSpaceConsumed += drawBar(groupYSpaceConsumed, groupIdx, i, bars[i]);
  }

  // Return Y space consumed
  return groupYSpaceConsumed + GROUP_VERTICAL_SPACE;
}

var drawBar = function(yOffsetInGroup, groupIdx, barIdx, bar)
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
    .attr("x", BAR_LEFT_OFFSET)
    .attr("y", yOffsetInGroup)
    .attr("width", BAR_LENGTH)
    .attr("height", BAR_HEIGHT)
    .attr("fill", "none")
    .attr("stroke", OUTLINE_COLOR);

  // No validations done on events - they may overlap
  const events = bar.eventList;
  for (let i = 0; i < events.length; i++)
  {
    drawEvent(yOffsetInGroup, groupIdx, barIdx, i, events[i]);
  }

  // Return Y space consumed
  return BAR_HEIGHT + BAR_VERTICAL_SPACE;
}

var drawEvent = function(yOffsetInGroup, groupIdx, barIdx, eventIdx, eventObj)
{
  let barId = "group"+groupIdx+"bar"+barIdx;
  let eventId = barId+"event"+eventIdx;
  console.log("Drawing " + eventId);

  var g = d3.select("#"+barId).append("rect")
    .attr("class", "event")
    .attr("id", eventId)
    .attr("x", BAR_LEFT_OFFSET + eventObj.startTime)
    .attr("y", yOffsetInGroup)
    .attr("width", eventObj.duration)
    .attr("height", BAR_HEIGHT)
    .attr("fill", eventObj.color)
    .attr("stroke", OUTLINE_COLOR);
}

function EventObj(startTime, duration, color)
{
  this.startTime = startTime;
  this.duration = duration;
  this.color = color;
}

function Bar(name)
{
  this.name = name;
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

function Chart(name)
{
  this.name = name;
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

var chart = new Chart("TestChart");

var group1 = new Group("TestGroup1");

var bar1 = new Bar("Bar1");
bar1.addEvent(new EventObj(0, 100, "red"));
group1.addBar(bar1);

var bar2 = new Bar("Bar2")
bar2.addEvent(new EventObj(100, 200, "blue"));
group1.addBar(bar2);

chart.addGroup(group1);

var group2 = new Group("TestGroup2");

var bar3 =  new Bar("Bar3");
bar3.addEvent(new EventObj(50, 150, "green"));
group2.addBar(bar3);

chart.addGroup(group2);


drawChart(chart);
