
import _ from 'lodash';
import axios from 'axios';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
export class DataSourceService {
    covid19MathdroApi = 'https://covid19.mathdro.id/api';
    coronaNinjaApi = 'https://corona.lmao.ninja';

    getCountries() {
        const promise = axios.get(`${this.covid19MathdroApi}/countries`);
        return from(promise).pipe(
            map((res) => {
                const countries = [];
                res.data.countries.forEach(element => {
                    countries.push({
                        name: _.replace(element.name, '*', ''),
                        iso2: element.iso2,
                        iso3: element.iso3
                    });
                });
                return countries;
            }));
    }

    getHistoricalCountryStats() {
        const promise = axios.get(`${this.coronaNinjaApi}/v2/historical`);
        return from(promise).pipe(
            map((res) => {

                let countryStatsMap = {};
                res.data.forEach(element => {
                    const queryKey = `${element.country}-${element.province}`;

                    countryStatsMap[queryKey] = {
                        country: { Name: element.country },
                        stats: []
                    };

                    // tslint:disable-next-line: forin
                    for (const item in element.timeline.cases) {
                        countryStatsMap[queryKey].stats.push({
                            confirmed: element.timeline.cases[item],
                            recovered: element.timeline.recovered[item],
                            deaths: element.timeline.deaths[item],
                            lastUpdate: new Date(item)
                        });
                    }

                });

                let countryStats = _.values(countryStatsMap);
                countryStatsMap = {};

                countryStats.forEach(element => {
                    const queryKey = `${element.country.Name}`;
                    if (countryStatsMap[queryKey]) {

                        countryStatsMap[queryKey].stats.forEach((item, index) => {
                            item.confirmed += element.stats[index].confirmed;
                            item.deaths += element.stats[index].deaths;
                            item.recovered += element.stats[index].recovered;
                        });
                    } else {
                        countryStatsMap[queryKey] = element;
                    }
                });

                countryStats = _.values(countryStatsMap);

                countryStats.forEach(element => {
                    element.stats.forEach(item => {
                        item.recoveredRate = _.round((item.recovered / item.confirmed) * 100, 2);
                        item.deathRate = _.round((item.deaths / item.confirmed) * 100, 2);
                    });
                });


                return countryStats;
            }));
    }

    getHistoricalCountryStatsByCountry(country) {
        const promise = axios.get(`${this.coronaNinjaApi}/v2/historical/${country.iso3}`);
  
        return from(promise ).pipe(
          map((res) => {
            const  data = res.data;
            const countryStat = { country: { name: data.country }, stats: [] };

            for (const item in data.timeline.cases) {
              const confirmed = data.timeline.cases[item];
              const recovered = data.timeline.recovered[item];
              const deaths = data.timeline.deaths[item];
              countryStat.stats.push({
                confirmed: confirmed,
                recovered: recovered,
                deaths: deaths,
                recoveredRate: _.round((recovered / confirmed) * 100, 2),
                deathRate: _.round((deaths / confirmed) * 100, 2),
                lastUpdate: new Date(item)
              });
            }
    
    
            return countryStat;
          }));
      }
    
      getGlobalHistoricalStats() {
        const promise = axios.get(`${this.coronaNinjaApi}/v2/historical/all`);
        return from(promise).pipe(
          map((res) => {
            const  data = res.data;
            const stats = [];
            for (const item in data.cases) {
              stats.push({
                confirmed: data.cases[item],
                recovered: data.recovered[item],
                deaths: data.deaths[item],
                recoveredRate: _.round((data.recovered[item] / data.cases[item]) * 100, 2),
                deathRate: _.round((data.deaths[item] / data.cases[item]) * 100, 2),
                lastUpdate: new Date(item)
              });
            }
    
            return stats;
          }));
      }
    
      countGlobalStat(countryStats){
        const globalStat = {
          confirmed: 0,
          recovered: 0,
          deaths: 0,
          critical: 0,
          recoveredRate: 0,
          deathRate: 0,
          criticalRate: 0,
          mildRate: 0,
          lastUpdate: _.first(_.last(countryStats).stats).lastUpdate
        };
    
        countryStats.forEach(item => {
          const stat = _.last(item.stats);
          globalStat.confirmed += stat.confirmed;
          globalStat.recovered += stat.recovered;
          globalStat.deaths += stat.deaths;
          globalStat.critical += stat.critical;
        });
        globalStat.recoveredRate = _.round((globalStat.recovered / globalStat.confirmed) * 100, 2);
        globalStat.deathRate = _.round((globalStat.deaths / globalStat.confirmed) * 100, 2);
        globalStat.criticalRate = _.round((globalStat.critical / globalStat.confirmed) * 100, 2);
        globalStat.mildRate = 100 - globalStat.criticalRate;
        return globalStat;
      }
    
    
    
    
      getCountryStat(country){
        const promise = axios.get(`${this.coronaNinjaApi}/v2/countries/${country.iso3}`);
        return from(promise).pipe(
          map((res) => ({
            country: {
              name: res.data.country,
              iso2: res.data.countryInfo.iso2,
              iso3: res.data.countryInfo.iso3
            },
            stats: [
              {
                confirmed: res.data.todayCases,
                deaths: res.data.todaydeaths
              },
              {
                confirmed: res.data.cases,
                recovered: res.data.recovered,
                deaths: res.data.deaths,
                critical: res.data.critical,
                recoveredRate: _.round((res.data.recovered / res.data.cases) * 100, 2),
                deathRate: _.round((res.data.deaths / res.data.cases) * 100, 2),
                criticalRate: _.round((res.data.critical / res.data.cases) * 100, 2),
                mildRate: _.round(100 - (res.data.critical / res.data.cases) * 100, 2),
                lastUpdate: new Date(res.data.updated)
              }
            ]
          })));
      }
    
    
      getCountryStats() {
        const promise = axios.get(`${this.coronaNinjaApi}/v2/countries`);
        return from(promise).pipe(
          map((res) =>
            res.data.map(item =>
              ({
                country: {
                  name: item.country,
                  iso2: item.countryInfo.iso2,
                  iso3: item.countryInfo.iso3
                },
                stats: [
                  {
                    confirmed: item.todayCases,
                    deaths: item.todaydeaths
                  },
                  {
                    confirmed: item.cases,
                    recovered: item.recovered,
                    deaths: item.deaths,
                    critical: item.critical,
                    recoveredRate: _.round((item.recovered / item.cases) * 100, 2),
                    deathRate: _.round((item.deaths / item.cases) * 100, 2),
                    criticalRate: _.round((item.critical / item.cases) * 100, 2),
                    mildRate: _.round(100 - (item.critical / item.cases) * 100, 2),
                    lastUpdate: new Date(item.updated)
                  }]
    
              }))),
          map((list) => _.orderBy(list, o => _.last(o.stats).confirmed, 'desc'))
        );
      }
}

export const dataSourceService = new DataSourceService();