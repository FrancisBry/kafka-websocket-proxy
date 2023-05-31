import { WebSocketServer } from "ws";
import Client from "./Client.js";

export default class Server {

  constructor(config) {
    this.config = config;
    this.clients = [];

    this.wss = new WebSocketServer({
      port: this.config.proxyPort
    });

    this.wss.on('connection', async (ws) => {
      console.log('Client opening');
      const clientId = "test-client";

      if (typeof this.clients[clientId] !== 'undefined') {
        await this.clients[clientId].close();
      }

      this.clients[clientId] = new Client(
        ws,
        {
          ...this.config,
          clientId: clientId
        }
      );
      console.log('Client opened');
    });

    this.wss.on('close', () => {
      console.log("Server closing");
      this.clients.forEach(async (client) => {
        await client.close();
      });
      console.log('Server closed');
    });
  }
}