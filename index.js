#!/usr/bin/env node
const WebSocket = require('ws')
const port = process.env.PORT || 9090
const uuid = require('uuid/v1')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const wss = new WebSocket.Server({
  perMessageDeflate: false,
  port
}, onListening)

// print ascii art
var artFile = path.join(__dirname, './ascii-art.txt')
var art = fs.readFileSync(artFile, 'utf8')
console.log(art)

function onListening () {
  log(chalk.bold(`LISTENING on PORT ${chalk.white(port)}`))
}

function log () {
  const ts = (new Date()).toISOString()
  console.log(`${chalk.dim(ts)}:`, ...arguments)
}

function broadcast (ws, message) {
  wss.clients.forEach((client) => {
    if (client === ws) return
    if (client.readyState !== WebSocket.OPEN) return
    client.send(message, (error) => {}) // eslint-disable-line
  })
}

function send (ws, message) {
  const data = JSON.stringify(message)
  if (ws.readyState !== WebSocket.OPEN) return
  ws.send(data, (error) => {}) // eslint-disable-line
}

wss.on('connection', (ws) => {
  const host = ws.upgradeReq.headers.host
  const id = uuid()
  log(`NEW client: ID: ${chalk.white(id)} @${chalk.blue(host)}`)

  // Send UUID to client.
  send(ws, {type: 'uuid', data: id})

  ws.on('message', (message) => {
    broadcast(ws, message)
    log(`MSG from ${host}`, chalk.gray(message))
  })

  ws.on('close', (ws) => {
    log('client DISCONNECTED')
    const message = JSON.stringify({
      type: 'disconnect',
      message: 'cya'
    })
    broadcast(ws, message)
  })
})
