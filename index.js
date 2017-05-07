#!/usr/bin/env node
const WebSocket = require('ws')
const port = 9090
const uuid = require('uuid/v1')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const wss = new WebSocket.Server({
  perMessageDeflate: false,
  port
}, onListening)
const clients = []

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
  clients.map((client) => {
    if (client === ws) return
    client.send(message, (error) => {}) // eslint-disable-line
  })
}

function send (ws, message) {
  const data = JSON.stringify(message)
  ws.send(data, (error) => {}) // eslint-disable-line
}

wss.on('connection', (ws) => {
  const host = ws.upgradeReq.headers.host
  const id = uuid()
  log(`NEW client: ID: ${chalk.white(id)} @${chalk.blue(host)}`)
  clients.push(ws)

  // Send UUID to client.
  send(ws, {type: 'uuid', id})

  ws.on('message', (message) => {
    broadcast(ws, message)
    log(`MSG from ${host}`, chalk.gray(message))
  })
})
