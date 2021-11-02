export const SET_LOADING = 'SET_LOADING';
export const CLOSE_LOADING = 'CLOSE_LOADING';

export function setLoading() {
  return {
    type: SET_LOADING,
    payload: {
      loading: true
    }
  }
}

export function closeLoading() {
  return {
    type: CLOSE_LOADING,
    payload: {
      loading: false
    }
  }
}

