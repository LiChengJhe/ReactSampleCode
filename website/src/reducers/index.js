import { combineReducers } from 'redux'
import { GlobalStatReducer } from './../covid-19/store/reducers/GlobalStatReducer';
import { CountryStatReducer } from './../covid-19/store/reducers/CountryStatReducer';


const appReducers = combineReducers({GlobalStatReducer,CountryStatReducer});

export default appReducers