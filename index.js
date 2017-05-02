#!/usr/bin/env node
const WebSocket = require('ws')
const port = 9090
const wss = new WebSocket.Server({
  perMessageDeflate: false,
  port
}, onListening)
const clients = []

function onListening () {
  log(`LISTENING on PORT ${port}`)
}

function log () {
  console.log('[ WEBSOCKET-BROADCAST ]-->', ...arguments)
}

function broadcast (ws, message) {
  clients.map((client) => {
    if (client === ws) return
    client.send(message, (error) => {})
  })
}

wss.on('connection', (ws) => {
  const host = ws.upgradeReq.headers.host
  log('client connected:', host)
  clients.push(ws)

  ws.on('message', (message) => {
    log(`BROADCAST message from ${host}`, message)
    broadcast(ws, message)
  })
})
