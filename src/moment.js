const express = require('express')
const router = express.Router()

const {MESSAGE, checkToken} = require('./util')

const model = require('./model')
const User = model.getModel('user')
const Chat = model.getModel('chat')
const Moment = model.getModel('moment')

const _filter = {'password': 0, '__v': 0}

const env = process.env.NODE_ENV || 'production'

ronter.post('/publish/:id', function (req, res) {
  const {id} = req.params
  const {token, uid, timestamp, type, geo, content, image, voice, video} = req.body

  if (id !== uid)
    return res.json({code: 500, msg: MESSAGE.UID_ERROR})

  if (!checkToken(uid, timestamp, token))
    return res.json({code: 500, msg: MESSAGE.TOKEN_ERROR})

  Moment.create({
    user_id: id, type, content, image, voice, video, geo,
    create_time: Date.now()
  }, function (err, doc) {
    if (!err) return res.json({code: 0})
  })
})

router.get('/playground', function (req, res) {
  const {token, uid, timestamp} = req.query

  if (!checkToken(uid, timestamp, token))
    return res.json({code: 500, msg: MESSAGE.TOKEN_ERROR})

  Moment.find({}, function (err, doc) {

  })
})

router.get('/list/:id', function (req, res) {
  const {id} = req.params
  const {token, uid, timestamp} = req.query

  if(id !== uid)
    return res.json({code: 500, msg: MESSAGE.UID_ERROR})

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