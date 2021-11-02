const path = require('path');
const dotenv = require('dotenv');
const env = dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});

const baseAPI = env.parsed.REACT_APP_API;

const {
  RequestManagerAPIURL
} = {
  RequestRedisManagerAPIURL: `http://${baseAPI}:30055/omotebako`,
  StreamingAudioManagerAPIURL: `ws://${baseAPI}:30102/websocket`,
  RequestManagerGifAPIURL: `http://${baseAPI}:30101/gif`,
  RequestManagerAPIURL: `http://${baseAPI}:30080/api`,
  RequestStaticAPIURL: `http://${baseAPI}:30101/static`,

  ReactAppAPIURL: `http://${baseAPI}:30080/api/`,
  ReactImagePath: `http://${baseAPI}:30080/`,
  ReactWebSocketAPIURL: `ws://${baseAPI}:30099/`
}

const fetch = require('node-fetch');
const FormData = require("form-data");

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

const postFetchForImg = async (requestUrl, imageFileBinary) => {
  let formData = new FormData
  formData.append('blob', imageFileBinary);

  const requestOptions = {
    method: "POST",
    body: formData,
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

const sleep = (delay) => {
  return new Promise((resolve, reject) => {
    return setTimeout(() => {
      return resolve();
    }, delay ? delay : 1000);
  });
}
module.exports.getFetch = getFetch;
module.exports.postFetch = postFetch;
module.exports.deleteFetch = deleteFetch;
module.exports.putFetch = putFetch;
module.exports.postFetchForImg = postFetchForImg;
module.exports.sleep = sleep;

