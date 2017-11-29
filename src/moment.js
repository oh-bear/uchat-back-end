const express = require('express')
const router = express.Router()

const {MESSAGE, checkToken} = require('./util')

const model = require('./model')
const User = model.getModel('user')
const Chat = model.getModel('chat')
const Moment = model.getModel('moment')
const Like = model.getModel('like')

const _filter = {'password': 0, '__v': 0}

const env = process.env.NODE_ENV || 'production'

/**
 * 发布 moment 接口
 *
 * POST 方法调用，前端请求发布 moment。
 *
 * @param   {string}  id          用户id，于params中，其余在body中
 * @param   {string}  uid         用户id（密钥用）
 * @param   {number}  timestamp   用户登录时间戳（密钥用）
 * @param   {string}  token       用户登录TOKEN（密钥用）
 * @param   {string}  type        moment的类型：1，图文；2，音频；3，视频
 * @param   {string}  geo         用户的地理位置：经纬逗号分隔
 * @param   {string}  content     moment的文本内容
 * @param   {string}  image       moment的图片url，逗号分隔
 * @param   {string}  voice       moment的音频url
 * @param   {string}  video       moment的视频url
 * @return  {object}  {code, msg}
 *
 * @date     2017-11-27
 * @author   Airing<airing@ursb.me>
 */
ronter.post('/publish/:id', function (req, res) {
  const {id} = req.params
  const {token, uid, timestamp, type, geo, content, image, voice, video} = req.body

  if (id !== uid)
    return res.json({code: 502, msg: MESSAGE.UID_ERROR})

  if (!checkToken(uid, timestamp, token))
    return res.json({code: 500, msg: MESSAGE.TOKEN_ERROR})

  Moment.create({
    user_id: id, type, content, image, voice, video, geo,
    create_time: Date.now()
  }, function (err, doc) {
    if (!err) return res.json({code: 0})
  })
})

/**
 * 点赞接口
 *
 * POST 方法调用
 * 如果未点赞，则向like中录入数据，同时将moment的like字段自增1；
 * 否则删除like中的字段，并同时将moment的like字段自增1。
 *
 * @param   {string}  id          用户id，于params中，其余在body中
 * @param   {string}  uid         用户id（密钥用）
 * @param   {number}  timestamp   用户登录时间戳（密钥用）
 * @param   {string}  moment_id   moment的id
 *
 * @date     2017-11-29
 * @author   Airing<airing@ursb.me>
 */
ronter.post('/like/:id', function (req, res) {
  const {id} = req.params
  const {token, uid, timestamp, moment_id} = req.body

  if (id !== uid)
    return res.json({code: 502, msg: MESSAGE.UID_ERROR})

  if (!checkToken(uid, timestamp, token))
    return res.json({code: 500, msg: MESSAGE.TOKEN_ERROR})

  Like.findOne({
    user_id: id,
    moment_id
  }, function (err, doc) {
    if (!err) {
      // 未点过赞
      if (!doc) {
        const likeModel = {
          user_id: id,
          moment_id,
          create_time: Date.now()
        }
        likeModel.save(function (e, d) {
          Moment.update({_id: moment_id}, {
            $inc: {like: 1}
          }, function (e, d) {
            return res.json({code: 0})
          })
        })
      } else {
        // 已经点过赞
        Like.remove({
          user_id: id,
          moment_id
        }, function (e, d) {
          Moment.update({_id: moment_id}, {
            $inc: {like: -1}
          }, function (e, d) {
            return res.json({code: 0})
          })
        })
      }
    }
  })
})


/**
 * 获取 moments 列表接口
 *
 * GET 方法调用，前端请求获取广场首页的内容。
 *
 * @param   {string}  uid         用户id（密钥用）
 * @param   {number}  timestamp   用户登录时间戳（密钥用）
 * @param   {string}  token       用户登录TOKEN（密钥用）
 * @return  {object}  {code, msg}
 *
 * @date     2017-11-27
 * @author   Airing<airing@ursb.me>
 */
router.get('/playground', function (req, res) {
  const {token, uid, timestamp} = req.query

  if (!checkToken(uid, timestamp, token))
    return res.json({code: 500, msg: MESSAGE.TOKEN_ERROR})

  Moment.find({}, function (err, doc) {

  })
})

/**
 * 获取某个用户发布的 moments 接口
 *
 * GET 方法调用，前端请求获取某个用户发布的所有 moments。
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
router.get('/list/:id', function (req, res) {
  const {id} = req.params
  const {token, uid, timestamp} = req.query

  if (id !== uid)
    return res.json({code: 500, msg: MESSAGE.UID_ERROR})

  if (!checkToken(uid, timestamp, token))
    return res.json({code: 500, msg: MESSAGE.TOKEN_ERROR})

  Moment.find({user_id: id}, function (err, doc) {
    if (err) return res.json({code: 505, msg: MESSAGE.SERVER_ERROR})
    return res.json({code: 0, data: doc})
  })

})

/**
 * 清空 moment 数据接口
 *
 * GET 方法调用，用于删除所有 moment。
 * TODO：目前仅在开发环境下调用
 *
 * @return  {object}  {doc}
 *
 * @date     2017-11-27
 * @author   Airing<airing@ursb.me>
 */
router.get('/remove', function (req, res) {
  if (env === 'development') {
    Moment.remove({}, function (err, doc) {
      return res.json(doc)
    })
  }
})

module.exports = router