// The logic for building charts and their associated parameters
// See examples below for how to use these tools

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
// TODO: Automatically select colours instead of using these hand-picked high-contrast ones

// In the chart, events that go over the end of the bar get wrapped around to the beginning
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

// Make a chart where each ball cycles through each hand using the given
// parameters from Shannon's Juggling Theorem
// Does not generate realistic patterns for even number of balls
var genShannonChart = function(flight, dwell, vacant, balls, hands, title)
{
  if ((dwell + flight) * hands !== (dwell + vacant) * balls)
  {
    console.error("Invalid quintuple!");
    console.error("flight="+flight+" dwell="+dwell+" vacant="+vacant
                  +" balls="+balls+" hands="+hands);
  }
  var patternMaxTime = (dwell + flight) * hands;
  var patternChart = new Chart(title, patternMaxTime);

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

// --- Example Charts ---
// Draw the pre-made example chart with the selected index
function drawExampleChart(exampleIdx)
{
  var exampleChartList = [];

  // [0] 3 Balls 2 Hands (Long Flights)
  var longFlight3Chart = genShannonChart(1100, 250, 650, 3, 2, "3 Ball Cascade (Long Flight Times)");
  exampleChartList.push(longFlight3Chart);

  // [1] 3 Balls 2 Hands (Long Dwell)
  var longDwell3Chart = genShannonChart(400, 500, 100, 3, 2, "3 Ball Cascade");
  exampleChartList.push(longDwell3Chart);

  // [2] 2 Ball 1 Hand
  var twoBallsOneHandChart = genShannonChart(400, 300, 50, 2, 1, "'40' Pattern");
  exampleChartList.push(twoBallsOneHandChart);

  // [3] 1 Ball 2 Hands
  var oneBallTwoHandsChart = genShannonChart(200, 100, 500, 1, 2, "'1' Pattern");
  exampleChartList.push(oneBallTwoHandsChart);

  // [4] 5 Balls 2 Hands
  var fiveBallsChart = genShannonChart(1500, 300, 420, 5, 2, "5 Ball Cascade");
  exampleChartList.push(fiveBallsChart);

  // [5] Unrealistic 4 Ball Cascade
  var unrealistic4Chart = genShannonChart(400, 200, 100, 4, 2, "Unrealistic 4 Ball Cascade");
  exampleChartList.push(unrealistic4Chart);

  // [6] 3 Ball Cascade using times from my recorded GIF
  var recorded3Chart = genShannonChart(385, 305, 155, 3, 2, "3 Ball Cascade");
  exampleChartList.push(recorded3Chart);

  // [7] Nicely spaced 3 ball
  var neat3Ball = genShannonChart(6, 3, 3, 3, 2, "3 Ball Cascade");
  neat3Ball.intervalTime = 1;
  exampleChartList.push(neat3Ball);


  var drawParms1 = new DrawParms();
  drawParms1.barLeftOffset = 120;
  drawParms1.barLength = 300;
  drawParms1.shouldLabelIntervals = false;
  drawParms1.shouldDrawIntervals = true;

  if (0 <= exampleIdx && exampleIdx < exampleChartList.length)
  {
    drawChart(exampleChartList[exampleIdx], drawParms1);
  }
  else
  {
    console.error("Invalid example index = %o", exampleIdx);
  }
}

// --- Example Chart without using generator function ---
// Draw an example chart for the 31 juggling pattern
function draw31PatternChartExample()
{
  var custom31ExampleChart = new Chart("'31' Pattern Timeline", 600);

  var ballGroup = new Group("Balls");

  var redBallBar = new Bar("Red Ball");
  redBallBar.addEvent(new EventObj(0, 100, "red"));
  redBallBar.addEvent(new EventObj(200, 100, "red"));
  redBallBar.iconLink = "icons/redBall.svg";
  ballGroup.addBar(redBallBar);

  var greenBallBar = new Bar("Green Ball");
  greenBallBar.addEvent(new EventObj(100, 100, "lime"));
  greenBallBar.addEvent(new EventObj(500, 100, "lime"));
  greenBallBar.iconLink = "icons/greenBall.svg";
  ballGroup.addBar(greenBallBar);

  custom31ExampleChart.addGroup(ballGroup);

  var handGroup = new Group("Hands");

  var leftHandBar = new Bar("Left Hand");
  leftHandBar.addEvent(new EventObj(0, 100, "red"));
  leftHandBar.addEvent(new EventObj(500, 100, "lime"));
  leftHandBar.iconLink = "icons/leftHand.svg";
  handGroup.addBar(leftHandBar);

  var rightHandBar = new Bar("Right Hand");
  rightHandBar.addEvent(new EventObj(100, 100, "lime"));
  rightHandBar.addEvent(new EventObj(200, 100, "red"));
  rightHandBar.iconLink = "icons/rightHand.svg";
  handGroup.addBar(rightHandBar);

  custom31ExampleChart.addGroup(handGroup);

  custom31ExampleChart.intervalTime = 100; //ms

  var drawParms31Example = new DrawParms();
  drawParms31Example.barLength = 500;
  drawParms31Example.barHeight = 25;
  drawParms31Example.barLeftOffset = 120;
  drawParms31Example.shouldDrawIntervals = true;
  drawParms31Example.shouldLabelIntervals = true;

  drawChart(custom31ExampleChart, drawParms31Example);
}
//drawExampleChart(7);
draw31PatternChartExample();
