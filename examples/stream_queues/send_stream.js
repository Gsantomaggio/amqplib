#!/usr/bin/env node

const amqp = require('amqplib')

const sendStream = async () => {
    try {
        const conn = await amqp.connect()
        const ch = await conn.createChannel()
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
        })
        const msg = 'Hello World!';
        // send the message to the stream queue
        ch.sendToQueue(q, Buffer.from(msg));
        console.log(" [x] Sent '%s'", msg);
        await ch.close();
    } catch (e) {
        console.error(e)
    } finally {
        await conn.close()
    }
}