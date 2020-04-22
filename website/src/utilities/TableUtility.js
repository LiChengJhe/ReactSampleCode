import _ from "lodash";
import { Input, Button } from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import React from "react";

export const FieldType = {
  Number: "NUMBER",
  String: "STRING",
  Date: "DATE",
  Object: "Object",
  Array: "ARRAY",
  JSX: "JSX",
};
export function getColProp(title, field, sortOptions) {
  const prop = {
    title: title,
    dataIndex: field,
    key: field,
  };
  const sortProp = {};
  if (sortOptions) {
    switch (sortOptions.fieldType) {
      case FieldType.Number:
        sortProp.callback = (a, b) => a[field] - b[field];
        break;
      case FieldType.String:
        sortProp.callback = (a, b) =>
          a[field].localeCompare(b[field], "en", { numeric: true });
        break;
      default:
        sortProp.callback = sortOptions.callback;
        break;
    }
  }
  return _.merge(prop, { sorter: sortProp.callback });
}
export function getColSearchProps(dataIndex, that) {
  return {
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={(node) => {
            that.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys, confirm, dataIndex,that)
          }
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <Button
          type="primary"
          onClick={() => handleSearch(selectedKeys, confirm, dataIndex,that)}
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button
          onClick={() => handleReset(clearFilters,that)}
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
        setTimeout(() => that.searchInput.select());
      }
    },
    render: (text) =>
      that.state.searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[that.state.searchText]}
          autoEscape
          textToHighlight={text.toString()}
        />
      ) : (
        text
      ),
  };
}
export function handleSearch(selectedKeys, confirm, dataIndex,that)  {
    confirm();
    that.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
  };

  export function handleReset(clearFilters,that) {
    clearFilters();
    that.setState({ searchText: "" });
  }