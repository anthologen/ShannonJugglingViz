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

// Events that go over the end of the bar get wrapped around to the beginning
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

// Make a chart where each ball cycles through each hand
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

// --- Example Charts ---

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

recorded3Chart.intervalTime = 100; //ms

var drawParms1 = new DrawParms();
drawParms1.barLeftOffset = 120;
drawParms1.shouldDrawIntervals = true;

drawChart(recorded3Chart, drawParms1);

// -- Example Chart without using generator function ---
var custom31ExampleChart = new Chart("Hypothetical '31' Pattern Timeline", 600);

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

var drawParms2 = new DrawParms();
drawParms2.barLength = 600;
drawParms2.barHeight = 25;
drawParms2.barLeftOffset = 120;
drawParms2.shouldDrawIntervals = false;

// Uncomment the line below to draw this chart (and comment the other call)
//drawChart(custom31ExampleChart, drawParms2);
