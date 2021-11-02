import {SET_LOADING, CLOSE_LOADING} from '../actions/common';

export default function commonReducer(state = null, action) {
  switch (action.type) {
    case SET_LOADING:
      return action.payload.loading;
    case CLOSE_LOADING:
      return action.payload.loading;
    default:
      return state;
  }
}
