const express = require('express')
const bodyParser = require('body-parser')

const user = require('./src/user')

const app = express()

const server = require('http').Server(app)
const io = require('socket.io')(server)

io.on('connection', function (socket) {
  console.log('connection')
  socket.on('sendmsg', function (data) {
    console.log(data)
    io.emit('recvmsg', data)
  })
})

app.use(bodyParser.json())
app.use('/user', user)

server.listen(9093,function(){
  console.log('Node app start at port 9093')
})

module.exports = app
