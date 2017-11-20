const mongoose = require('mongoose')
const DB_URL = 'mongodb://localhost:27017/uchat'

mongoose.connect(DB_URL, {
  useMongoClient: true
})

const models = {
  user: {
    'account': {'type': String, 'require': true},
    'password': {'type': String, 'require': true},
    'name': {'type': String, 'require': true, 'default': '小明'},
    'place': {'type': String},
    'avatar': {'type': String, 'default': 'http://airing.ursb.me/image/avatar/40.png'},
    'desc': {'type': String},
    'gender': {'type': Number},
    'create_time': {'type': Number}
  },
  chat: {
    '_id': {'type': String, 'require': true},
    'chat_id': {'type': String, 'require': true},
    'from': {'type': String, 'require': true},
    'to': {'type': String, 'require': true},
    'user': {'type': Object, 'require': true},
    'read': {'type': String, 'require': true, 'default': false},
    'text': {'type': String, 'default': ''},
    'image': {'type': String, 'default': ''},
    'createdAt': {'type': Date},  // 配合前端库的数据格式需要
    'create_time': {'type': Number}
  },
  moment: {
    'user_id': {'type': String, 'require': true},
    // 1：图文，2：语音，3：视频
    'type': {'type': Number, 'require': true, 'default': 1},
    'content': {'type': String, 'default': ''},
    'image': {'type': String, 'default': ''},
    'voice': {'type': String, 'default': ''},
    'video': {'type': String, 'default': ''},
    'geo': {'type': String, 'default': ''},
    'top': {'type': Boolean, 'default': false},
    'create_time': {'type': Number}
  }
}

for (let m in models) {
  mongoose.model(m, new mongoose.Schema(models[m]))
}

module.exports = {
  getModel: function (name) {
    return mongoose.model(name)
  }
}