import { Kafka } from 'kafkajs';

const username = process.env.KAFKA_USERNAME as string;
const password = process.env.KAFKA_PASSWORD as string;

const kafka = new Kafka({
  brokers: ['tops-monkfish-9913-eu1-kafka.upstash.io:9092'],
  sasl: {
    mechanism: 'scram-sha-256',
    username,
    password,
  },
  ssl: true,
});

export { kafka };
