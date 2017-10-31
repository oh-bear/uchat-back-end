const mongoose = require('mongoose');
const DB_URL = 'mongodb://localhost:27017/uchat';
mongoose.connect(DB_URL, {
  useMongoClient: true
});

const models = {
  user: {
    'account': {'type': String, 'require': true},
    'password': {'type': String, 'require': true},
    'place': {'type': String},
    'avatar': {'type': String},
    'desc': {'type': String},
    'gender': {'type': Number}
  }
};

for (let m in models) {
  mongoose.model(m, new mongoose.Schema(models[m]))
}

module.exports = {
  getModel: function (name) {
    return mongoose.model(name)
  }
};