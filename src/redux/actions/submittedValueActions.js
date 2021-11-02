export const SUBMIT_VALUE = 'SUBMIT_VALUE';
export const SET_RESERVATION = 'SET_RESERVATION';

export function submitValue(input) {
    return {
        type: SUBMIT_VALUE,
        payload: {
            submittedValue: input
        }
    }
}
