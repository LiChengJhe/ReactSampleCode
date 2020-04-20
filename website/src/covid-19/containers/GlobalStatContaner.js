import React, { Component } from 'react';
import { Box } from '@material-ui/core';
import { dataSourceService } from '../services/DataSourceService';
import { map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { connect } from 'react-redux'
import { ClearGlobalStat, SetGlobalStat } from './../store/actions/GlobalStatAction';
class GlobalStatContaner extends Component {
    componentDidMount() {
        this.loadData((data) => {
            console.log(this.props); 
        });
    }
    loadData = (callback) => {
        forkJoin([
            dataSourceService.getGlobalHistoricalStats(),
            dataSourceService.getCountryStats(),
            dataSourceService.getHistoricalCountryStats(),
        ]
        ).pipe(
            map(([globalHistoricalStats, countryStats, historicalCountryStats]) => {
                return { globalHistoricalStats: globalHistoricalStats, countryStats: countryStats, historicalCountryStats: historicalCountryStats };
            })
        ).subscribe((data) => {
            this.props.SetGlobalStat({
                    globalStat: dataSourceService.countGlobalStat(data.countryStats),
                    globalHistoricalStats:data.globalHistoricalStats,
                    countryStats:data.countryStats,
                    historicalCountryStats:data.historicalCountryStats
                });
            if (callback) {
                callback(data);
            }
        });
    }
    render() {
        return (
            <>
                < Box>GlobalPage</ Box>
            </>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        GlobalStat: state.GlobalStatReducer
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        SetGlobalStat: (state) => {
            dispatch(SetGlobalStat(state))
        },
        ClearGlobalStat: () => {
            dispatch(ClearGlobalStat())
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GlobalStatContaner);