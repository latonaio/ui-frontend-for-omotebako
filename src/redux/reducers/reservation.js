import {
  SET_RESERVATION,
  REMOVE_RESERVATION,
  GET_RESERVATION
} from '../actions/reservation';

export default function reservationReducer(state = null, action) {
  switch (action.type) {
    case SET_RESERVATION:
      return action.payload.reservation;
    case REMOVE_RESERVATION:
      return action.payload.reservation;
    case GET_RESERVATION:
      return state;
    default:
      return state;
  }
}
