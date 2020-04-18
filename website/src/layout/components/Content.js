
import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import GlobalPage from '../../covid-19/pages/GlobalPage';
import CountryPage from '../../covid-19/pages/CountryPage';

export default  class Content extends Component {

    render() {
        return (
            <>
                <Route path='/' exact component={GlobalPage} />
                <Route path='/global' component={GlobalPage} />
                <Route path='/country' component={CountryPage} />
            </>
        );
    }
}
