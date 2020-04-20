
import React, { Component } from 'react';
import { dataSourceService } from '../services/DataSourceService';
import { map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { connect } from 'react-redux'
import { ClearCountryStat,SetCountryStat } from './../store/actions/CountryStatAction';
class CountryStatContainer extends Component {
    componentDidMount() {
        this.loadData((data) => {
            console.log(this.props); 
        });
    }
    loadData = (callback) => {
        forkJoin([
            dataSourceService.getCountries()
        ]
        ).pipe(
            map(([countries]) => {
              return { countries};
            })
          ).subscribe((data) => {
            this.props.SetCountryStat({
                countries: data.countries
            });
            if (callback) {
              callback(data);
            }
          });
    }
    render() {
        return (
            <>
                CountryPage
            </>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        CountryStat: state.CountryStatReducer
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        SetCountryStat: (state) => {
            dispatch(SetCountryStat(state))
        },
        ClearCountryStat: () => {
            dispatch(ClearCountryStat())
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CountryStatContainer);
