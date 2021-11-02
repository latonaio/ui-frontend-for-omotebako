import {SET_CHECKOUT, RESET_CHECKOUT} from '../actions/checkout';

export default function checkoutReducer(state = null, action) {
  switch (action.type) {
    case SET_CHECKOUT:
      return action.payload.checkout;
    case RESET_CHECKOUT:
      return action.payload.checkout;
    default:
      return state;
  }
}
