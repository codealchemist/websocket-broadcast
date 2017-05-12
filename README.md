# websocket-broadcast
Broadcasts received messages over websockets.

## Install

`npm install -g websocket-broadcast`

## How it works

It opens a websockets connection on port 9090.
Clients connected to this server can broadcast messages between them.
The client who sends a message doesn't receive it back, only the other connected clients get it.

## Client IDs

After each clients connects it will get a 
[UUID V1](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_1_.28date-time_and_MAC_address.29)
from **websocket-broadcast**.
Useful if you need to identify your clients with a unique ID.

UUID will be sent in a message with type `uuid`, something like this:

`{type: 'uuid', data: 'ed8ef0b0-35ff-11e7-8de4-6bd9049b7aa7'}`

## Customize port

To use another port you can start the app like this:

`PORT=8080 websocket-broadcast`
