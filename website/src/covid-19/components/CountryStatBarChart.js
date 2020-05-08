import React, { Component } from "react";
import * as d3 from "d3";
import _ from "lodash";

export default class CountryStatBarChart extends Component {
  chart;
  constructor(props) {
    super(props);
    this.state = { focusData: [], selectedData: [] };
    this.gRef = React.createRef();
  }
  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.countryStats &&
      prevProps.countryStats !== this.props.countryStats
    ) {
      this.draw(this.getSeries(this.props.countryStats, 10));
    }
  }

  getSeries = (data, top) => {
    const topStats = _.chain(data)
      .orderBy((o) => _.last(o.stats).confirmed, "desc")
      .take(top)
      .value();

    topStats.forEach((item) => {
      const last = _.last(item.stats);
      item.values = last;
    });
    return topStats;
  };


  draw = (data) => {
    this.chart = {};
    this.chart.data = data;
    this.addSvg();
    this.addTitles();
    this.addXY();
   // this.addBars();
    // this.addFocus();
    // this.addLegend();
  };

  idled = () => {
    this.chart.idleTimeout = null;
  };

  updateChart = () => {
    const extent = d3.event.selection;

    if (!extent) {
      if (!this.chart.idleTimeout)
        return (this.chart.idleTimeout = setTimeout(this.idled, 350));
      this.chart.xScale.domain(this.chart.xExtent);
    } else {
      this.chart.xScale.domain([
        this.chart.xScale.invert(extent[0]),
        this.chart.xScale.invert(extent[1]),
      ]);
      this.chart.lines.select(".brush").call(this.chart.brush.move, null);
    }

    this.chart.xAxis
      .transition()
      .duration(1000)
      .call(d3.axisBottom(this.chart.xScale));

    this.chart.lines
      .selectAll(".line_g")
      .transition()
      .duration(1000)
      .attr("d", (d) => this.chart.lineGen(d.data));

    this.chart.lines
      .selectAll(".dot_g")
      .transition()
      .duration(1000)
      .attr("cx", (d) => this.chart.xScale(d.lastUpdate))
      .attr("cy", (d) => this.chart.yScale(d.value));
  };
  addLegend = () => {
    this.setState({ selectedData: this.chart.data });
    const legendGroup = this.chart.svg
      .selectAll("legend")
      .data(this.chart.data)
      .enter()
      .append("g")
      .on("click", (d) => {
        const line = this.chart.svg.selectAll(`.${d.name}_g`);
        const curOpacity = Number(line.style("opacity"));
        const checkbox = this.chart.svg.selectAll(`.${d.name}_checkbox`);
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
          checkbox.style("fill", this.chart.color(d.name));

          this.setState({
            selectedData: [d].concat(this.state.selectedData),
          });
        }
      });
    legendGroup
      .append("rect")
      .attr("class", (d) => `${d.name}_checkbox`)
      .attr(
        "x",
        (d, i) => this.chart.width - this.chart.margin.right + i * 70 - 21
      )
      .attr("y", -this.chart.margin.bottom * 1.4)
      .attr("width", 15)
      .attr("height", 15)
      .style("fill", (d) => this.chart.color(d.name))
      .style("outline-color", (d) => this.chart.color(d.name))
      .style("outline-style", "solid");
    legendGroup
      .append("text")
      .attr("x", (d, i) => this.chart.width - this.chart.margin.right + i * 70)
      .attr("y", -this.chart.margin.bottom)
      .text((d) => d.name)
      .style("fill", (d) => this.chart.color(d.name))
      .style("font-size", 15)
      .style("font-weight", "bold");
  };

  addBars = () => {
    this.chart.bars = this.chart.svg
      .selectAll("bars")
      .data(_.first(this.chart.data).data)
      .enter()
      .append("g");

    this.chart.bars
      .append("rect")
      .attr("x", 0)
      .attr("y", (d) => this.chart.yScale(d.country))
      .attr("width", (d) => this.chart.xScale(d.value))
      .attr("height", this.chart.yScale.bandwidth())
      .attr("fill", "#69b3a2");

    this.chart.bars
      .append("text")
      .attr("x", (d) => this.chart.xScale(d.value))
      .attr("y", (d) => this.chart.yScale(d.country) + 16)
      .text((d) => d.value)
      .style("fill", "#000000")
      .style("font-size", 15)
      .style("font-weight", "bold");
  };

  addTitles = () => {
    this.chart.svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", this.chart.margin.right)
      .attr("y", -this.chart.margin.bottom)
      .text("前十大確診國家");
    this.chart.svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -this.chart.margin.bottom * 2)
      .attr("x", -this.chart.margin.right / 2)
      .text("國家");
  };


  addSvg = () => {
    this.chart.margin = { top: 50, right: 150, bottom: 30, left: 100 };
    this.chart.width =
      window.screen.width - this.chart.margin.left - this.chart.margin.right;
    this.chart.height = 400 - this.chart.margin.top - this.chart.margin.bottom;

    this.chart.svg = d3
      .select(this.gRef.current)
      .append("svg")
      .attr(
        "width",
        this.chart.width + this.chart.margin.left + this.chart.margin.right
      )
      .attr(
        "height",
        this.chart.height + this.chart.margin.top + this.chart.margin.bottom
      )
      .append("g")
      .attr(
        "transform",
        "translate(" +
          this.chart.margin.left +
          "," +
          this.chart.margin.top +
          ")"
      );
  };

  addXY() {
    this.chart.xExtent = d3.extent(
     this.chart.data,
      (d) => d.values.confirmed
    );

    this.chart.xScale = d3
      .scaleLinear()
      .domain(this.chart.xExtent)
      .range([0, this.chart.width])
      .nice();

    this.chart.yScale = d3
      .scaleBand()
      .domain(_.map(this.chart.data, (o) => o.country.name))
      .range([0, this.chart.height])
      .padding(0.25);

    this.chart.xAxis = this.chart.svg
      .append("g")
      .attr("transform", `translate(0,${this.chart.height})`)
      .call(d3.axisBottom(this.chart.xScale).ticks(15));
    //   .selectAll("text")
    //   .attr("transform", "translate(-10,0)rotate(-20)")
    //   .style("text-anchor", "end");

    this.chart.yAxis = this.chart.svg
      .append("g")
      .call(d3.axisLeft(this.chart.yScale));
  }

  render() {
    return (
      <>
        <div ref={this.gRef}>
          <div
            className="card border-secondary focusCard"
            style={{ width: "250px", opacity: 0, position: "absolute" }}
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
        </div>
      </>
    );
  }
}
