import { combineReducers } from 'redux'
import { globalStatReducer } from './../covid-19/store/reducers/GlobalStatReducer';
import { countryStatReducer } from './../covid-19/store/reducers/CountryStatReducer';


const appReducers = combineReducers({globalStatReducer,countryStatReducer});

export default appReducers