import {
  FETCH_GEOGRAPHY_DATA,
  RECEIVE_GEOGRAPHY_DATA,
  FETCH_SUBGEOGRAPHY_DATA,
  RECEIVE_SUBGEOGRAPHY_DATA
} from '../actions/app_actions';
import { pluralize, getNextGeography } from '../utils/convenience_funcs';

const initialState = {
  loading: false,
  geographies: {},
  subGeographies: [],
  totalEstimate: '426032',
  currentGeography: 'continent',
  currentGeographyId: 'africa'
};

export function geographies(state = initialState, action) {
  const totalEstimate = (data) => {
    if (data.countType === 'add') {
      // It appears that the API is returning inconsistent structures
      if (data.summary_sums === undefined) {
        return data.data.summary_sums[0].ESTIMATE;
      }
      return data.summary_sums[0].ESTIMATE;
    }
    return data[`${pluralize(getNextGeography(data.type))}_sum`][0].DEFINITE;
  };
  switch (action.type) {
    case RECEIVE_GEOGRAPHY_DATA:
      return { ...state,
        loading: false,
        geographies: action.data,
        totalEstimate: totalEstimate(action.data),
        currentGeography: action.data.type,
        currentGeographyId: action.data.id
      };
    case RECEIVE_SUBGEOGRAPHY_DATA:
      return { ...state,
        loading: false,
        subGeographies: action.data
      };
    case FETCH_GEOGRAPHY_DATA:
    case FETCH_SUBGEOGRAPHY_DATA:
      return { ...state, loading: true };
    default:
      return state;
  }
}