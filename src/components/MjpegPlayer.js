import React from 'react';
import JSMpeg from '@cycjimmy/jsmpeg-player';
import config from '../util/config';

const WEB_SOCKET_URL = config.ReactWebSocketAPIURL;

// const baseUrl = process.env.REACT_APP_REMOTE_DEVICE_RTSP_URL;
// const wsUrl = process.env.REACT_APP_WS_URL;

class MJpegPlayer extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.msjpeg = null;
    this.port = 31001;

    this.els = {
      videoWrapper: null,
    };
  }

  componentDidMount() {
    this.msjpeg = new JSMpeg.VideoElement(
      this.els.videoWrapper,
      WEB_SOCKET_URL,
      {
        autoplay: true,
      },
      {
        preserveDrawingBuffer: true
      },
    );
    this.props.setPlayer(this.msjpeg);
  }

  componentWillUnmount() {
    if (this.msjpeg !== undefined && this.msjpeg !== null) {
      this.msjpeg.destroy();
    }
  }

  render() {
    return <div
      id="videoCanvas"
      name="blob"
      style={{
        width: "1670px",
        height: "920px",
        position: 'absolute',
        top: 160,
        left: 250,
        zIndex: -1
      }}
      ref={videoWrapper => this.els.videoWrapper = videoWrapper}
    />;
  }
}

export default MJpegPlayer;
