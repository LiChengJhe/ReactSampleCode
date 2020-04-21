import _ from "lodash";
import { CountryStatActionType } from "../actions/CountryStatAction";

export const CountryStatReducer = (
  state = {
    countries: null,
    selectedCountryStat: null,
    selectedHistoricalCountryStats: null,
  },
  action
) => {
  switch (action.type) {
    case CountryStatActionType.Set:
      return _.merge({},state,action.state);
    case CountryStatActionType.Clear:
      return {};
    default:
      return state;
  }
};
