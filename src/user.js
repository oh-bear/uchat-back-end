const express = require('express')
const router = express.Router()

const {KEY, MESSAGE, checkToken, md5Pwd} = require('./util')

const model = require('./model')
const User = model.getModel('user')
const Chat = model.getModel('chat')

const _filter = {'password': 0, '__v': 0}

router.get('/list', function (req, res) {
  User.find({}, function (err, doc) {
    return res.json(doc)
  })
})

router.post('/register', function (req, res) {
  const {account, password} = req.body
  User.findOne({account}, function (err, doc) {
    if (!err) {
      if (doc) {
        return res.json({code: 300, msg: MESSAGE.USER_ALREADY_EXIST})
      }

      const userModel = new User({
        account,
        password: md5Pwd(password)
      })
      userModel.save(function (e, d) {
        if (e) {
          return res.json({code: 505, msg: MESSAGE.SERVER_ERROR})
        }
        const {account, _id} = d
        return res.json({code: 0, data: {account, _id}})
      })
    }
  })
})

router.post('/login', function (req, res) {
  const {account, password} = req.body
  User.findOne({account, password: md5Pwd(password)}, _filter, function (err, doc) {
    if (!doc) {
      return res.json({code: 301, msg: MESSAGE.PASSWORD_ERROR})
    }
    const timestamp = new Date().getTime()
    const token = md5Pwd((doc._id).toString() + timestamp.toString() + KEY)
    return res.json({code: 0, data: Object.assign({doc}, {uid: doc._id, timestamp, token})})
  })
})

router.get('/detail/:id', function (req, res) {
  const {token, uid, timestamp} = req.query
  const {id} = req.params
  if (!checkToken(uid, timestamp, token))
    return res.json({code: 500, msg: MESSAGE.TOKEN_ERROR})
  User.findOne({_id: id}, _filter, function (err, doc) {
    if (!doc) {
      return res.json({code: 400, msg: MESSAGE.USER_NOT_EXIST})
    }
    return res.json({code: 0, data: doc})
  })
})

module.exports = router
