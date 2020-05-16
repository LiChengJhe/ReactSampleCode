import _ from 'lodash';
export const GlobalStatActionType = {
    Set: 'SET_GLOBAL_STAT',
    Clear: 'CLEAR_GLOBAL_STAT'
}
export const setGlobalStat = (state) => {
    return _.merge({ type: GlobalStatActionType.Set }, { state: state });
}
export const clearGlobalStat = (state) => {
    return { type: GlobalStatActionType.Set };
}