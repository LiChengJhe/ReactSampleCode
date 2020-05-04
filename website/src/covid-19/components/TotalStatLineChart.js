import React, { Component } from "react";
import * as d3 from "d3";
import "./TotalStatLineChart.css";
import _ from "lodash";

export default class TotalStatLineChart extends Component {
  constructor(props) {
    super(props);
    this.state = { focusData: [], selectedData: [] };
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

  componentDidUpdate(prevProps, prevState) {
    if (this.props.stat && prevProps.stat !== this.props.stat) {
      this.draw(this.getSeries(this.props.stat));
    }
  }

  draw = (data) => {
    const margin = { top: 50, right: 150, bottom: 30, left: 100 };
    const width = 1000 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    const svg = this.addSvg(width, margin, height);
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
    this.addLines(xScale, yScale, svg, data, color, width, height,margin);
    this.addPoints(svg, data, color, xScale, yScale);
    this.addLegend(svg, data, width, margin, color);
   // this.addFocus(svg, data, color, width, height, xScale, yScale);
  };

  addLegend = (svg, data, width, margin, color) => {
    this.setState({ selectedData: data });
    const legendGroup = svg
      .selectAll("legend")
      .data(data)
      .enter()
      .append("g")
      .on("click", (d) => {
        const line = d3.selectAll(`.${d.name}_g`);
        const curOpacity = Number(line.style("opacity"));
        const checkbox = d3.selectAll(`.${d.name}_checkbox`);
        line.transition().style("opacity", curOpacity === 1 ? 0 : 1);

        if (curOpacity === 1) {
          checkbox.style("fill", "white");
          this.setState({
            selectedData: _.filter(
              this.state.selectedData,
              (o) => o.name !== d.name
            ),
          });
        } else {
          checkbox.style("fill", color(d.name));

          this.setState({
            selectedData: [d].concat(this.state.selectedData),
          });
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
      .attr("class", (d) => `${d.name}_g`)
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

  addLines = (xScale, yScale, svg, data, color, width, height,margin) => {
    const line = d3
      .line()
      .x(function (d) {
        return xScale(d.lastUpdate);
      })
      .y(function (d) {
        return yScale(d.value);
      });

      
 const clip = svg.append("defs").append("SVG:clipPath")
      .attr("id", "clip")
      .append("SVG:rect")
      .attr("width", width )
      .attr("height", height )
      .attr("x", 0)
      .attr("y", 0);

  const zoom = d3.zoom()
      .scaleExtent([.5, 20]) 
      .extent([[0, 0], [width, height]])
      .on("zoom",()=>{console.log(1);});

   svg.append('g').attr("clip-path", "url(#clip)") ;

    svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .on("mousemove", function () {console.log(2);})
    .call(zoom);

    svg
      .selectAll("lines")
      .data(data)
      .enter()
      .append("path")
      .attr("class", (d) => `${d.name}_g`)
      .attr("d", (d) => line(d.data))
      .attr("stroke", (d) => color(d.name))
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
      .filter((d, i, e) => d !== 0)
      .filter((d, i, e) => i < e.length)
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

  addFocus = (svg, data, color, width, height, xScale, yScale) => {
    const that = this;
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
      .attr("class", (d) => `${d.name}_focusCircle`)
      .style("fill", "none")
      .attr("stroke", (d) => color(d.name))
      .attr("r", 8.5)
      .style("opacity", 0);

    const focusCard = d3.select("#focusCard");

    svg
      .append("rect")
      .style("fill", "none")
      .style("pointer-events", "all")
      .attr("width", width)
      .attr("height", height)
      .on("mouseover", () => {
        focusCircle.each(function (element, item) {
          if (_.find(that.state.selectedData, (o) => o.name === element.name)) {
            d3.select(this).style("opacity", 1);
          }
        });
        focusLine.style("opacity", 1);
        if (that.state.selectedData.length > 1) {
          focusCard.style("opacity", 1);
        }
      })
      .on("mousemove", function () {
        const mouse = d3.mouse(this);
        const x = xScale.invert(mouse[0]);
        const y = yScale.invert(mouse[1]);

        focusCard.style("left", `${xScale(x) + 150}px`);
        focusCard.style("top", `${yScale(y)}px`);

        const selectedX = _.find(
          _.first(data).data,
          (o) => o.lastUpdate.toDateString() === x.toDateString()
        );

        focusLine
          .attr("x1", xScale(selectedX.lastUpdate))
          .attr("x2", xScale(selectedX.lastUpdate))
          .attr("y1", 0)
          .attr("y2", height);

        const focusData = [];
        focusCircle.each(function (element, item) {
          if (_.find(that.state.selectedData, (o) => o.name === element.name)) {
            const selectedData = _.find(
              element.data,
              (o) => o.lastUpdate.toDateString() === x.toDateString()
            );
            focusData.push(
              _.merge(
                { name: element.name, color: color(element.name) },
                selectedData
              )
            );
            d3.select(this)
              .attr("cx", xScale(selectedData.lastUpdate))
              .attr("cy", yScale(selectedData.value));
          }
        });

        that.setState({ focusData: focusData });
      })
      .on("mouseout", () => {
        focusCircle.style("opacity", 0);
        focusLine.style("opacity", 0);
        focusCard.style("opacity", 0);
      });
  };

  render() {
    return (
      <>
        <div ref={this.gRef}></div>
        <div
          id="focusCard"
          className="card border-secondary"
          style={{ maxWidth: "18rem", opacity: 0, position: "absolute" }}
        >
          <div className="card-header font-weight-bold">
            {this.state?.focusData[0]?.lastUpdate.toISOString().slice(0, 10)}
          </div>
          <div className="card-body text-secondary font-weight-bold">
            {this.state.focusData.map((o) => (
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
      </>
    );
  }
}
