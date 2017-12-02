const utils = require('utility')

const KEY = 'airing_is_good#20171101@ursb.me'

const MESSAGE = {
  SUCCESS: '请求成功', // 0
  USER_ALREADY_EXIST: '用户已被注册', // 300
  PASSWORD_ERROR: '账号密码错误', // 301
  REQUEST_ERROR: '请求时间间隔过短', // 302
  USER_NOT_EXIST: '用户不存在', // 400
  PARAMETER_ERROR: '参数错误', // 404
  TOKEN_ERROR: '密钥不正确', // 500
  CODE_ERROR: '验证码错误', // 501
  UID_ERROR: '伪造密钥嫌疑', // 502
  SERVER_ERROR: '后端出错了', // 505
}

function md5Pwd(password) {
  const salt = 'Airing_is_genius_3957x8yza6!@#IUHJh~~'
  return utils.md5(utils.md5(password + salt))
}

function checkToken(uid, timestamp, token) {
  if (uid && timestamp && token) {
    return token === md5Pwd(uid.toString() + timestamp.toString() + KEY)
  }
  return false
}

module.exports = {
  KEY,
  MESSAGE,
  md5Pwd,
  checkToken
}
