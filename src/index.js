#!/usr/bin/env node
const WebSocket = require('ws')
const uuid = require('uuid/v1')
const chalk = require('chalk')
const clear = require('clear')
const cursor = require('cli-cursor')
const printii = require('printii')(__dirname)
const args = require('minimist')(process.argv.slice(2))
const port = process.env.PORT || args.port || args.p || 3333
const verbose = !args.nolog
const identify = !args.noid

clear()
printii()
cursor.hide()

// Create websocket server.
const wss = new WebSocket.Server({ port }, onListening)

// Will map clients to channels based on the URL path.
const channels = {}

wss.on('connection', (ws) => {
  log(`Total clients: ${chalk.white(wss.clients.size)}`)
  const channelId = ws.upgradeReq.url.substring(1)
  log(`CHANNEL: ${chalk.white(channelId)}`)

  // Add client to channel.
  channels[channelId] = channels[channelId] || []
  channels[channelId].push(ws)

  const host = ws.upgradeReq.headers.host
  if (identify) {
    const id = uuid()
    if (verbose) log(`NEW client: ID: ${chalk.white(id)} @${chalk.blue(host)}`)

    // Send UUID to client.
    send(ws, {type: 'uuid', data: id})

    ws.on('close', (ws) => {
      if (verbose) log(`Client ${id} DISCONNECTED`)
      const message = JSON.stringify({
        type: 'disconnect',
        message: 'cya'
      })
      broadcast({ ws, channelId, message })
    })
  }

  ws.on('message', (message) => {
    if (verbose) log(`MSG from ${host}`, chalk.gray(message))
    broadcast({ ws, channelId, message })
  })
})

//------------------------------------------------------------------------------

function onListening () {
  const noidMsg = identify? '' : ` --${chalk.white('noid')}`
  const nologMsg = verbose? '' : ` --${chalk.white('nolog')}`
  console.log(chalk.yellow(`LISTENING on PORT ${chalk.white(port)}${noidMsg}${nologMsg}`))
}

function broadcast ({ ws, channelId, message }) {
  if (!channels[channelId]) {
    log(`Channel ${channelId} does not exist!`)
    return
  }

  if (!channels[channelId].length) {
    log(`Removed empty channel: ${channelId}`)
    delete channels[channelId]
    return
  }

  channels[channelId].map(client => {
    if (client === ws) return // Skipping message sender.
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

module.exports = {
  onListening,
  broadcast,
  send
}
