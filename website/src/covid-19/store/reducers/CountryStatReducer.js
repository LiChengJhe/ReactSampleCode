
import _ from 'lodash';
import { CountryStatActionType } from '../actions/CountryStatAction';


export const CountryStatReducer = (
    state = {
        countries: null
    }, action) => {
    switch (action.type) {
        case CountryStatActionType.Set:
            return _.cloneDeep( action.state);
        case CountryStatActionType.Clear:
            return {};
        default:
            return state
    }
}

