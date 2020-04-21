import React, { Component } from "react";
import _ from 'lodash';
import { Table } from 'antd';
export default class StatTable extends Component {
  getTableCols = () => {
    return [
      {
        title: '國家',
        dataIndex: 'country',
        key: 'country',
      },
      {
        title: '確診(總)',
        dataIndex: 'totalConfirmed',
        key: 'totalConfirmed',
      },
      {
        title: '死亡(總)',
        dataIndex: 'totalDeaths',
        key: 'totalDeaths',
      },
      {
        title: '治癒(總)',
        dataIndex: 'totalRecovered',
        key: 'totalRecovered',
      },
      {
        title: '治癒率',
        dataIndex: 'recoveredRate',
        key: 'recoveredRate',
      },
      {
        title: '輕症率',
        dataIndex: 'mildRate',
        key: 'mildRate',
      },
      {
        title: '重症率',
        dataIndex: 'criticalRate',
        key: 'criticalRate',
      },
      {
        title: '死亡率',
        dataIndex: 'deathRate',
        key: 'deathRate',
      },
      {
        title: '確診(今日)',
        dataIndex: 'todayConfirmed',
        key: 'todayConfirmed',
      },
      {
        title: '死亡(今日)',
        dataIndex: 'todayDeaths',
        key: 'todayDeaths',
      },
    ];
  };
  getTableData=(raw)=>{
    const table = [];
    console.log(raw);
    if(raw){
    raw.forEach((item,index) => {
        const prvStat= _.first(item.stats);
        const lastStat = _.last(item.stats);
        table.push({
          key:index,
          country: item.country.name,
          todayConfirmed: prvStat.confirmed,
          todayRecovered: prvStat.recovered,
          todayDeaths: prvStat.deaths,
          totalConfirmed: lastStat.confirmed,
          totalRecovered: lastStat.recovered,
          totalDeaths: lastStat.deaths,
          deathRate: lastStat.deathRate,
          recoveredRate: lastStat.recoveredRate,
          criticalRate: lastStat.criticalRate,
          mildRate: lastStat.mildRate
        });
      });
    }
    console.log(table);
      return table;
  }
  render() {
    return (
    <>
      <Table columns={this.getTableCols()} dataSource={this.getTableData(this.props.countryStats)}  />
    </>
    );
  }
}
