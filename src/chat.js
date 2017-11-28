const express = require('express')
const router = express.Router()

const {MESSAGE, checkToken} = require('./util')

const model = require('./model')
const User = model.getModel('user')
const Chat = model.getModel('chat')

const _filter = {'password': 0, '__v': 0}

const env = process.env.NODE_ENV || 'production'

/**
 * 获取用户聊天联系人列表接口
 *
 * GET 方法调用，前端请求获取用户聊天联系人列表。
 * 如在开发环境下，则获取全部用户数据，以便测试。
 * 需要返回用户数据列表，及其对应的最后一条聊天记录数据与时间。
 *
 * @param   {string}  id          用户id，于params中，其余在query中
 * @param   {string}  uid         用户id（密钥用）
 * @param   {number}  timestamp   用户登录时间戳（密钥用）
 * @param   {string}  token       用户登录TOKEN（密钥用）
 * @return  {object}  {code, msg, data, docs}
 *
 * @date     2017-11-27
 * @author   Airing<airing@ursb.me>
 */
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

/**
 * 获取用户同某人的聊天记录接口
 *
 * GET 方法调用，前端请求获取用户同某人的聊天记录。
 *
 * @param   {string}  from        用户id
 * @param   {string}  to          聊天对象用户id
 * @param   {string}  uid         用户id（密钥用）
 * @param   {number}  timestamp   用户登录时间戳（密钥用）
 * @param   {string}  token       用户登录TOKEN（密钥用）
 * @return  {object}  {code, msg, data}
 *
 * @date     2017-11-27
 * @author   Airing<airing@ursb.me>
 */
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

/**
 * 清空 chat 数据接口
 *
 * GET 方法调用，用于删除所有聊天记录。
 * TODO：目前仅在开发环境下调用
 *
 * @return  {object}  {doc}
 *
 * @date     2017-11-27
 * @author   Airing<airing@ursb.me>
 */
router.get('/remove', function (req, res) {
  if (env === 'development') {
    Chat.remove({}, function (err, doc) {
      return res.json(doc)
    })
  }
})

module.exports = router