#!/usr/bin/env node

const amqp = require('amqplib');


async function sendStream () { //=======================================================================================

    try {
        const conn = await amqp.connect('amqp://localhost');
        const ch = await conn.createChannel();
        const q = 'my_first_stream';
        const msg = 'Hello World!';

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

        // Send the message to the stream queue
        await ch.sendToQueue(q, Buffer.from(msg));
        console.log(" [x] Sent '%s'", msg);
        await ch.close();

        // Close connection
        conn.close();
    }
    // Catch and display any errors in the console
    catch(e) { console.log(e) }
}
//======================================================================================================================


module.exports = {
    sendStream
}

// To test call the function: sendStream()