import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";

export default function TotalStatLineChart(props) {
  const chart = useRef({});
  const [focusData, setFocusData] = useState([]);
  const selectedData = useRef([]);
  const gRef = useRef(null);

  const getSeries = (data) => {
    const confirmed = { name: "確診", data: [] };
    const deaths = { name: "死亡", data: [] };
    const recovered = { name: "治癒", data: [] };
    data.forEach((item) => {
      confirmed.data.push({
        value: item.confirmed,
        lastUpdate: new Date(item.lastUpdate),
      });
      deaths.data.push({ value: item.deaths, lastUpdate: new Date(item.lastUpdate) });
      recovered.data.push({
        value: item.recovered,
        lastUpdate: new Date(item.lastUpdate),
      });
    });
    return [confirmed, deaths, recovered];
  };


  const idled = () => {
    chart.current.idleTimeout = null;
  };

  const updateChart = () => {
    const extent = d3.event.selection;

    if (!extent) {
      if (!chart.current.idleTimeout)
        return (chart.current.idleTimeout = setTimeout(idled, 350));
      chart.current.xScale.domain(chart.current.xExtent);
    } else {
      chart.current.xScale.domain([
        chart.current.xScale.invert(extent[0]),
        chart.current.xScale.invert(extent[1]),
      ]);
      chart.current.lineArea.select(".brush").call(chart.current.brush.move);
    }

    chart.current.xAxis
      .transition()
      .duration(1000)
      .call(d3.axisBottom(chart.current.xScale));

    chart.current.lineArea
      .selectAll(".line_g")
      .transition()
      .duration(1000)
      .attr("d", (d) => chart.current.lineGen(d.data));

    chart.current.lineArea
      .selectAll(".dot_g")
      .transition()
      .duration(1000)
      .attr("cx", (d) => chart.current.xScale(d.lastUpdate))
      .attr("cy", (d) => chart.current.yScale(d.value));
  };

  const addLegend = () => {
    selectedData.current = chart.current.data;
    const legendGroup = chart.current.svg
      .append("g")
      .selectAll("g")
      .data(chart.current.data)
      .enter()
      .append("g")
      .on("click", (d) => {
        const line = chart.current.svg.selectAll(`.${d.name}_g`);
        const curOpacity = Number(line.style("opacity"));
        const checkbox = chart.current.svg.selectAll(`.${d.name}_checkbox`);
        line.transition().style("opacity", curOpacity === 1 ? 0 : 1);

        if (curOpacity === 1) {
          checkbox.style("fill", "white");
          selectedData.current = _.filter(
            selectedData.current,
            (o) => o.name !== d.name
          );

        } else {
          checkbox.style("fill", chart.current.color(d.name));
          selectedData.current = [d].concat(selectedData);
        }
      });
    legendGroup
      .append("rect")
      .attr("class", (d) => `${d.name}_checkbox`)
      .attr(
        "x",
        (d, i) => chart.current.width - chart.current.margin.right + i * 70 - 21
      )
      .attr("y", -chart.current.margin.bottom * 1.4)
      .attr("width", 15)
      .attr("height", 15)
      .style("fill", (d) => chart.current.color(d.name))
      .style("outline-color", (d) => chart.current.color(d.name))
      .style("outline-style", "solid");
    legendGroup
      .append("text")
      .attr("x", (d, i) => chart.current.width - chart.current.margin.right + i * 70)
      .attr("y", -chart.current.margin.bottom)
      .text((d) => d.name)
      .style("fill", (d) => chart.current.color(d.name))
      .style("font-size", 15)
      .style("font-weight", "bold");
  };

  const addLines = () => {
    chart.current.color = d3
      .scaleOrdinal()
      .domain(_.map(chart.current.data, (o) => o.name))
      .range(d3.schemeSet2);

    chart.current.lineGen = d3
      .line()
      .x((d) => chart.current.xScale(d.lastUpdate))
      .y((d) => chart.current.yScale(d.value));

    chart.current.lineArea = chart.current.svg
      .append("g")
      .attr("clip-path", "url(#clip)");

    chart.current.lines = chart.current.lineArea
      .append("g")
      .selectAll("g")
      .data(chart.current.data)
      .enter();

    chart.current.lines.append("path")
      .attr("class", (d) => `${d.name}_g line_g`)
      .attr("d", (d) => chart.current.lineGen(d.data))
      .attr("stroke", (d) => chart.current.color(d.name))
      .style("stroke-width", 4)
      .style("fill", "none");

    chart.current.lines.append("g")
      .attr("class", (d) => `${d.name}_g`)
      .style("fill", (d) => chart.current.color(d.name))
      .selectAll("points")
      .data((d) => d.data)
      .enter()
      .append("circle")
      .attr("class", (d) => `dot_g`)
      .attr("cx", (d) => chart.current.xScale(d.lastUpdate))
      .attr("cy", (d) => chart.current.yScale(d.value))
      .attr("r", 5)
      .attr("stroke", "white");
  };

  const addTitles = () => {
    chart.current.svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", chart.current.margin.right)
      .attr("y", -chart.current.margin.bottom)
      .text("趨勢圖(確診/死亡/治癒)");
    chart.current.svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -chart.current.margin.bottom * 2)
      .attr("x", -chart.current.margin.right / 2)
      .text("確診/死亡/治癒(總)");
  };

  const addFocus = () => {

    chart.current.focusLine = chart.current.lineArea
      .append("line")
      .attr("stroke", "#EBEBEB")
      .attr("stroke-dasharray", 2)
      .style("opacity", 0);
    chart.current.focusCircle = chart.current.lineArea
      .append("g")
      .selectAll("g")
      .data(chart.current.data)
      .enter()
      .append("circle")
      .attr("class", (d) => `${d.name}_focusCircle`)
      .style("fill", "none")
      .attr("stroke", (d) => chart.current.color(d.name))
      .attr("r", 8.5)
      .style("opacity", 0);
    chart.current.focusCard = d3.select(gRef.current).select(".focusCard");
    chart.current.lineArea
      .on("mouseover", () => {
        chart.current.focusCircle.each(function (element, item) {
          if (_.find(selectedData.current, (o) => o.name === element.name)) {
            d3.select(this).style("opacity", 1);
          }
        });
        chart.current.focusLine.style("opacity", 1);
        if (selectedData.current.length > 1) {
          chart.current.focusCard.style("opacity", 1);
        }
      })
      .on("mousemove", function () {
        const mouse = d3.mouse(this);
        const x = chart.current.xScale.invert(mouse[0]);
        const y = chart.current.yScale.invert(mouse[1]);
        chart.current.focusCard.style("left", `${chart.current.xScale(x) + 150}px`);
        chart.current.focusCard.style("top", `${chart.current.yScale(y)}px`);


        const selectedX = _.find(
          _.first(chart.current.data).data,
          (o) => o.lastUpdate.toDateString() === x.toDateString()
        );

        if (selectedX) {
          const newFocusData = [];
          chart.current.focusLine
            .attr("x1", chart.current.xScale(selectedX.lastUpdate))
            .attr("x2", chart.current.xScale(selectedX.lastUpdate))
            .attr("y1", 0)
            .attr("y2", chart.current.height);

          chart.current.focusCircle.each(function (element, item) {
            if (
              _.find(selectedData.current, (o) => o.name === element.name)
            ) {
              const targetData = _.find(
                element.data,
                (o) => o.lastUpdate.toDateString() === x.toDateString()
              );
              newFocusData.push(
                _.merge(
                  { name: element.name, color: chart.current.color(element.name) },
                  targetData
                )
              );
              d3.select(this)
                .attr("cx", chart.current.xScale(targetData.lastUpdate))
                .attr("cy", chart.current.yScale(targetData.value));
            }
          });
          setFocusData(newFocusData);
        }


      })
      .on("mouseout", () => {
        chart.current.focusCircle.style("opacity", 0);
        chart.current.focusLine.style("opacity", 0);
        chart.current.focusCard.style("opacity", 0);
      });
  };

  const addBrushing = () => {
    chart.current.clip = chart.current.svg
      .append("defs")
      .append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("width", chart.current.width)
      .attr("height", chart.current.height)
      .attr("x", 0)
      .attr("y", 0);
    chart.current.brush = d3
      .brushX()
      .extent([
        [0, 0],
        [chart.current.width, chart.current.height],
      ])
      .on("end", () => updateChart());

    chart.current.lineArea.append("g").attr("class", "brush").call(chart.current.brush);

    chart.current.svg.on("dblclick", () => {
      chart.current.xScale.domain(chart.current.xExtent);
      chart.current.xAxis.transition().call(d3.axisBottom(chart.current.xScale));
      chart.current.svg
        .selectAll(".line_g")
        .transition()
        .attr("d", (d) => chart.current.lineGen(d.data));
      chart.current.svg
        .selectAll(".dot_g")
        .transition()
        .duration(1000)
        .attr("cx", (d) => chart.current.xScale(d.lastUpdate))
        .attr("cy", (d) => chart.current.yScale(d.value));
    });
  };

  const addSvg = () => {
    chart.current.margin = { top: 50, right: 150, bottom: 30, left: 100 };
    chart.current.width =
      window.screen.width - chart.current.margin.left - chart.current.margin.right;
    chart.current.height = 400 - chart.current.margin.top - chart.current.margin.bottom;

    chart.current.svg = d3
      .select(gRef.current)
      .append("svg")
      .attr(
        "width",
        chart.current.width + chart.current.margin.left + chart.current.margin.right
      )
      .attr(
        "height",
        chart.current.height + chart.current.margin.top + chart.current.margin.bottom
      )
      .append("g")
      .attr("transform", `translate(${chart.current.margin.left},${chart.current.margin.top})`);
  };

  const addXY = () => {

    const first = _.first(chart.current.data);
    chart.current.xExtent = d3.extent(
      first.data,
      (d) => d.lastUpdate
    );

    chart.current.xScale = d3
      .scaleTime()
      .domain(chart.current.xExtent)
      .range([10, chart.current.width - 10]);

    chart.current.xAxis = chart.current.svg
      .append("g")
      .attr("transform", `translate(0,${chart.current.height})`)
      .call(
        d3
          .axisBottom(chart.current.xScale)
          .ticks(10)
          .tickFormat(d3.timeFormat("%m/%d"))
      );

    chart.current.maxY = d3.max(first.data, (o) => o.value);

    chart.current.yScale = d3
      .scaleLinear()
      .domain([0, chart.current.maxY])
      .range([chart.current.height, 10]);

    chart.current.yAxis = chart.current.svg
      .append("g")
      .call(
        d3.axisLeft(chart.current.yScale).ticks(8).tickSize(-chart.current.width)
      );

    chart.current.xAxis.selectAll("path").attr("stroke", "none");
    chart.current.yAxis.selectAll("path").attr("stroke", "none");
    chart.current.yAxis.selectAll(".tick>line")
      .filter((d, i, e) => d !== 0)
      .filter((d, i, e) => i < e.length)
      .attr("stroke", "#EBEBEB");
  };


  const draw =
    (data) => {
      chart.current.data = data;
      addSvg();
      addTitles();
      addXY();
      addLines();
      addBrushing();
      addFocus();
      addLegend();
    };

  useEffect(() => {
    draw(getSeries(props.globalStats));
  }, []);

  return (
    <>
      <div ref={gRef}>
        <div
          className="card border-secondary focusCard"
          style={{ width: "250px", opacity: 0, position: "absolute" }}
        >
          <div className="card-header font-weight-bold">
            {focusData[0]?.lastUpdate.toISOString().slice(0, 10)}
          </div>
          <div className="card-body text-secondary font-weight-bold">
            {focusData.map((o) => (
              <p key={o.name} className="card-text ">
                <span
                  className="badge text-white"
                  style={{ backgroundColor: o.color, marginRight: "5px" }}
                >
                  &nbsp;&nbsp;&nbsp;
                </span>
                <span style={{ color: o.color, marginRight: "15px" }}>
                  {o.name}
                </span>
                <span style={{ color: o.color, marginRight: "15px" }}>
                  {o.value}
                </span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
