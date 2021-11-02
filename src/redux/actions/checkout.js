export const SET_CHECKOUT = 'SET_CHECKOUT';
export const RESET_CHECKOUT = 'RESET_CHECKOUT';

export function setCheckout(data) {
  return {
    type: SET_CHECKOUT,
    payload: {
      checkout: data
    }
  }
}

export function resetCheckout() {
  return {
    type: RESET_CHECKOUT,
    payload: {
      checkout: {}
    }
  }
}

