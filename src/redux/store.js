import {createStore, combineReducers} from 'redux';
import submittedValueReducer from './reducers/submittedValueReducer';
import reservationReducer from './reducers/reservation';
import commonReducer from './reducers/common'
import checkinReducer from './reducers/checkin';
import checkoutReducer from './reducers/checkout';

const allReducers = combineReducers({
  submittedValue: submittedValueReducer,
  reservation: reservationReducer,
  checkin: checkinReducer,
  checkout: checkoutReducer,
  common: commonReducer,
});

export const store = createStore(
  allReducers,
  {
    submittedValue: 'test input value',
    reservation: {},
    checkin: {},
    checkout: {},
    common: {
      loading: {
        isShow: false,
      }
    },
  },
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
