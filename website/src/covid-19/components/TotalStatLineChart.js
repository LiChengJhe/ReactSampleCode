import React, { Component } from "react";
import * as d3 from "d3";
import "./TotalStatLineChart.css";
import _ from "lodash";
export default class TotalStatLineChart extends Component {
  constructor(props) {
    super(props);
    this.gRef = React.createRef();
  }
  getSeries = (data) => {
    const confirmed = { name: "確診", data: [] };
    const deaths = { name: "死亡", data: [] };
    const recovered = { name: "治癒", data: [] };
    data.forEach((item) => {
      confirmed.data.push({
        value: item.confirmed,
        lastUpdate: item.lastUpdate,
      });
      deaths.data.push({ value: item.deaths, lastUpdate: item.lastUpdate });
      recovered.data.push({
        value: item.recovered,
        lastUpdate: item.lastUpdate,
      });
    });

    return [confirmed, deaths, recovered];
  };
  getDate(stats) {
    const confirmedDate = [];
    stats.forEach((item) => {
      confirmedDate.push(item.lastUpdate.toISOString());
    });
    return confirmedDate;
  }
  componentDidUpdate() {
    this.draw();
  }

  draw = () => {
    const margin = { top: 50, right: 150, bottom: 30, left: 100 };
    const width = 1000 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    const svg = this.addSvg(width, margin, height);
    const allGroup = ["確診", "治癒", "死亡"];
    const data = this.getSeries(this.props.stat);
    const color = d3.scaleOrdinal().domain(allGroup).range(d3.schemeSet2);
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(_.first(data).data, (d) => d.lastUpdate))
      .range([0, width]);
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(_.first(data).data, (o) => o.value)])
      .range([height, 0]);
    this.addTitles(svg, margin);
    this.addXY(svg, height, xScale, yScale, width);
    this.addLines(xScale, yScale, svg, data, color);
    this.addPoints(svg, data, color, xScale, yScale);
    this.addLabels(svg, data, xScale, yScale, color);
    this.addLegend(svg, data, width, margin, color);
  };

  addLegend = (svg, data, width, margin, color) => {
    const legendGroup = svg
      .selectAll("legend")
      .data(data)
      .enter()
      .append("g")
      .on("click", function (d) {
        const currentOpacity = d3.selectAll("." + d.name).style("opacity");
        d3.selectAll("." + d.name)
          .transition()
          .style("opacity", currentOpacity == 1 ? 0 : 1);
      });
    legendGroup
      .append("rect")
      .attr("x", function (d, i) {
        return width - margin.right + i * 60 - 25;
      })
      .attr("y", -margin.bottom * 1.5)
      .attr("width", 20)
      .attr("height", 20)
      .style("fill", function (d) {
        return color(d.name);
      });
    legendGroup
      .append("text")
      .attr("x", function (d, i) {
        return width - margin.right + i * 60;
      })
      .attr("y", -margin.bottom)
      .text(function (d) {
        return d.name;
      })
      .style("fill", function (d) {
        return color(d.name);
      })
      .style("font-size", 15)
      .style("font-weight", "bold");
  };

  addLabels = (svg, data, xScale, yScale, color) => {
    svg
      .selectAll("labels")
      .data(data)
      .enter()
      .append("text")
      .attr("class", function (d) {
        return d.name;
      })
      .datum(function (d) {
        return { name: d.name, data: d.data[d.data.length / 2 - 1] };
      })
      .attr("transform", function (d) {
        return (
          "translate(" +
          xScale(d.data.lastUpdate) +
          "," +
          yScale(d.data.value) +
          ")"
        );
      })
      .attr("y", -10)
      .text(function (d) {
        return d.name;
      })
      .style("fill", function (d) {
        return color(d.name);
      })
      .style("font-size", 15)
      .style("font-weight", "bold");
  };

  addPoints = (svg, data, color, xScale, yScale) => {
    svg
      .selectAll("dots")
      .data(data)
      .enter()
      .append("g")
      .attr("class", function (d) {
        return d.name;
      })
      .style("fill", function (d) {
        return color(d.name);
      })
      .selectAll("points")
      .data(function (d) {
        return d.data;
      })
      .enter()
      .append("circle")
      .attr("class", function (d) {
        return d.name;
      })
      .attr("cx", function (d) {
        return xScale(d.lastUpdate);
      })
      .attr("cy", function (d) {
        return yScale(d.value);
      })
      .attr("r", 5)
      .attr("stroke", "white");
  };

  addLines = (xScale, yScale, svg, data, color) => {
    const line = d3
      .line()
      .x(function (d) {
        return xScale(d.lastUpdate);
      })
      .y(function (d) {
        return yScale(d.value);
      });
    svg
      .selectAll("lines")
      .data(data)
      .enter()
      .append("path")
      .attr("class", function (d) {
        return d.name;
      })
      .attr("d", function (d) {
        return line(d.data);
      })
      .attr("stroke", function (d) {
        return color(d.name);
      })
      .style("stroke-width", 4)
      .style("fill", "none");
  };

  addXY = (svg, height, xScale, yScale, width) => {
    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(
        d3
          .axisBottom(xScale)
          .ticks(10)
          .tickFormat(d3.timeFormat("%m/%d"))
          .tickSize(-height)
      );
    svg.append("g").call(d3.axisLeft(yScale).ticks(5).tickSize(-width));
    svg
      .selectAll(".tick line")
      .filter((d, i) => d !== 0)
      .attr("stroke", "#EBEBEB");
  };

  addTitles = (svg, margin) => {
    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", margin.right)
      .attr("y", -margin.bottom)
      .text("趨勢圖(確診/死亡/治癒)");
    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.bottom * 2)
      .attr("x", -margin.right / 2)
      .text("確診/死亡/治癒(總)");
  };

  addSvg = (width, margin, height) => {
    return d3
      .select(this.gRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  };

  render() {
    return <div ref={this.gRef}></div>;
  }
}
