// Juggling Visualizer creates a Gantt Chart meant to display
// when balls are dwelling in hands

// --- Chart Object Definitions ---
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

function Chart(name, maxTime)
{
  this.name = name;
  this.maxTime = maxTime;
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

function DrawParms()
{
  this.barLength = 1000;
  this.barHeight = 30;
  this.barVerticalSpace = 10;
  this.barLeftOffset = 100;
  this.chartRightPad = 10;

  this.groupVerticalSpace = 20;
  this.titleYSpace = 30;

  this.titleFontSize = 24;
  this.barFontSize = 18;

  this.outLineColor = "black";
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
    .attr("x", "0%")
    .attr("y", drawParms.titleFontSize)
    .attr("alignment-baseline", "central")
    .attr("font-size", drawParms.titleFontSize)
    .text(chart.name);

  var scalingFactor = drawParms.barLength / chart.maxTime;
  console.log("1 time unit = " + scalingFactor + "px");

  // Keep track of chart Y space already drawn on
  var chartYSpaceConsumed = drawParms.titleYSpace;
  // Draw groups
  for (let i = 0; i < groups.length; i++)
  {
    chartYSpaceConsumed += drawGroup(i, groups[i],
                                     chartYSpaceConsumed, scalingFactor,
                                     drawParms);
  }
}

var drawGroup = function(groupIdx, group,
                         yOffsetInChart, scalingFactor, drawParms)
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
                                   groupYSpaceConsumed, scalingFactor,
                                   drawParms);
  }

  // Return Y space consumed
  return groupYSpaceConsumed + drawParms.groupVerticalSpace;
}

var drawBar = function(groupIdx, barIdx, bar,
                       yOffsetInGroup, scalingFactor, drawParms)
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
              yOffsetInGroup, scalingFactor, drawParms);
  }

  // Return Y space consumed
  return drawParms.barHeight + drawParms.barVerticalSpace;
}

var drawEvent = function(groupIdx, barIdx, eventIdx, eventObj,
                         yOffsetInGroup, scalingFactor, drawParms)
{
  let barId = "group"+groupIdx+"bar"+barIdx;
  let eventId = barId+"event"+eventIdx;
  console.log("Drawing " + eventId);

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

// Solve for one of variables in (F+D)H=(V+D)B
var solveHands = function(flight, dwell, vacant, balls)
{
  var hands = (vacant + dwell) * balls / (flight + dwell);
  if (hands % 1 !== 0)
  {
    console.warn('Hand solution ' + hands + ' is not an integer')
  }
  return hands;
}

var solveBalls = function(flight, dwell, vacant, hands)
{
  var balls = (flight + dwell) * hands / (vacant + dwell);
  if (balls % 1 !== 0)
  {
    console.warn('Ball solution ' + balls + ' is not an integer')
  }
  return balls;
}

var solveFlight = function(dwell, vacant, balls, hands)
{
  return ((vacant * balls) + (dwell * bals) - (dwell * hands)) / hands;
}

var solveVacant = function(flight, dwell, balls, hands)
{
  return ((flight * hands ) + (dwell * hands) - (dwell * balls)) / balls;
}

var solveDwell = function(flight, vacant, balls, hands)
{
  return ((vacant * balls) - (flight * hands)) / (hands * balls);
}

// Example Charts
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

// Long Flights
var longFlight3Chart = genShannonChart(1100, 250, 650, 3, 2);
// Long Dwell
var longDwell3Chart = genShannonChart(400, 500, 100, 3, 2);
// Times recorded from my recording
var recorded3Chart = genShannonChart(385, 305, 155, 3, 2);
// 2 Ball 1 Hand
var twoBallsOneHandChart = genShannonChart(400, 300, 50, 2, 1);
// 1 Ball 2 Hands
var oneBallTwoHandsChart = genShannonChart(200, 100, 500, 1, 2);
// 5 Balls 2 Hands
var fiveBallsChart = genShannonChart(1500, 300, 420, 5, 2);
// Unrealistic 4 ball
var unrealistic4Chart = genShannonChart(400, 200, 100, 4, 2);

drawChart(recorded3Chart, defaultDrawParms);
