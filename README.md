# websocket-broadcast
Broadcasts received messages over websockets.

## Install

`npm install -g websocket-broadcast`

## How it works

It opens a websockets connection on port 9090.
Clients connected to this server can broadcast messages between them.
The client who sends a message doesn't receive it back, only the other connected clients get it.

## TODO

Configure port using environment vars.
