const path = require('path')
const fs = require('fs')
const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const app = express()
const port = process.env.PORT || 8098

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: true,
  },
})
app.use('/build', express.static('build'))

app.get('/', function (req, res) {
  const targetContent = fs.readFileSync(path.join(__dirname, '/build/target.js'), 'utf8')
  res.send(targetContent)
})

app.get('/app', function (req, res) {
  const content = fs.readFileSync(path.join(__dirname, 'app.html'), 'utf8')
  res.send(content)
})

// Middleman
io.on('connection', function (socket) {
  // Disconnect any previously connected apps
  socket.emit('vue-devtools-init')
  const { roomId } = socket.handshake.query
  console.log('房间id：', roomId);
  socket.join(roomId)
  socket.on('vue-devtools-init', () => {
    socket.to(roomId).emit('vue-devtools-init')
  })

  socket.on('disconnect', (reason) => {
    if (reason.indexOf('client')) {
      socket.to(roomId).emit('vue-devtools-disconnect-devtools')
    }
    socket.leave(roomId)
  })

  socket.on('vue-message', data => {
    socket.to(roomId).emit('vue-message', data)
  })
})

httpServer.listen(port, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log('listening on 0.0.0.0:' + port)
})
