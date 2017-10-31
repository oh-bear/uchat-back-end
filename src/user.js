const express = require('express');
const router = express.Router();

const utils = require('utility');
const model = require('./model');
const User = model.getModel('user');
const _filter = {'password': 0, '__v': 0};

router.get('/list', function (req, res) {
  User.find({}, function (err, doc) {
    return res.json(doc)
  })
});

router.post('/register', function (req, res) {
  const {account, password} = req.body;
  User.findOne({account}, function (err, doc) {
    if (doc) {
      return res.json({code: 300, msg: '用户名重复'})
    }

    const userModel = new User({account, password: md5Pwd(password)});
    userModel.save(function (e, d) {
      if (e) {
        return res.json({code: 500, msg: '后端出错了'})
      }
      const {account, _id} = d;
      return res.json({code: 0, data: {account, _id}})
    })
  })
});

router.post('/login', function (req, res) {
  const {account, password} = req.body;
  User.findOne({account, password: md5Pwd(password)}, _filter, function (err, doc) {
    if (!doc) {
      return res.json({code: 301, msg: '用户名或者密码错误'})
    }
    return res.json({code: 0, data: doc})
  })
});

function md5Pwd(password) {
  const salt = 'Airing_is_genius_3957x8yza6!@#IUHJh~~';
  return utils.md5(utils.md5(password + salt))
}

module.exports = router;
