import {SET_CHECKIN, RESET_CHECKIN} from '../actions/checkin';

export default function checkinReducer(state = null, action) {
  switch (action.type) {
    case SET_CHECKIN:
      return action.payload.checkin;
    case RESET_CHECKIN:
      return action.payload.checkin;
    default:
      return state;
  }
}
