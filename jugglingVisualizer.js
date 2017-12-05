// Customizable Constants
const BAR_LENGTH = 100;
const BAR_HEIGHT = 30;
const BAR_VERTICAL_SPACE = 10;
const BAR_LEFT_OFFSET = 50;
const GROUP_VERTICAL_SPACE = 20;

//BORDERS and > 0

var generateChart = function(groupDataList)
{
  // Calculate the svg size needed
  var svgWidth = BAR_LEFT_OFFSET + BAR_LENGTH;

  var svgHeight = 0;
  for (const groupData in groupDataList)
  {
    const numBars = groupData.barDataList.length;
    svgHeight += (numBars * BAR_HEIGHT) + ((numBars + 1) * BAR_VERTICAL_SPACE);
  }
  const numGroups = groupDataList.length;
  if (numGroups > 1)
  {
    svgHeight += (numGroups - 1) * GROUP_VERTICAL_SPACE;
  }
  // Add the svg to draw on
  var svg = d3.select("body").append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);
}
