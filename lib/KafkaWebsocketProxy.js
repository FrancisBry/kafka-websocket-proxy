import Server from './Server.js';

export default class KafkaWebsocketProxy {

  constructor(config) {
    this.config = config;
  };

  listen() {
    if (typeof this.wss !== 'undefined') {
      throw 'web socket server already active';
    }

    this.wss = new Server(this.config);
  }
};