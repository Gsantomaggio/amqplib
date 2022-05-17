#!/usr/bin/env node

const amqp = require('amqplib');

async function sendStream () {

    const conn = await amqp.connect('amqp://localhost');

    const ch = await conn.createChannel();

    const q = 'my_first_stream';

    // Define the queue stream
    // Mandatory: exclusive: false, durable: true  autoDelete: false
    const ok = await ch.assertQueue(q, {
        exclusive: false,
        durable: true,
        autoDelete: false,
        arguments: {
            'x-queue-type': 'stream', // Mandatory to define stream queue
            'x-max-length-bytes': 2_000_000_000 // Set the queue retention to 2GB else the stream doesn't have any limit
        }
    });

    const msg = 'Hello World!';

    // send the message to the stream queue
    const _qok = await ok
    ch.sendToQueue(q, Buffer.from(msg));
    console.log(" [x] Sent '%s'", msg);
    ch.close();

    conn.close();
}

sendStream().catch(console.warn)


// amqp.connect('amqp://localhost').then(conn => {
//
//     conn.createChannel().then(ch => {
//
//         const q = 'my_first_stream';
//
//         // Define the queue stream
//         // Mandatory: exclusive: false, durable: true  autoDelete: false
//         const ok = ch.assertQueue(q, {
//             exclusive: false,
//             durable: true,
//             autoDelete: false,
//             arguments: {
//                 'x-queue-type': 'stream', // Mandatory to define stream queue
//                 'x-max-length-bytes': 2_000_000_000 // Set the queue retention to 2GB else the stream doesn't have any limit
//             }
//         });
//
//         const msg = 'Hello World!';
//
//         // send the message to the stream queue
//         ok.then(_qok => {
//             ch.sendToQueue(q, Buffer.from(msg));
//             console.log(" [x] Sent '%s'", msg);
//             ch.close();
//         });
//
//     }).finally(() => { conn.close(); });
//
// }).catch(console.warn);