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
      .orderBy((o) => _.last(o.stats).Confirmed, "desc")
      .take(top)
      .value();
    const confirmed = { name: "確診", data: [] };
    topStats.forEach((item) => {
      const last = _.last(item.stats);
      confirmed.data.push({
        value: last.confirmed,
        country: item.country.name,
      });
    });
    return [confirmed];
  };
  getDate(stats) {
    const confirmedDate = [];
    stats.forEach((item) => {
      confirmedDate.push(item.lastUpdate.toISOString());
    });
    return confirmedDate;
  }

  draw = (data) => {
    this.chart = {};
    this.chart.data = data;
    this.addSvg();
    this.addTitles();
    this.addXY();
    // this.addLines();
    // this.addBrushing();
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

  addLines = () => {
    this.chart.color = d3
      .scaleOrdinal()
      .domain(_.map(this.chart.data, (o) => o.name))
      .range(d3.schemeSet2);

    this.chart.lineGen = d3
      .line()
      .x((d) => {
        return this.chart.xScale(d.lastUpdate);
      })
      .y((d) => {
        return this.chart.yScale(d.value);
      });

    this.chart.lines = this.chart.svg
      .append("g")
      .attr("clip-path", "url(#clip)");

    this.chart.lines
      .selectAll("lines")
      .data(this.chart.data)
      .enter()
      .append("path")
      .attr("class", (d) => `${d.name}_g line_g`)
      .attr("d", (d) => this.chart.lineGen(d.data))
      .attr("stroke", (d) => this.chart.color(d.name))
      .style("stroke-width", 4)
      .style("fill", "none");

    this.chart.lines
      .selectAll("dots")
      .data(this.chart.data)
      .enter()
      .append("g")
      .attr("class", (d) => `${d.name}_g`)
      .style("fill", (d) => this.chart.color(d.name))
      .selectAll("points")
      .data((d) => d.data)
      .enter()
      .append("circle")
      .attr("class", (d) => `dot_g`)
      .attr("cx", (d) => this.chart.xScale(d.lastUpdate))
      .attr("cy", (d) => this.chart.yScale(d.value))
      .attr("r", 5)
      .attr("stroke", "white");
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

  addFocus = () => {
    const that = this;
    this.chart.focusLine = this.chart.lines
      .append("line")
      .attr("stroke", "#EBEBEB")
      .attr("stroke-dasharray", 2)
      .style("opacity", 0);
    this.chart.focusCircle = this.chart.lines
      .selectAll("focusCircle")
      .data(this.chart.data)
      .enter()
      .append("circle")
      .attr("class", (d) => `${d.name}_focusCircle`)
      .style("fill", "none")
      .attr("stroke", (d) => this.chart.color(d.name))
      .attr("r", 8.5)
      .style("opacity", 0);
    this.chart.focusCard = d3.select(this.gRef.current).select(".focusCard");
    this.chart.lines
      .on("mouseover", () => {
        this.chart.focusCircle.each(function (element, item) {
          if (_.find(that.state.selectedData, (o) => o.name === element.name)) {
            d3.select(this).style("opacity", 1);
          }
        });
        this.chart.focusLine.style("opacity", 1);
        if (that.state.selectedData.length > 1) {
          this.chart.focusCard.style("opacity", 1);
        }
      })
      .on("mousemove", function () {
        const mouse = d3.mouse(this);
        const x = that.chart.xScale.invert(mouse[0]);
        const y = that.chart.yScale.invert(mouse[1]);
        that.chart.focusCard.style("left", `${that.chart.xScale(x) + 150}px`);
        that.chart.focusCard.style("top", `${that.chart.yScale(y)}px`);
        const selectedX = _.find(
          _.first(that.chart.data).data,
          (o) => o.lastUpdate.toDateString() === x.toDateString()
        );

        if (selectedX) {
          const focusData = [];
          that.chart.focusLine
            .attr("x1", that.chart.xScale(selectedX.lastUpdate))
            .attr("x2", that.chart.xScale(selectedX.lastUpdate))
            .attr("y1", 0)
            .attr("y2", that.chart.height);

          that.chart.focusCircle.each(function (element, item) {
            if (
              _.find(that.state.selectedData, (o) => o.name === element.name)
            ) {
              const selectedData = _.find(
                element.data,
                (o) => o.lastUpdate.toDateString() === x.toDateString()
              );
              focusData.push(
                _.merge(
                  { name: element.name, color: that.chart.color(element.name) },
                  selectedData
                )
              );
              d3.select(this)
                .attr("cx", that.chart.xScale(selectedData.lastUpdate))
                .attr("cy", that.chart.yScale(selectedData.value));
            }
          });
          that.setState({ focusData: focusData });
        }
      })
      .on("mouseout", () => {
        this.chart.focusCircle.style("opacity", 0);
        this.chart.focusLine.style("opacity", 0);
        this.chart.focusCard.style("opacity", 0);
      });
  };

  addBrushing = () => {
    this.chart.clip = this.chart.svg
      .append("defs")
      .append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("width", this.chart.width)
      .attr("height", this.chart.height)
      .attr("x", 0)
      .attr("y", 0);
    this.chart.brush = d3
      .brushX()
      .extent([
        [0, 0],
        [this.chart.width, this.chart.height],
      ])
      .on("end", () => this.updateChart());

    this.chart.lines.append("g").attr("class", "brush").call(this.chart.brush);

    this.chart.svg.on("dblclick", () => {
      this.chart.xScale.domain(this.chart.xExtent);
      this.chart.xAxis.transition().call(d3.axisBottom(this.chart.xScale));
      this.chart.svg
        .selectAll(".line_g")
        .transition()
        .attr("d", (d) => this.chart.lineGen(d.data));
      this.chart.svg
        .selectAll(".dot_g")
        .transition()
        .duration(1000)
        .attr("cx", (d) => this.chart.xScale(d.lastUpdate))
        .attr("cy", (d) => this.chart.yScale(d.value));
    });
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
      _.first(this.chart.data).data,
      (d) => d.value
    );
    console.log(this.chart.xExtent);
    this.chart.xScale = d3
      .scaleLinear()
      .domain(this.chart.xExtent)
      .range([0, this.chart.width]);

    this.chart.yScale = d3
      .scaleBand()
      .domain(_.map(_.first(this.chart.data).data, (o) => o.country))
      .range([ this.chart.height,0])
      .padding(0.1);

    this.chart.xAxis = this.chart.svg
      .append("g")
      .attr("transform", "translate(0," + this.chart.height + ")")
      .call(
        d3
          .axisBottom(this.chart.xScale)
          .ticks(10)
      );
    this.chart.yAxis = this.chart.svg
      .append("g")
      .call(
        d3.axisLeft(this.chart.yScale)
      );

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
