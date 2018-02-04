// Juggling Visualizer creates a Gantt Chart meant to display
// when balls are dwelling in hands

// --- Chart Object Definitions ---
function EventObj(startTime, duration, color)
{
  this.startTime = startTime;
  this.duration = duration;
  this.color = color;
}

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

// --- Drawing Functions ---
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

// --- Chart Generating Functions ---
const BALL_COLOURS = [
  "red",
  "lime",
  "deepskyblue",
  "darkorange",
  "gold",
  "blueviolet",
  "magenta",
  "tan",
  "navy"
];

var correctEventWrapping = function(eventList, patternMaxTime)
{
  let correctedEventList = [];
  for (let i = 0; i < eventList.length; i++)
  {
    let eventObj = eventList[i];

    if (eventObj.startTime + eventObj.duration > patternMaxTime)
    {
      // Break the event into two (wrapping around to the start)
      let overshoot = (eventObj.startTime + eventObj.duration) - patternMaxTime;

      correctedEventList.push(new EventObj(eventObj.startTime,
                                           eventObj.duration - overshoot,
                                           eventObj.color));
      correctedEventList.push(new EventObj(0, overshoot, eventObj.color));
    }
    else
    {
      correctedEventList.push(eventObj);
    }
  }
  return correctedEventList;
};

// Does not generate realistic patterns for even number of balls
var genShannonChart = function(flight, dwell, vacant, balls, hands)
{
  if ((dwell + flight) * hands !== (dwell + vacant) * balls)
  {
    console.warn("Invalid quintuple!");
    console.warn("flight="+flight+" dwell="+dwell+" vacant="+vacant
                  +" balls="+balls+" hands="+hands);
  }
  var patternMaxTime = (dwell + flight) * hands;
  var patternChart = new Chart("Shannon's Juggling Theorem", patternMaxTime);

  var ballGroup = new Group("Balls");
  for (let b = 0; b < balls; b++)
  {
    let ballBar = new Bar("Ball " + b);

    let ballOffset = b * (dwell + vacant);
    let ballEvents = [];
    for (let h = 0; h < hands; h++)
    {
      let startTime = (ballOffset + (h * (flight + dwell))) % patternMaxTime;
      ballEvents.push(new EventObj(startTime, dwell, BALL_COLOURS[b]));
    }
    ballBar.eventList = correctEventWrapping(ballEvents, patternMaxTime);
    ballGroup.addBar(ballBar);
  }
  patternChart.addGroup(ballGroup);

  var handGroup = new Group("Hands");
  for (let h = 0; h < hands; h++)
  {
    let handBar = new Bar("Hand " + h);

    let handOffset = h * (dwell + flight);
    let handEvents = [];
    for (let b = 0; b < balls; b++)
    {
      let startTime = (handOffset + (b * (vacant + dwell))) % patternMaxTime;
      handEvents.push(new EventObj(startTime, dwell, BALL_COLOURS[b]));
    }
    handBar.eventList = correctEventWrapping(handEvents, patternMaxTime);
    handGroup.addBar(handBar);
  }
  patternChart.addGroup(handGroup);

  return patternChart;
}

// Example Charts
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

var defaultDrawParms = new DrawParms();


var testChart = new Chart("TestChart", 1000);

var group1 = new Group("TestGroup1");

var bar1 = new Bar("Bar1");
bar1.addEvent(new EventObj(0, 100, "red"));
group1.addBar(bar1);

var bar2 = new Bar("Bar2")
bar2.addEvent(new EventObj(100, 200, "blue"));
group1.addBar(bar2);

testChart.addGroup(group1);

var group2 = new Group("TestGroup2");

var bar3 =  new Bar("Bar3");
bar3.addEvent(new EventObj(50, 150, "green"));
group2.addBar(bar3);

testChart.addGroup(group2);

//drawChart(testChart, defaultDrawParms);

// 3 Balls 2 Hands (Long Flights)
var longFlight3Chart = genShannonChart(1100, 250, 650, 3, 2);
longFlight3Chart.name = "3 Ball Cascade (Long Flight Times)";
// 3 Balls 2 Hands (Long Dwell)
var longDwell3Chart = genShannonChart(400, 500, 100, 3, 2);
longDwell3Chart.name = "3 Ball Cascade (Long Dwell Times)";
// 2 Ball 1 Hand
var twoBallsOneHandChart = genShannonChart(400, 300, 50, 2, 1);
twoBallsOneHandChart.name = "'40' Pattern";
// 1 Ball 2 Hands
var oneBallTwoHandsChart = genShannonChart(200, 100, 500, 1, 2);
oneBallTwoHandsChart.name = "'1' Pattern";
// 5 Balls 2 Hands
var fiveBallsChart = genShannonChart(1500, 300, 420, 5, 2);
fiveBallsChart.name = "5 Ball Cascade";
// Unrealistic 4 Ball Cascade
var unrealistic4Chart = genShannonChart(400, 200, 100, 4, 2);
unrealistic4Chart.name = "Unrealistic 4 Ball Cascade";
// 3 Ball Cascade using times from my recorded GIF
var recorded3Chart = genShannonChart(385, 305, 155, 3, 2);
recorded3Chart.name = "3 Ball Cascade";

recorded3Chart.intervalTime = 100;
defaultDrawParms.shouldDrawIntervals = true;

recorded3Chart.groupList[0].barList[0].name = "Red Ball";
recorded3Chart.groupList[0].barList[0].iconLink = "icons/redBall.svg";

recorded3Chart.groupList[0].barList[1].name = "Green Ball";
recorded3Chart.groupList[0].barList[1].iconLink = "icons/greenBall.svg";

recorded3Chart.groupList[0].barList[2].name = "Blue Ball";
recorded3Chart.groupList[0].barList[2].iconLink = "icons/blueBall.svg";

recorded3Chart.groupList[1].barList[0].name = "Left Hand";
recorded3Chart.groupList[1].barList[0].iconLink = "icons/leftHand.svg";

recorded3Chart.groupList[1].barList[1].name = "Right Hand";
recorded3Chart.groupList[1].barList[1].iconLink = "icons/rightHand.svg";

defaultDrawParms.barLeftOffset = 120;

drawChart(recorded3Chart, defaultDrawParms);
