
import _ from 'lodash';
import { GlobalStatActionType } from '../actions/GlobalStatAction';

export const GlobalStatReducer = (
    state = {
        globalStat: null,
        globalHistoricalStats: null,
        countryStats: null,
        historicalCountryStats: null
    }, action) => {
    switch (action.type) {
        case GlobalStatActionType.Set:
            return _.cloneDeep( action.state);
        case GlobalStatActionType.Clear:
            return {};
        default:
            return state
    }
}

