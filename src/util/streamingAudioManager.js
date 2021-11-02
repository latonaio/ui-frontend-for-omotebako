
const socketUrl = 'ws://localhost:30102/websocket';
export class StreamingAudioManager {
  constructor(delay_sec) {
    this.ws = null;
    this.ctx = null;
    this.gainNode = 0;
    this.initial_delay_sec = delay_sec;
    this.scheduled_time = 0;
  }

  playChunk(audio_src, scheduled_time) {
    if (audio_src.start) {
      audio_src.start(scheduled_time);
    } else {
      audio_src.noteOn(scheduled_time);
    }
  }

  playAudioStream(audio_i16) {
    let length = audio_i16.length;
    let audio_buf = this.ctx.createBuffer(2, length, 88200);
    let audio_src = this.ctx.createBufferSource();
    let current_time = this.ctx.currentTime;

    for (let channel = 0; channel < 2; ++channel) {
      let channelBuffer = audio_buf.getChannelData(channel);
      for (let i = 0; i < length; ++i) {
        channelBuffer[i] = audio_i16[i] / 32767
      }
    }

    audio_src.buffer = audio_buf;
    audio_src.connect(this.ctx.destination);

    if (current_time < this.scheduled_time) {
      this.playChunk(audio_src, this.scheduled_time);
      this.scheduled_time += audio_buf.duration;
    } else {
      this.playChunk(audio_src, current_time);
      this.scheduled_time = current_time + audio_buf.duration + this.initial_delay_sec;
    }
  }

  connectStreamingAudio(
    keep_connection_opening=false,
    target=socketUrl,
    type=""
  ) {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(target);
      console.log("established connection websocket")
      this.ctx = new (window.AudioContext || window.webkitAudioContext);
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 0.1;
      this.ws.binaryType = 'arraybuffer';
      this.type = type;

      this.ws.onopen = () => {
        console.log('open');
        if (this.type !== "") {
          this.ws.send("start_connection_" + this.type)
        }
        return resolve();
      };

      this.ws.onerror = (e) => {
        console.log(e);
      };

      this.ws.onclose = () => {
        console.log('closed');
      };

      this.ws.onmessage = (evt) => {
        if (evt.data.constructor === ArrayBuffer) {
          console.log('onmessage');
          this.playAudioStream(new Int16Array(evt.data));
        } else {
          // 再生が終わったらwebsocketをクローズする
          if (!keep_connection_opening && evt.data === 'EOS') {
            this.cnt++;
            console.log(this.cnt);
            if (this.cnt === this.music_count) {
              console.log(evt.data);
              this.ws.close();
            }
          }
        }
      };
    });
  }

  async playStreamingAudio(audioKeys) {
    this.music_count = audioKeys.length;
    this.cnt = 0;
    for (let key of audioKeys) {
      if (this.ws && (this.ws.readyState !== 0 && this.ws.readyState !== 1)) {
        console.log('playStreamingAudio readyState is not connecting');
        await this.connectStreamingAudio();
        this.ws.send(key);
      }

      if (this.ws) {
        console.log('playStreamingAudio exist ws');
        this.ws.send(key);
      }

      if (!this.ws) {
        console.log('playStreamingAudio not exist ws');
        await this.connectStreamingAudio();
        this.ws.send(key);
      }
    }
  }

  reconnect() {
    console.log('reconnect execute');
  }

  closeConn() {
    console.log("close connection websocket")
    if (this.type !== "") {
      this.ws.send("close_connection_" + this.type)
    }
    this.ws.close()
  }
}

// const streamingAudioManager = new StreamingAudioManager();

// module.exports = {
//   StreamingAudioManager
// }

export const playStreamingAudio = async (audioKeys, delay_sec=0) => {
  let streamingAudioManager = new StreamingAudioManager(delay_sec);
  await streamingAudioManager.connectStreamingAudio();
  await streamingAudioManager.playStreamingAudio(audioKeys);
}
