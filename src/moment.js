const express = require('express')
const router = express.Router()

const {MESSAGE, checkToken} = require('./util')

const model = require('./model')
const User = model.getModel('user')
const Chat = model.getModel('chat')
const Moment = model.getModel('moment')

const _filter = {'password': 0, '__v': 0}

const env = process.env.NODE_ENV || 'production'

router.get('/playground', function (req, res) {
  const {token, uid, timestamp} = req.query
  if (checkToken(uid, timestamp, token)) {
    Moment.find({}, function (err, doc) {

    })
  } else return res.json({code: 500, msg: MESSAGE.TOKEN_ERROR})
})

router.get('/list/:id', function (req, res) {
  const {id} = req.params
  const {token, uid, timestamp} = req.query
  if (!checkToken(uid, timestamp, token))
    return res.json({code: 500, msg: MESSAGE.TOKEN_ERROR})
  Moment.find({user_id: id}, function (err, doc) {
    if (err) return res.json({code: 505, msg: MESSAGE.SERVER_ERROR})
    return res.json({code: 0, data: doc})
  })

})

router.get('/remove', function (req, res) {
  if (env === 'development') {
    Moment.remove({}, function (err, doc) {
      return res.json(doc)
    })
  }
})

module.exports = router