import React, {  useEffect } from "react";
import { dataSourceService } from "../services/DataSourceService";
import { map } from "rxjs/operators";
import { forkJoin } from "rxjs";
import { connect } from "react-redux";
import {
  clearGlobalStat,
  setGlobalStat,
} from "./../store/actions/GlobalStatAction";
import StatTable from "./../components/StatTable";
import StatCard from "./../components/StatCard";
import TotalStatLineChart from './../components/TotalStatLineChart';
import { Row, Col } from "antd";
import CountryStatBarChart from './../components/CountryStatBarChart';
function GlobalStatContaner(props) {
  const loadData = (callback) => {
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
        props.setGlobalStat({
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

  useEffect(() => {
    loadData((data) => { });
  }, []);

 

  return (
    <>
      <Row>
        <Col span={24}>
          <StatCard stat={props.global.globalStat} />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <CountryStatBarChart countryStats={props.global.countryStats} />
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <TotalStatLineChart globalStats={props.global.globalHistoricalStats} />
        </Col>
      </Row>
      <Row >
        <Col span={24}>
          <StatTable countryStats={props.global.countryStats} />
        </Col>
      </Row>
    </>
  );

}
const mapStateToProps = (state) => {
  return {
    global: state.globalStatReducer,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setGlobalStat: (state) => {
      dispatch(setGlobalStat(state));
    },
    clearGlobalStat: () => {
      dispatch(clearGlobalStat());
    },
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(GlobalStatContaner));
