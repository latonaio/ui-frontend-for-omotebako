import { io } from 'socket.io-client';

class RequestRedisManager {
  constructor(socketUrl) {
    this.io = io.connect(socketUrl);
    // this.io.emit('initialize', '');
  }

  edit(emitData) {
    try {
      this.io.emit('edit', JSON.stringify({
        ...emitData
      }))
    } catch (e) {
      console.log(e);
    }
  }

  emitGet() {
    return new Promise((resolve, reject) => {
      try {
        this.io.emit('get', data => {
          return resolve(data);
        });
      } catch (e) {
        return reject(e);
      }
    });
  }
}

export default RequestRedisManager;
