export const SET_RESERVATION = 'SET_RESERVATION';
export const REMOVE_RESERVATION = 'REMOVE_RESERVATION';
export const GET_RESERVATION = 'GET_RESERVATION';

export function setReservation(data) {
  return {
    type: SET_RESERVATION,
    payload: {
      reservation: data
    }
  }
}

export function removeReservation() {
  return {
    type: REMOVE_RESERVATION,
    payload: {
      reservation: {}
    }
  }
}

export function getReservation(state) {
  return {
    type: GET_RESERVATION,
    result: state
  }
}
