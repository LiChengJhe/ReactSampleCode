import React, { Component } from "react";
import * as d3 from "d3";
import _ from "lodash";
import { connectableObservableDescriptor } from "rxjs/internal/observable/ConnectableObservable";

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
      this.draw(this.getSeries(this.props.countryStats, 5));
    }
  }

  getSeries = (data, top) => {
    const topStats = _.chain(data)
      .orderBy((o) => _.last(o.stats).confirmed, "desc")
      .take(top)
      .value();

    const topData = [];
    topStats.forEach((item) => {
      const last = _.last(item.stats);
      topData.push({
        country: item.country.name,
        data: [{
          name: '確診',
          value: last.confirmed
        }, {
          name: '治癒',
          value: last.confirmed * 0.9
        },
        {
          name: '死亡',
          value: last.confirmed * 0.7
        }]
      });
      item.values = last;
    });
    return topData;
  };


  draw = (data) => {
    this.chart = {};
    this.chart.data = data;
    this.addSvg();
    this.addTitles();
    this.addXY();
    this.addBars();
 
  };

  addBars = () => {
    const first = _.first(this.chart.data);
    const subgroups = _.chain(first.data).map((o) => o.name).value();
    this.chart.color = d3
      .scaleOrdinal()
      .domain(subgroups)
      .range(d3.schemeSet2);

    const ySubgroup = d3.scaleBand()
      .domain(subgroups)
      .range([0, this.chart.yScale.bandwidth()])
      .padding([0.05])

    this.chart.barArea = this.chart.svg.append("g");
    this.chart.barGroups = this.chart.barArea.selectAll("g")
      .data(this.chart.data)
      .enter()
      .append("g")
      .attr("class", "barGroup")
      .attr("transform", (d) => `translate(0,${this.chart.yScale(d.country)})`);

    this.chart.bars = this.chart.barGroups
      .selectAll(".bars")
      .data((d) => d.data)
      .enter()
      .append("g")
      .attr("class", "bars");

    this.chart.bars
      .append("rect")
      .attr("x", (d) => 0)
      .attr("y", (d) => ySubgroup(d.name))
      .attr("width", (d) => this.chart.xScale(d.value))
      .attr("height", (d) => ySubgroup.bandwidth())
      .attr("fill", (d) => this.chart.color(d.name));


    this.chart.bars
      .append("text")
      .attr("x", (d) => this.chart.xScale(d.value))
      .attr("y", (d) => ySubgroup(d.name) + 13)
      .text((d) => d.value)
      .style("fill", "#000000")
      .style("font-size", 12)
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
        `translate(${this.chart.margin.left},${this.chart.margin.top})`
      );
  };

  addXY() {

    const xMax = d3.max(_.first(this.chart.data).data, (d) => d.value);
    const xMin = d3.min(_.last(this.chart.data).data, (d) => d.value);
    this.chart.xScale = d3
      .scaleLinear()
      .domain([xMin, xMax])
      .range([0, this.chart.width])
      .nice();

    this.chart.yScale = d3
      .scaleBand()
      .domain(_.map(this.chart.data, (o) => o.country))
      .range([0, this.chart.height])
      .padding(0.2);

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
