const projectName = "Global Temperature Heat Map";
const tooltipWidth = 120;

const margin = {
  top: 80,
  bottom: 90,
  left: 70,
  right: 30 };

const w = 1450 - margin.left - margin.right;
const h = 550 - margin.top - margin.bottom;
const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";


// blue to red color maps 
const colorList = [
"#4292c5",
"#6bafd7",
"#9dcae1",
"#deecf7",
"#ffffcb",
"#ffd976",
"#fd8c3c",
'#e74749',
"#e21a1c",
"#b41416",
"#800026"];



const monthNames = [
"January",
"February",
"March",
"April",
"May",
"June",
"July",
"August",
"September",
"October",
"November",
"December"];


const svg = d3.
select("#heat-map").
append("svg").
attr("width", w + margin.left + margin.right).
attr("height", h + margin.top + margin.bottom).
attr("transform", "translate(" + margin.left + "," + margin.top + ")").
style("background-color", "white");


const tooltip = d3.
select("#heat-map").
append("div").
attr("id", "tooltip").
style("opacity", "0").
style("position", "absolute").
style("min-width", tooltipWidth + "px");

const overlay = d3.
select("#heat-map").
append("div").
attr("id", "overlay").
style("opacity", "0").
style("position", "absolute");

d3.json(url).
then(data => {




  // x-axis
  const x = d3.
  scaleLinear().
  range([margin.left, margin.left + w]).
  nice();
  const minX = d3.min(data.monthlyVariance, d => d.year);
  const maxX = d3.max(data.monthlyVariance, d => d.year);
  let xTicksNo = Math.floor((maxX - minX) / 10);

  x.domain([minX, maxX]);
  const xAxis = d3.axisBottom(x);
  xAxis.ticks(xTicksNo);
  xAxis.tickFormat(d3.format("d"));


  // y-axis
  const y = d3.scaleLinear().range([margin.top, margin.top + h]);
  y.domain([
  d3.min(data.monthlyVariance, d => d.month),
  d3.max(data.monthlyVariance, d => d.month)]);

  const yAxis = d3.axisLeft(y);
  yAxis.tickFormat((d, i) => monthNames[i]);



  svg.
  append("text").
  text("Month").
  attr("transform", "rotate(-90)").
  attr("x", -280).
  attr("y", 15);

  svg.
  append("text").
  text("Year").
  attr("x", (w + margin.left) / 2).
  attr("y", h + margin.top + 60);

  // creating color scale.

  const maxVar = d3.max(data.monthlyVariance, d => d.variance);
  const minVar = d3.min(data.monthlyVariance, d => d.variance);
  const totalColors = colorList.length;
  const intervalVar = (maxVar - minVar) / totalColors;






  let varRange = [];
  let colorDomain = [];
  for (let i = 0; i < totalColors; i++) {
    colorDomain.push(i);
    varRange.push(minVar + i * intervalVar);
  }
  varRange.push(maxVar);
  function colorMapper(num) {
    for (let i = 0; i < totalColors; i++) {
      if (varRange[i] < num && varRange[i + 1] > num) {
        return i;
      }
    }
    return "error";
  }

  let color = d3.scaleOrdinal(colorList);
  color.domain(colorDomain);


  // color legend

  let colorScaleX = 70;
  let colorScaleY = h + margin.top + 45;
  let colorBarWidth = 35;
  let linearColor = d3.scaleLinear().domain([minVar + 8.66, maxVar + 8.66]);
  linearColor.range([70, 70 + 35 * colorList.length]);
  let colorAxis = d3.axisBottom(linearColor);
  colorAxis.tickFormat(d3.format(".1f"));
  colorAxis.tickValues(varRange.map(d => d + 8.66));
  let newVarRange = varRange.map(d => d.toFixed(1));

  svg.
  append("g").
  attr("transform", "translate(" + 0 + "," + (colorScaleY + 25) + ")").
  call(colorAxis);


  // calculating barwidht and height and using it set the size of overlay.
  const barWidth = x(1991) - x(1990);
  const barHeight = y(11) - y(10);

  // size of overlay bar
  overlay.style("width", barWidth + "px").style("height", barHeight + "px");


  // x axis generation

  svg.
  append("g").
  attr(
  "transform",
  "translate(0," + (h + margin.top + barHeight / 2) + ")").

  attr("id", "x-axis").
  call(xAxis).
  append("path").
  attr("d", `M60,0H70`).
  attr("stroke", "black");


  // y axis generation
  let yAxisPath = svg.
  append("g").
  attr("transform", "translate(" + (margin.left - barWidth / 2) + ",0)").
  attr("id", "y-axis").
  call(yAxis);
  yAxisPath.append("path").attr("d", `M0,80V60H-6`).attr("stroke", "black");

  yAxisPath.append("path").attr("d", `M0,478V60`).attr("stroke", "black");


  //rectangles

  svg.
  selectAll("rect").
  data(data.monthlyVariance).
  enter().
  append("rect").
  attr("width", barWidth).
  attr("height", barHeight).
  attr("class", "cell").
  attr("data-month", d => d.month - 1).
  attr("data-year", d => d.year).
  attr("data-temp", d => d.variance).
  attr("x", d => x(d.year) - barWidth / 2).
  attr("y", d => y(d.month) - barHeight / 2).
  attr("fill", d => color(colorMapper(d.variance))).
  on("mouseover", (event, d) => {
    overlay.
    style("top", y(d.month) + margin.top - barHeight / 2 + "px").
    style("left", x(d.year) + margin.left - barWidth / 2 + "px").
    style("opacity", "1");

    let varNum = d.variance.toFixed(1);
    let temperature = 8.66 + d.variance;
    temperature = temperature.toFixed(1);

    tooltip.
    style("top", y(d.month) + margin.top - 80 - 7 - barHeight / 2 + "px").
    attr("data-year", d.year).
    style(
    "left",
    x(d.year) + margin.left - tooltipWidth / 2 - barWidth / 2 + "px").

    style("opacity", "1").
    html(
    d.year +
    "-" +
    monthNames[d.month - 1] +
    "<br>" +
    temperature +
    "??C" +
    "<br>" +
    varNum +
    "??C");

  }).
  on("mouseout", () => {
    tooltip.style("opacity", "0");
    overlay.style("opacity", "0");
  });

  let legendContainer = svg.append("g").attr("id", "legend");


  // color legend generation
  legendContainer.
  selectAll("circle").
  data(colorList).
  enter().
  append("rect").
  attr("height", 25).
  attr("width", 35).
  attr("x", (d, i) => colorScaleX + i * 35).
  attr("y", colorScaleY).
  attr("fill", d => d).
  attr("stroke", "black").
  attr("stroke-width", "1px");






}).
catch(err => {
  console.log(err);
});