
import React, { Component } from 'react';
import { Box } from '@material-ui/core';
import { dataSourceService } from '../services/DataSourceService';
export default class GlobalPage extends Component {

    componentDidMount() {
        dataSourceService.getCountries().subscribe((data) => {
            console.log(data);
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
