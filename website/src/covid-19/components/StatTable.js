import React, { Component } from "react";
import _ from "lodash";
import { Table, Input, Button } from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
export default class StatTable extends Component {
  constructor(prop) {
    super(prop);
    this.state = {
      searchText: "",
      searchedColumn: "",
    };
  }

  getTableCols = () => {
    return [
      {
        title: "國家",
        dataIndex: "country",
        key: "country",
        sorter: (a, b) =>
          a.country.localeCompare(b.country, "en", { numeric: true }),
        ...this.getColumnSearchProps("country"),
      },
      {
        title: "確診(總)",
        dataIndex: "totalConfirmed",
        key: "totalConfirmed",
        sorter: (a, b) => a.totalConfirmed - b.totalConfirmed,
      },
      {
        title: "死亡(總)",
        dataIndex: "totalDeaths",
        key: "totalDeaths",
        sorter: (a, b) => a.totalDeaths - b.totalDeaths,
      },
      {
        title: "治癒(總)",
        dataIndex: "totalRecovered",
        key: "totalRecovered",
        sorter: (a, b) => a.totalRecovered - b.totalRecovered,
      },
      {
        title: "治癒率",
        dataIndex: "recoveredRate",
        key: "recoveredRate",
      },
      {
        title: "輕症率",
        dataIndex: "mildRate",
        key: "mildRate",
      },
      {
        title: "重症率",
        dataIndex: "criticalRate",
        key: "criticalRate",
      },
      {
        title: "死亡率",
        dataIndex: "deathRate",
        key: "deathRate",
      },
      {
        title: "確診(今日)",
        dataIndex: "todayConfirmed",
        key: "todayConfirmed",
        sorter: (a, b) => a.todayConfirmed - b.todayConfirmed,
      },
      {
        title: "死亡(今日)",
        dataIndex: "todayDeaths",
        key: "todayDeaths",
        sorter: (a, b) => a.todayDeaths - b.todayDeaths,
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
          deathRate: <b style={{ color: "red" }}>{lastStat.deathRate}%</b>,
          recoveredRate: (
            <b style={{ color: "green" }}>{lastStat.recoveredRate}%</b>
          ),
          criticalRate: (
            <b style={{ color: "blue" }}>{lastStat.criticalRate}%</b>
          ),
          mildRate: <b style={{ color: "orange" }}>{lastStat.mildRate}%</b>,
        });
      });
    }
    return table;
  };

  getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={(node) => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            this.handleSearch(selectedKeys, confirm, dataIndex)
          }
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button
          onClick={() => this.handleReset(clearFilters)}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: (text) =>
      this.state.searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[this.state.searchText]}
          autoEscape
          textToHighlight={text.toString()}
        />
      ) : (
        text
      ),
  });

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
  };

  handleReset = (clearFilters) => {
    clearFilters();
    this.setState({ searchText: "" });
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
