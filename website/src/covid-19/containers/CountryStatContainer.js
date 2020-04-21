import React, { Component } from "react";
import { dataSourceService } from "../services/DataSourceService";
import { map } from "rxjs/operators";
import { forkJoin } from "rxjs";
import { connect } from "react-redux";
import {
  ClearCountryStat,
  SetCountryStat,
} from "./../store/actions/CountryStatAction";
import { Form, Select } from "antd";
import StatTable from './../components/StatTable';

const { Option } = Select;
class CountryStatContainer extends Component {
  componentDidMount() {
    this.loadData((data) => {
      
    });
  }
  loadData = (callback) => {
    forkJoin([dataSourceService.getCountries()])
      .pipe(
        map(([countries]) => {
          return { countries };
        })
      )
      .subscribe((data) => {
        this.props.SetCountryStat({
          countries: data.countries,
        });
        if (callback) {
          callback(data);
        }
      });
  };

  onValuesChange = (values) => {

    forkJoin([
        dataSourceService.getCountryStat(values.country),
        dataSourceService.getHistoricalCountryStatsByCountry(values.country)
      ]
      ).pipe(
        map(([countryStat, historicalCountryStats]) => {
          return { countryStat, historicalCountryStats };
        })
      ).subscribe((data) => {
        this.props.SetCountryStat({
            selectedCountryStat:data.countryStat,
            selectedHistoricalCountryStats:data.historicalCountryStats
          });
      
      });

  };

  render() {
    return (
      <>
        <Form
          initialValues={{
            country: "TWN",
          }}
          onValuesChange={this.onValuesChange}
        >
          <Form.Item name={["country"]}>
            <Select placeholder="選擇國家">
              {this.props?.countryStat?.countries?.map((o) => (
                <Option key={o.name} value={o.iso3}>
                  {o.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
        <StatTable countryStats={this.props.countryStat?.selectedCountryStat?[this.props.countryStat?.selectedCountryStat]:[]}/>
      </>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    countryStat: state.CountryStatReducer,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    SetCountryStat: (state) => {
      dispatch(SetCountryStat(state));
    },
    ClearCountryStat: () => {
      dispatch(ClearCountryStat());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CountryStatContainer);
