const express = require('express')
const router = express.Router()

const {KEY, MESSAGE, checkToken, md5Pwd} = require('./util')

const model = require('./model')
const User = model.getModel('user')
const Chat = model.getModel('chat')

const _filter = {'password': 0, '__v': 0}

const env = process.env.NODE_ENV || 'production'

/**
 * 获取所有用户接口
 *
 * GET 方法调用，用于获取所有用户接口。
 * TODO：目前仅在开发环境下调用
 *
 * @return  {object}  {doc}
 *
 * @date     2017-11-27
 * @author   Airing<airing@ursb.me>
 */
router.get('/list', function (req, res) {
  if (env === 'development') {
    User.find({}, function (err, doc) {
      return res.json(doc)
    })
  }
})

/**
 * 用户注册接口
 *
 * POST 方法调用，前端请求注册用户。
 * 需要对用户是否注册进行判断，对用户密码进行特殊方法加密，同时生成注册时间戳，存进数据库中。
 *
 *
 * TODO: 验证码验证
 *
 * @param   {string}  account     用户账户（手机号）
 * @param   {string}  password    用户密码
 * @return  {object}  {code, msg}
 *
 * @date     2017-11-27
 * @author   Airing<airing@ursb.me>
 */
router.post('/register', function (req, res) {
  const {account, password} = req.body
  User.findOne({account}, function (err, doc) {
    if (!err) {
      if (doc) {
        return res.json({code: 300, msg: MESSAGE.USER_ALREADY_EXIST})
      }

      const userModel = new User({
        account,
        password: md5Pwd(password),
        create_time: Date.now
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

/**
 * 用户登录接口
 *
 * POST 方法调用，用于前端请求用户登录，返回用户数据与密钥。
 *
 * @param   {string}  account     用户账户（手机号）
 * @param   {string}  password    用户密码
 * @return  {object}  {code, msg, uid, timestamp, token}
 *
 * @date     2017-11-27
 * @author   Airing<airing@ursb.me>
 */
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

/**
 * 获取用户详情接口
 *
 * GET 方法调用，前端请求获取某个用户的详细数据。
 *
 * @param   {string}  id          用户id，于params中，其余在query中
 * @param   {string}  uid         用户id（密钥用）
 * @param   {number}  timestamp   用户登录时间戳（密钥用）
 * @param   {string}  token       用户登录TOKEN（密钥用）
 * @return  {object}  {code, msg}
 *
 * @date     2017-11-27
 * @author   Airing<airing@ursb.me>
 */
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
