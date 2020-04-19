
import _ from 'lodash';
import axios from 'axios';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
class DataSourceService {
    covid19MathdroApi = 'https://covid19.mathdro.id/api';
    coronaNinjaApi = 'https://corona.lmao.ninja';

    getCountries() {
        const promise = axios.get(`${this.covid19MathdroApi}/countries`);
        return from(promise).pipe(
            map((list) => {
                const countries = [];
                list.data.countries.forEach(element => {
                    countries.push({
                        name: _.replace(element.name, '*', ''),
                        iso2: element.iso2,
                        iso3: element.iso3,
                    });
                });
                return countries;
            }));
    }

    getHistoricalCountryStats() {
        const promise = axios.get(`${this.coronaNinjaApi}/v2/historical`);
        return from(promise).pipe(
            map((list) => {

                let countryStatsMap = {};
                list.forEach(element => {
                    const queryKey = `${element.country}-${element.province}`;

                    countryStatsMap[queryKey] = {
                        country: { Name: element.country },
                        stats: []
                    };

                    // tslint:disable-next-line: forin
                    for (const item in element.timeline.cases) {
                        countryStatsMap[queryKey].Stats.push({
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
                    const queryKey = `${element.Country.Name}`;
                    if (countryStatsMap[queryKey]) {

                        countryStatsMap[queryKey].Stats.forEach((item, index) => {
                            item.confirmed += element.Stats[index].confirmed;
                            item.deaths += element.Stats[index].deaths;
                            item.recovered += element.Stats[index].recovered;
                        });
                    } else {
                        countryStatsMap[queryKey] = element;
                    }
                });

                countryStats = _.values(countryStatsMap);

                countryStats.forEach(element => {
                    element.Stats.forEach(item => {
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
          map((data) => {
            const countryStat = { Country: { Name: data.country }, Stats: [] };

            for (const item in data.timeline.cases) {
              const confirmed = data.timeline.cases[item];
              const recovered = data.timeline.recovered[item];
              const deaths = data.timeline.deaths[item];
              countryStat.Stats.push({
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
          map((list) => {
            const stats = [];
            for (const item in list.cases) {
              stats.push({
                confirmed: list.cases[item],
                recovered: list.recovered[item],
                deaths: list.deaths[item],
                recoveredRate: _.round((list.recovered[item] / list.cases[item]) * 100, 2),
                deathRate: _.round((list.deaths[item] / list.cases[item]) * 100, 2),
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
          lastUpdate: _.first(_.last(countryStats).Stats).lastUpdate
        };
    
        countryStats.forEach(item => {
          const stat = _.last(item.Stats);
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
          map((item) => ({
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
              }
            ]
          })));
      }
    
    
      getCountryStats() {
        const promise = axios.get(`${this.coronaNinjaApi}/v2/countries`);
        return from(promise).pipe(
          map((list) =>
            list.map(item =>
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
          map((list) => _.orderBy(list, o => _.last(o.Stats).confirmed, 'desc'))
        );
      }
}

export const dataSourceService = new DataSourceService();