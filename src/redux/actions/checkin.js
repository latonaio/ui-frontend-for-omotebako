export const SET_CHECKIN = 'SET_CHECKIN';
export const RESET_CHECKIN = 'RESET_CHECKIN';

export function setCheckin(data) {
  return {
    type: SET_CHECKIN,
    payload: {
      checkin: data
    }
  }
}

export function resetCheckin() {
  return {
    type: RESET_CHECKIN,
    payload: {
      checkin: {}
    }
  }
}

