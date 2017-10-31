const express = require('express');
const bodyParser = require('body-parser');

const user = require('./src/user');

const app = express();
app.use(bodyParser.json());
app.use('/user', user);

app.listen(9093,function(){
  console.log('Node app start at port 9093')
});

module.exports = app;
