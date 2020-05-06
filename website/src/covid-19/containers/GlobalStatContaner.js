import React, { Component } from "react";
import { dataSourceService } from "../services/DataSourceService";
import { map } from "rxjs/operators";
import { forkJoin } from "rxjs";
import { connect } from "react-redux";
import {
  ClearGlobalStat,
  SetGlobalStat,
} from "./../store/actions/GlobalStatAction";
import StatTable from "./../components/StatTable";
import StatCard from "./../components/StatCard";
import TotalStatLineChart from './../components/TotalStatLineChart';
import { Row, Col } from "antd";
import CountryStatBarChart from './../components/CountryStatBarChart';
class GlobalStatContaner extends Component {

  componentDidMount() {
    this.loadData((data) => { });
  }
  loadData = (callback) => {
    forkJoin([
      dataSourceService.getGlobalHistoricalStats(),
      dataSourceService.getCountryStats(),
      dataSourceService.getHistoricalCountryStats(),
    ])
      .pipe(
        map(([globalHistoricalStats, countryStats, historicalCountryStats]) => {
          return {
            globalHistoricalStats: globalHistoricalStats,
            countryStats: countryStats,
            historicalCountryStats: historicalCountryStats,
          };
        })
      )
      .subscribe((data) => {
        this.props.SetGlobalStat({
          globalStat: dataSourceService.countGlobalStat(data.countryStats),
          globalHistoricalStats: data.globalHistoricalStats,
          countryStats: data.countryStats,
          historicalCountryStats: data.historicalCountryStats,
        });
        if (callback) {
          callback(data);
        }
      });
  };
  render() {
    return (
      <>
        <Row>
          <Col span={24}>
            <StatCard stat={this.props.global.globalStat} />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <CountryStatBarChart countryStats={this.props.global.countryStats} />
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <TotalStatLineChart globalStats={this.props.global.globalHistoricalStats} />
          </Col>
        </Row>
        <Row >
          <Col span={24}>
            <StatTable countryStats={this.props.global.countryStats} />
          </Col>
        </Row>
      </>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    global: state.GlobalStatReducer,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    SetGlobalStat: (state) => {
      dispatch(SetGlobalStat(state));
    },
    ClearGlobalStat: () => {
      dispatch(ClearGlobalStat());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(GlobalStatContaner);
