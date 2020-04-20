import _ from 'lodash';
export const GlobalStatActionType = {
    Set: 'SET_GLOBAL_STAT',
    Clear: 'CLEAR_GLOBAL_STAT'
}
export const SetGlobalStat = (state) => {
    return _.merge({ type: GlobalStatActionType.Set }, { state: state });
}
export const ClearGlobalStat = (state) => {
    return { type: GlobalStatActionType.Set };
}