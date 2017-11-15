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
    'avatar': {'type': String},
    'desc': {'type': String},
    'gender': {'type': Number}
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
    'createAt': {'type': Number, 'default': Date.now},
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