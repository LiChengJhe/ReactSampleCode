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
    const data = this.getSeries(this.props.stat);
    const color = d3
      .scaleOrdinal()
      .domain(_.map(data, (o) => o.name))
      .range(d3.schemeSet2);
    const xExtent = d3.extent(_.first(data).data, (d) => d.lastUpdate);
    const xScale = d3.scaleTime().domain(xExtent).range([0, width]);
    const maxY = d3.max(_.first(data).data, (o) => o.value);
    const yScale = d3.scaleLinear().domain([0, maxY]).range([height, 0]);
    this.addTitles(svg, margin);
    this.addXY(svg, height, xScale, yScale, width);
    this.addLines(xScale, yScale, svg, data, color);
    this.addPoints(svg, data, color, xScale, yScale);
    this.addLegend(svg, data, width, margin, color);
    this.addFocus(svg, data, color, width, height, xScale, yScale);
  };

  addLegend = (svg, data, width, margin, color) => {
    const legendGroup = svg
      .selectAll("legend")
      .data(data)
      .enter()
      .append("g")
      .on("click", (d) => {
        console.log(d);
        const line = d3.selectAll(`.${d.name}`);
        const curOpacity = line.style("opacity");
        const checkbox = d3.selectAll(`.${d.name}_checkbox`);
        line.transition().style("opacity", curOpacity === 1 ? 0 : 1);
        if (curOpacity === 1) {
          checkbox.style("fill", "white");
        } else {
          checkbox.style("fill", color(d.name));
        }
      });
    legendGroup
      .append("rect")
      .attr("class", (d) => `${d.name}_checkbox`)
      .attr("x", (d, i) => width - margin.right + i * 70 - 21)
      .attr("y", -margin.bottom * 1.4)
      .attr("width", 15)
      .attr("height", 15)
      .style("fill", (d) => color(d.name))
      .style("outline-color", (d) => color(d.name))
      .style("outline-style", "solid");
    legendGroup
      .append("text")
      .attr("x", (d, i) => width - margin.right + i * 70)
      .attr("y", -margin.bottom)
      .text((d) => d.name)
      .style("fill", (d) => color(d.name))
      .style("font-size", 15)
      .style("font-weight", "bold");
  };

  addPoints = (svg, data, color, xScale, yScale) => {
    svg
      .selectAll("dots")
      .data(data)
      .enter()
      .append("g")
      .attr("class", (d) => d.name)
      .style("fill", (d) => color(d.name))
      .selectAll("points")
      .data((d) => d.data)
      .enter()
      .append("circle")
      .attr("class", (d) => d.name)
      .attr("cx", (d) => xScale(d.lastUpdate))
      .attr("cy", (d) => yScale(d.value))
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
      .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.timeFormat("%m/%d")));
    svg.append("g").call(d3.axisLeft(yScale).ticks(8).tickSize(-width));
    svg
      .selectAll(".tick>line")
      .filter((d, i, e) => {
        return d !== 0;
      })
      .filter((d, i, e) => {
        return i < e.length;
      })
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

  addFocus(svg, data, color, width, height, xScale, yScale) {
    const focusLine = svg
      .append("line")
      .attr("stroke", "#EBEBEB")
      .attr("stroke-dasharray", 2)
      .style("opacity", 0);
    const focusCircle = svg
      .selectAll("focusCircle")
      .data(data)
      .enter()
      .append("circle")
      .style("fill", "none")
      .attr("stroke", (d) => color(d.name))
      .attr("r", 8.5)
      .style("opacity", 0);
    const focusText = svg
      .selectAll("focusText")
      .data(data)
      .enter()
      .append("text")
      .style("fill", (d) => color(d.name))
      .style("opacity", 0)
      .attr("text-anchor", "left")
      .attr("alignment-baseline", "middle");
    svg
      .append("rect")
      .style("fill", "none")
      .style("pointer-events", "all")
      .attr("width", width)
      .attr("height", height)
      .on("mouseover", () => {
        focusCircle.style("opacity", 1);
        focusText.style("opacity", 1);
        focusLine.style("opacity", 1);
      })
      .on("mousemove", function () {
        const x = xScale.invert(_.first(d3.mouse(this)));
        const selectedX = _.find(
          _.first(data).data,
          (o) => o.lastUpdate.toDateString() === x.toDateString()
        );
        focusLine
          .attr("x1", xScale(selectedX.lastUpdate))
          .attr("x2", xScale(selectedX.lastUpdate))
          .attr("y1", 0)
          .attr("y2", height);
        focusCircle.each(function (element, item) {
          const selectedData = _.find(
            element.data,
            (o) => o.lastUpdate.toDateString() === x.toDateString()
          );
          d3.select(this)
            .attr("cx", xScale(selectedData.lastUpdate))
            .attr("cy", yScale(selectedData.value));
        });
        focusText.each(function (element, item) {
          const selectedData = _.find(
            element.data,
            (o) => o.lastUpdate.toDateString() === x.toDateString()
          );
          d3.select(this)
            .html(
              "x:" +
                selectedData.lastUpdate +
                "  -  " +
                "y:" +
                selectedData.value
            )
            .attr("x", xScale(selectedData.lastUpdate) + 15)
            .attr("y", yScale(selectedData.value));
        });
      })
      .on("mouseout", () => {
        focusCircle.style("opacity", 0);
        focusText.style("opacity", 0);
        focusLine.style("opacity", 0);
      });
  }

  render() {
    return (
      <>
        <div ref={this.gRef}></div>
        <div id="focusCard" class="card border-secondary" style={{ maxWidth: "18rem",opacity:1 }}>
          <div class="card-header">確診/死亡/治癒(總)</div>
          <div class="card-body text-secondary">
            <p class="card-text">
              <span
                class="badge text-white"
                style={{ backgroundColor: "red", marginRight: "1px" }} >
                &nbsp;&nbsp;&nbsp;
              </span>
              <span style={{ color: "red", marginRight: "1px" }}>Primary</span>
              <span style={{ color: "red", marginRight: "1px" }}>Primary</span>
            </p>
          </div>
        </div>
      </>
    );
  }
}
