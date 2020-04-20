import _ from 'lodash';
export const CountryStatActionType = {
    Set: 'SET_COUNTRY_STAT',
    Clear: 'CLEAR_COUNTRY_STAT'
}
export const SetCountryStat = (state) => {
    return _.merge({ type: CountryStatActionType.Set }, { state: state });
}
export const ClearCountryStat = () => {
    return { type: CountryStatActionType.Set };
}