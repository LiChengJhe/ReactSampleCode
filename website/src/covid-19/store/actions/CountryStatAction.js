import _ from 'lodash';
export const CountryStatActionType = {
    Set: 'SET_COUNTRY_STAT',
    Clear: 'CLEAR_COUNTRY_STAT'
}
export const setCountryStat = (state) => {
    return _.merge({ type: CountryStatActionType.Set }, { state: state });
}
export const clearCountryStat = () => {
    return { type: CountryStatActionType.Set };
}