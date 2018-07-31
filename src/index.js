#!/usr/bin/env node
const WebSocket = require('ws')
const uuid = require('uuid/v1')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const clear = require('clear')
const cursor = require('cli-cursor')
const printii = require('printii')(__dirname)
const args = require('minimist')(process.argv.slice(2))
const keyReader = require('./key-reader')
const port = process.env.PORT || args.port || args.p || 3333
const verbose = !args.nolog
const identify = !args.noid

clear()
printii()
cursor.hide()
try {
  keyReader.start()
} catch(e) {
  console.log('Key reader failed:', e.message || 'Sorry.')
}

// Create websocket server.
const wss = new WebSocket.Server({ port }, onListening)

wss.on('connection', (ws) => {
  log(`Total clients: ${chalk.white(wss.clients.size)}`)

  if (identify) {
    const host = ws.upgradeReq.headers.host
    const id = uuid()
    if (verbose) log(`NEW client: ID: ${chalk.white(id)} @${chalk.blue(host)}`)

    // Send UUID to client.
    send(ws, {type: 'uuid', data: id})

    ws.on('close', (ws) => {
      if (verbose) log('client DISCONNECTED')
      const message = JSON.stringify({
        type: 'disconnect',
        message: 'cya'
      })
      broadcast(ws, message)
    })
  }

  if (!verbose) return
  ws.on('message', (message) => {
    log(`MSG from ${host}`, chalk.gray(message))
  })
})

//------------------------------------------------------------------------------

function onListening () {
  const noidMsg = identify? '' : ` --${chalk.white('noid')}`
  const nologMsg = verbose? '' : ` --${chalk.white('nolog')}`
  console.log(chalk.yellow(`LISTENING on PORT ${chalk.white(port)}${noidMsg}${nologMsg}`))
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

function log () {
  // Single line basic info.
  if (!verbose) {
    const message = Array.prototype.join.call(arguments, ' ')
    try {
      process.stdout.clearLine()
    } catch(e) {}
    process.stdout.write(`\r${message}\r`)
    return
  }

  const ts = (new Date()).toISOString()
  console.log(`${chalk.dim(ts)}:`, ...arguments)
}
