
import React from 'react';
import { Route } from 'react-router-dom';
import GlobalPage from '../../covid-19/pages/GlobalPage';
import CountryPage from '../../covid-19/pages/CountryPage';
import { Switch } from 'react-router-dom';
export function Content() {
        return (
            <Switch>
                <Route path='/' exact component={GlobalPage} />
                <Route path='/global' component={GlobalPage} />
                <Route path='/country' component={CountryPage} />
            </Switch>
        );
}
