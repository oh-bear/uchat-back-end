const express = require('express')
const router = express.Router()

const {KEY, checkToken, md5Pwd} = require('./util')

const model = require('./model')
const User = model.getModel('user')
const Chat = model.getModel('chat')

const _filter = {'password': 0, '__v': 0}

router.get('/list/:id', function (req, res) {
  const {id} = req.params
  const {token, uid, timestamp} = req.query
  if (checkToken(uid, timestamp, token)) {
    Chat.find({'$or': [{from: id}, {to: id}]}, function (err, doc) {
      if (!err) {
        const user_ids = doc.map((item, index) => {
          return item.to
        })
        // User.find({_id: user_ids}, function (err, users) {
        //   if (!err) return res.json({code: 0, data: users})
        // })
        // 开发环境特有，测试需要
        User.find({}, function (err, users) {
          if (!err) return res.json({code: 0, data: users})
        })
      }
    })
  } else {
    return res.json({code: 500, msg: '密钥不正确'})
  }
})

router.get('/record', function (req, res) {
  const {token, uid, timestamp, from, to} = req.query
  if (checkToken(uid, timestamp, token)) {
    Chat.find({chat_id: [from, to].sort().join('_')})
      .sort('-createdAt')
      .exec(function (err, doc) {
        if (!err) return res.json({code: 0, data: doc})
      })
  } else {
    return res.json({code: 500, msg: '密钥不正确'})
  }
})

router.get('/remove', function (req, res) {

  Chat.remove({}, function (err, doc) {
    return res.json(doc)
  })
})

module.exports = router