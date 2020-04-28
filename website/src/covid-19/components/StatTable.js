import React, { Component } from "react";
import _ from "lodash";
import { Table } from "antd";
import { FieldType,getColSearchProps , getColProp } from "./../../utilities/TableUtility";
export default class StatTable extends Component {
  constructor(prop) {
    super(prop);
    this.state = {
      searchText: '',
      searchedColumn: '',
    };
  }

  getTableCols = () => {
    return [
      {
        ...getColProp("國家","country",{fieldType:FieldType.String}),
        ...getColSearchProps("country",this),
      },
      {
        ...getColProp("確診(總)","totalConfirmed",{fieldType:FieldType.Number})
      },
      {
        ...getColProp("死亡(總)","totalDeaths",{fieldType:FieldType.Number})
      },
      {
        ...getColProp("治癒(總)","totalRecovered",{fieldType:FieldType.Number})
      },
      {
        ...getColProp("治癒率","recoveredRate",{
            fieldType:FieldType.JSX,
            callback:(a,b)=> a.recoveredRate.props.children[0]-b.recoveredRate.props.children[0]     
        })
      },
      {
        ...getColProp("輕症率","mildRate",{
            fieldType:FieldType.JSX,
            callback:(a,b)=> a.mildRate.props.children[0]-b.mildRate.props.children[0]     
        })
      },
      {
        ...getColProp("重症率","criticalRate",{
            fieldType:FieldType.JSX,
            callback:(a,b)=> a.criticalRate.props.children[0]-b.criticalRate.props.children[0]     
        })
      },
      {
        ...getColProp("死亡率","deathRate",{
            fieldType:FieldType.JSX,
            callback:(a,b)=> a.deathRate.props.children[0]-b.deathRate.props.children[0]     
        })
      },
      {
        ...getColProp("確診(今日)","todayConfirmed",{fieldType:FieldType.Number})
      },
      {
        ...getColProp("死亡(今日)","todayDeaths",{fieldType:FieldType.Number})
      },
    ];
  };
  getTableData = (raw) => {
    const table = [];
    if (raw) {
      raw.forEach((item, index) => {
        const prvStat = _.first(item.stats);
        const lastStat = _.last(item.stats);
        table.push({
          key: index,
          country: item.country.name,
          todayConfirmed: prvStat.confirmed,
          todayRecovered: prvStat.recovered,
          todayDeaths: prvStat.deaths,
          totalConfirmed: lastStat.confirmed,
          totalRecovered: lastStat.recovered,
          totalDeaths: lastStat.deaths,
          deathRate: <b style={{ color: "#ff3300" }}>{lastStat.deathRate}%</b>,
          recoveredRate: (
            <b style={{ color: "#00cc66" }}>{lastStat.recoveredRate}%</b>
          ),
          criticalRate: (
            <b style={{ color: "#006699" }}>{lastStat.criticalRate}%</b>
          ),
          mildRate: <b style={{ color: "#ff9933" }}>{lastStat.mildRate}%</b>,
        });
      });
    }
    return table;
  };




  render() {
    return (
      <>
        <Table
          columns={this.getTableCols()}
          dataSource={this.getTableData(this.props.countryStats)}
        />
      </>
    );
  }
}
