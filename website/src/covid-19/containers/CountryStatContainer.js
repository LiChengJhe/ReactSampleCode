import React, {  useEffect }  from "react";
import { dataSourceService } from "../services/DataSourceService";
import { map } from "rxjs/operators";
import { forkJoin } from "rxjs";
import { connect } from "react-redux";
import {
  clearCountryStat,
  setCountryStat,
} from "./../store/actions/CountryStatAction";
import { Form, Select } from "antd";
import StatTable from './../components/StatTable';
import StatCard from './../components/StatCard';

const { Option } = Select;
function CountryStatContainer(props)  {
 

 const loadData = (callback) => {
    forkJoin([dataSourceService.getCountries()])
      .pipe(
        map(([countries]) => {
          return { countries };
        })
      )
      .subscribe((data) => {
        props.setCountryStat({
          countries: data.countries,
        });
        if (callback) {
          callback(data);
        }
      });
  };

  const onValuesChange = (values) => {

    forkJoin([
        dataSourceService.getCountryStat(values.country),
        dataSourceService.getHistoricalCountryStatsByCountry(values.country)
      ]
      ).pipe(
        map(([countryStat, historicalCountryStats]) => {
          return { countryStat, historicalCountryStats };
        })
      ).subscribe((data) => {
        props.setCountryStat({
            selectedCountryStat:data.countryStat,
            selectedHistoricalCountryStats:data.historicalCountryStats
          });
      
      });

  };

  useEffect(() => {
    loadData((data) => {
      onValuesChange({country:"TWN"});
  });
  }, []);

    return (
      <>
        <Form
          initialValues={{
            country: "TWN",
          }}
          onValuesChange={onValuesChange}
        >
          <Form.Item name={["country"]}>
            <Select placeholder="選擇國家">
              {props?.country?.countries?.map((o) => (
                <Option key={o.name} value={o.iso3}>
                  {o.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
        <StatCard stat={props.country?.selectedCountryStat?.stats[props.country?.selectedCountryStat?.stats.length-1]} />
        <StatTable countryStats={props.country?.selectedCountryStat?[props.country.selectedCountryStat]:[]}/>
      </>
    );
  }

const mapStateToProps = (state) => {
  return {
    country: state.countryStatReducer,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setCountryStat: (state) => {
      dispatch(setCountryStat(state));
    },
    clearCountryStat: () => {
      dispatch(clearCountryStat());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CountryStatContainer);
