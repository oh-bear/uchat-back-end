const express = require('express')
const bodyParser = require('body-parser')

const user = require('./src/user')
const chat = require('./src/chat')
const app = express()

const server = require('http').Server(app)
const io = require('socket.io')(server)

const model = require('./src/model')
const Chat = model.getModel('chat')

io.on('connection', function (socket) {
  console.log('connection')
  socket.on('sendmsg', function (d) {
    console.log(d)
    const {data} = d
    const {text, user, _id, t_user, createdAt} = data
    const chat_id = [user._id, t_user._id].sort().join('_')
    Chat.create({
      _id,
      chat_id,
      from: user._id,
      to: t_user._id,
      text, createdAt,
      create_time: Date.now
    }, function () {
      io.emit('recvmsg', d)
    })
  })
})

app.use(bodyParser.json())
app.use('/user', user)
app.use('/chat', chat)

server.listen(9093, function () {
  console.log('Node app start at port 9093')
})

module.exports = app
