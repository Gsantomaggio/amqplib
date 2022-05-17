#!/usr/bin/env node

const amqp = require('amqplib');

async function receiveStream() {

    const conn = await amqp.connect('amqp://localhost');
    process.once('SIGINT', () => { conn.close(); });

    const ch = await conn.createChannel();

    const q = 'my_first_stream';

    // Define the queue stream
    // Mandatory: exclusive: false, durable: true  autoDelete: false
    await ch.assertQueue(q, {
        exclusive: false,
        durable: true,
        autoDelete: false,
        arguments: {
            'x-queue-type': 'stream', // Mandatory to define stream queue
            'x-max-length-bytes': 2_000_000_000 // Set the queue retention to 2GB else the stream doesn't have any limit
        }
    });

    ch.qos(100); // this is mandatory

    ch.consume(q, (msg) => {
        console.log(" [x] Received '%s'", msg.content.toString());
        ch.ack(msg); // mandatory
    }, {
        noAck: false,
        arguments: {
            'x-stream-offset': 'first' // here you can specify the offset: : first, last, next, and timestamp
            // with first start consuming always from the beginning
        }
    });

    console.log(' [*] Waiting for messages. To exit press CTRL+C');
}

receiveStream().catch(console.warn);