
import React, { Component } from 'react';
import { Box } from '@material-ui/core';
import { dataSourceService } from '../services/DataSourceService';
import { map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
export default class GlobalPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            globalStat: null,
            globalHistoricalStats:null,
            countryStats:null,
            historicalCountryStats:null
        };
      }
    componentDidMount() {
        this.loadData((data) => {
            console.log(this.state );
           
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
            this.setState((state)=>({
                globalStat: dataSourceService.countGlobalStat(data.countryStats),
                globalHistoricalStats:data.globalHistoricalStats,
                countryStats:data.countryStats,
                historicalCountryStats:data.historicalCountryStats
            }));
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
