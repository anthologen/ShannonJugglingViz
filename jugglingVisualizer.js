// Customizable Constants
const BAR_LENGTH = 1000;
const BAR_HEIGHT = 30;
const BAR_VERTICAL_SPACE = 10;
const BAR_LEFT_OFFSET = 100;
const GROUP_VERTICAL_SPACE = 20;
const OUTLINE_COLOR = "black";

const TITLE_Y_SPACE = 30;
const CHART_RIGHT_PAD = 10;

const TITLE_FONT_SIZE = 24;
const BAR_FONT_SIZE = 18;

var drawChart = function(chart)
{
  const groups = chart.groupList;

  // Calculate the svg size needed
  var svgHeight = TITLE_Y_SPACE;

  // Space used by each group
  for (let i = 0; i < groups.length; i++)
  {
    let numBars = groups[i].barList.length;
    svgHeight += numBars * (BAR_HEIGHT + BAR_VERTICAL_SPACE);
  }
  // Spacing between the groups
  svgHeight += groups.length * GROUP_VERTICAL_SPACE;

  var svgWidth = BAR_LEFT_OFFSET + BAR_LENGTH + CHART_RIGHT_PAD;

  // Add the svg to draw on
  var svg = d3.select("body").append("svg")
    .attr("class", "chart")
    .attr("id", "canvas")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  // Add title
  var title = d3.select("#canvas").append("text")
    .attr("x", "0%")
    .attr("y", TITLE_FONT_SIZE)
    .attr("alignment-baseline", "central")
    .attr("font-size", TITLE_FONT_SIZE)
    .text(chart.name);

  var scalingFactor = BAR_LENGTH / chart.maxTime;
  console.log("1 time unit = " + scalingFactor + "px");

  // Keep track of chart Y space already drawn on
  var chartYSpaceConsumed = TITLE_Y_SPACE;
  // Draw groups
  for (let i = 0; i < groups.length; i++)
  {
    chartYSpaceConsumed += drawGroup(i, groups[i],
                                     chartYSpaceConsumed, scalingFactor);
  }
}

var drawGroup = function(groupIdx, group, yOffsetInChart, scalingFactor)
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
                                   groupYSpaceConsumed, scalingFactor);
  }

  // Return Y space consumed
  return groupYSpaceConsumed + GROUP_VERTICAL_SPACE;
}

var drawBar = function(groupIdx, barIdx, bar, yOffsetInGroup, scalingFactor)
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

  var barLabel = d3.select("#"+barId).append("text")
    .attr("x", 0)
    .attr("y", yOffsetInGroup + (BAR_HEIGHT / 2) + (BAR_FONT_SIZE / 2))
    .attr("font-size", BAR_FONT_SIZE)
    .text(bar.name);

  // No validations done on events - they may overlap
  const events = bar.eventList;
  for (let i = 0; i < events.length; i++)
  {
    drawEvent(groupIdx, barIdx, i, events[i], yOffsetInGroup, scalingFactor);
  }

  // Return Y space consumed
  return BAR_HEIGHT + BAR_VERTICAL_SPACE;
}

var drawEvent = function(groupIdx, barIdx, eventIdx, eventObj,
                         yOffsetInGroup, scalingFactor)
{
  let barId = "group"+groupIdx+"bar"+barIdx;
  let eventId = barId+"event"+eventIdx;
  console.log("Drawing " + eventId);

  var g = d3.select("#"+barId).append("rect")
    .attr("class", "event")
    .attr("id", eventId)
    .attr("x", BAR_LEFT_OFFSET + (eventObj.startTime * scalingFactor))
    .attr("y", yOffsetInGroup)
    .attr("width", eventObj.duration * scalingFactor)
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

var chart = new Chart("TestChart", 1000);

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

//drawChart(chart);

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
    console.log("Invalid quintuple!")
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

drawChart(genShannonChart(385, 305, 155, 3, 2));
//drawChart(genShannonChart(400, 200, 100, 4, 2)); // unrealistic
