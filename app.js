'use strict';

import KafkaWebsocketProxy from './lib/KafkaWebsocketProxy.js';

console.log('Starting Web Socket Server');

const proxy = new KafkaWebsocketProxy({
  kafkaUrl: process.env.KAFKA_URL || 'localhost:9092',
  kafkaGroupId: process.env.KAFKA_GROUP_ID || 'websocket-proxy-group',
  proxyPort: process.env.PROXY_PORT || 8078
});

proxy.listen();

console.log('Started Web Socket Server');