import config from './config'

const RequestManagerGifAPIURL = config.RequestManagerGifAPIURL;
const RequestManagerAPIURL = config.RequestManagerAPIURL;

const getFetch = async (requestUrl) => {
  const requestOptions = {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  };

  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`${RequestManagerAPIURL}/${requestUrl}`, requestOptions);

      if (!response.ok) {
        throw await response.json();
      }

      return resolve(response.json());
    } catch (e) {
      return reject(e);
    }
  });
}

const getFetchForGif = async (key) => {
  const requestOptions = {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  };

  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`${RequestManagerGifAPIURL}/${key}`, requestOptions);

      if (!response.ok) {
        throw await response.json();
      }

      return resolve(response.json());
    } catch (e) {
      return reject(e);
    }
  });
}

const postFetch = async (requestUrl, data) => {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  };

  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`${RequestManagerAPIURL}/${requestUrl}`, requestOptions);

      if (!response.ok) {
        throw await response.json();
      }

      return resolve(response.json());
    } catch (e) {
      return reject(e);
    }
  });
}

const postFetchForImg = async (requestUrl, file) => {
  const formDate = new FormData
  formDate.append('blob',file)

  const requestOptions = {
    method: "POST",
    body: formDate,
  };

  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`${RequestManagerAPIURL}/${requestUrl}`, requestOptions);

      if (!response.ok) {
        throw await response.json();
      }

      return resolve(response.json());
    } catch (e) {
      return reject(e);
    }
  });
}

const deleteFetch = async (requestUrl) => {
  const requestOptions = {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  };

  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`${RequestManagerAPIURL}/${requestUrl}`, requestOptions);

      if (!response.ok) {
        throw await response.json();
      }

      return resolve(response);
    } catch (e) {
      return reject(e);
    }
  });
}

const putFetch = async (requestUrl, data) => {
  const requestOptions = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  };

  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`${RequestManagerAPIURL}/${requestUrl}`, requestOptions);

      if (!response.ok) {
        throw await response.json();
      }

      return resolve(response.json());
    } catch (e) {
      return reject(e);
    }
  });
}

export {
  getFetch,
  postFetch,
  postFetchForImg,
  deleteFetch,
  putFetch,
  getFetchForGif
}
