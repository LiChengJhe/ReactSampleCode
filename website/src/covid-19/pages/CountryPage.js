
import React, { Component } from 'react';
import { dataSourceService } from '../services/DataSourceService';
import { map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
export default class CountryPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            countries: null
        };
      }
    componentDidMount() {
        this.loadData((data) => {
            console.log(this.state );
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
            this.setState((state)=>({
                countries: data.countries
            }));
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
