const utils = require('utility')

const KEY = 'airing_is_good#20171101@ursb.me'

function md5Pwd(password) {
  const salt = 'Airing_is_genius_3957x8yza6!@#IUHJh~~'
  return utils.md5(utils.md5(password + salt))
}

function checkToken(uid, timestamp, token) {
  if(uid && timestamp && token) {
    return token === md5Pwd(uid.toString() + timestamp.toString() + KEY)
  }
  return false
}

module.exports = {
  KEY,
  md5Pwd,
  checkToken
}