const baseAPI = (() => {
  if (process.env.REACT_APP_ENV === 'development') {
    return process.env.REACT_APP_API;
  }

  return 'localhost';
})()

const config = {
  RequestRedisManagerAPIURL: `http://${baseAPI}:30055/omotebako`,
  StreamingAudioManagerAPIURL: `ws://${baseAPI}:30102/websocket`,
  RequestManagerGifAPIURL: `http://${baseAPI}:30101/gif`,
  RequestManagerAPIURL: `http://${baseAPI}:30080/api`,
  RequestStaticAPIURL: `http://${baseAPI}:30101/static`,

  ReactAppAPIURL: `http://${baseAPI}:30080/api/`,
  ReactImagePath: `http://${baseAPI}:30080/`,
  ReactWebSocketAPIURL: `ws://${baseAPI}:30099/`,
  KeepListeningSocketUrl: `ws://${baseAPI}:30102/websocket_keep_listening`
}

export default config

