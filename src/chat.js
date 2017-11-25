const express = require('express')
const router = express.Router()

const {MESSAGE, checkToken} = require('./util')

const model = require('./model')
const User = model.getModel('user')
const Chat = model.getModel('chat')

const _filter = {'password': 0, '__v': 0}

const env = process.env.NODE_ENV || 'production'

router.get('/list/:id', function (req, res) {
  const {id} = req.params
  const {token, uid, timestamp} = req.query

  if (id !== uid)
    return res.json({code: 502, msg: MESSAGE.UID_ERROR})

  if (!checkToken(uid, timestamp, token))
    return res.json({code: 500, msg: MESSAGE.TOKEN_ERROR})

  Chat.find({'$or': [{from: id}, {to: id}]}, function (err, doc) {

    if (err) return res.json({code: 505, msg: MESSAGE.SERVER_ERROR})

    let docs = {}
    doc.forEach(v => {
      docs[v.chat_id] = {last_time: v.create_time, last_content: v.text}
    })

    if (env === 'production') {
      const user_ids = doc.map((item, index) => {
        return item.to
      })
      User.find({_id: user_ids}, _filter, function (err, users) {
        if (err) return res.json({code: 505, msg: MESSAGE.SERVER_ERROR})
        return res.json({code: 0, data: users, docs})
      })
    } else {
      // 开发环境下：获取全部用户数据，以便测试
      User.find({}, _filter, function (err, users) {
        if (err) return res.json({code: 505, msg: MESSAGE.SERVER_ERROR})
        return res.json({code: 0, data: users, docs})
      })
    }
  })
})

router.get('/record', function (req, res) {
  const {token, uid, timestamp, from, to} = req.query

  if (!checkToken(uid, timestamp, token))
    return res.json({code: 500, msg: MESSAGE.TOKEN_ERROR})

  Chat.find({chat_id: [from, to].sort().join('_')})
    .sort('-createdAt')
    .exec(function (err, doc) {
      if (err) return res.json({code: 505, msg: MESSAGE.SERVER_ERROR})
      return res.json({code: 0, data: doc})
    })
})

router.get('/remove', function (req, res) {
  if (env === 'development') {
    Chat.remove({}, function (err, doc) {
      return res.json(doc)
    })
  }
})

module.exports = router