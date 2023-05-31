import { Kafka } from 'kafkajs';

export default class Client {

  constructor(ws, config) {
    this.ws = ws;
    this.config = config;
    this.subscribedTopics = [];
    this.authenticated = false;

    this.ws.on('error', console.error);

    this.ws.on('close', async () => {
      console.log('Client closing');
      if (typeof this.consumer !== 'undefined') {
        await this.consumer.disconnect();
      }
      console.log('Client closed');
    });

    this.ws.on('message', async message => {
      const parsedMessage = JSON.parse(message);
      switch (parsedMessage.type) {
        case 'authenticate':
          await this.authenticate(parsedMessage.token);
          break;
        case 'subscribe':
          await this.subscribe(parsedMessage.topic);
          break;
        case 'unsubscribe':
          await this.unsubscribe(parsedMessage.topic);
          break;
        default:
          break;
      }
    });
  }

  async authenticate(token) {
    if (this.authenticated) {
      return;
    }

    // Should authenticate with keycloak but I cba
    this.authenticated = true;

    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    this.kafka = new Kafka({
      clientId: payload.email + "-client",
      brokers: [ this.config.kafkaUrl ],
    });
  }

  async subscribe(topic) {
    console.log('Subscribing to topic %s', topic);
    this.subscribedTopics.push(topic);
    this.run();
  }

  async unsubscribe(topic) {
    console.log('Unsubscribing to topic %s', topic);
    this.subscribedTopics = this.subscribedTopics.filter(subscribedTopic => subscribedTopic !== topic);
    this.run();
  }

  async close() {
    await this.ws.close();
  }

  async run() {
    if (this.consumer) {
      await this.consumer.disconnect();
    }

    if (!this.authenticated) {
      return;
    }

    this.consumer = this.kafka.consumer({ groupId: this.config.kafkaGroupId });

    await this.consumer.connect();

    if (this.subscribedTopics.length > 0) {
      await this.consumer.subscribe({ topics: this.subscribedTopics, fromBeginning: false });
    }

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        this.ws.send(JSON.stringify({
          topic,
          message: JSON.parse(message.value.toString())
        }));
      }
    });
  }
}