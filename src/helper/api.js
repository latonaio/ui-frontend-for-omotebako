import config from '../util/config';

const API_URL = config.ReactAppAPIURL;
const MAX_RETRY_COUNT = 60;

export const startStreaming = () => {
  fetch(`${API_URL}streaming`)
  .then((response) => response.json())
  .catch((e) => {
    console.error("=== STREAMING ERROR ===:", e);
    throw e;
  });
};

export const fetchGuestInfo = (id) => {
  fetch(`${API_URL}guest/${id}`, {})
    .then((response) => response.json())
    .then((result) => {
      return result;
    })
    .catch((e) => {
      console.error("=== GUEST FETCH ERROR ===:", e);
      throw e;
    });
};

export const checkFaceAuthStatus = async (key) => {
  let retryCount = 0;
  let isCompleted = false;

  while (retryCount < MAX_RETRY_COUNT && !isCompleted) {
    await new Promise((r) => setTimeout(r, 1000));
    isCompleted = await fetch(`${API_URL}auth/${key}`)
      .then((response) => response.json())
      .then((data) => {
        return data;
      })
      .catch((e) => {
        alert(e);
        console.error("=== CHECK FACE AUTH STATUS ERROR ===", e);
        throw e;
      });

    retryCount++;
  }
};

// チェックアウトトランザクション作成するためのAPI
export const registerTransaction = (transactionCode, guestID) => {
  const data = {
    transactionCode,
    guestID,
  };

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  };

  fetch(`${API_URL}transaction/`, requestOptions)
    .then((res) => {
      if (res.ok) {
        return true;
      }
    })
    .catch((e) => {
      console.error("=== REGISTER TRANSACTION ERROR ===", e);
      throw e;
    });
};

export const getRoomAssignCount = async (guestID, dateFrom, dateTo) => {
  return fetch(
    `${API_URL}room-count?guestID=${guestID}&dateFrom=${dateFrom}&dateTo=${dateTo}`
  )
    .then((response) => response.json())
    .then((res) => {
      if (res.data[0].count) {
        return res.data[0].count;
      }
      return 0;
    })
    .catch((e) => {
      console.error("=== GET ROOM COUNT ERROR ===", e);
      throw e;
    });
};
