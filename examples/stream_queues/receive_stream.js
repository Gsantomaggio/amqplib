#!/usr/bin/env node

const amqp = require('amqplib');

amqp.connect('amqp://localhost').then(conn => {
    process.once('SIGINT', () => { conn.close(); });

    conn.createChannel().then(ch => {

        const q = 'my_first_stream';
        // Define the queue stream
        // Mandatory: exclusive: false, durable: true  autoDelete: false
        let ok = ch.assertQueue(q, {
            exclusive: false,
            durable: true,
            autoDelete: false,
            arguments: {
                'x-queue-type': 'stream', // Mandatory to define stream queue
                'x-max-length-bytes': 2_000_000_000 // Set the queue retention to 2GB else the stream doesn't have any limit
            }
        })

        ch.qos(100); // this is mandatory

        ok = ok.then(_qok => {

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
        });

        ok.then(_consumeOk => {
            console.log(' [*] Waiting for messages. To exit press CTRL+C');
        });
    });

}).catch(console.warn);