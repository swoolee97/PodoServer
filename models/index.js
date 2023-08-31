const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/Gibu', {
  useNewUrlParser: true,
  useUnifiedTopology: true, // 새로운 연결 관리 엔진을 사용하도록 설정

});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log("We're connected to the database!");
});

const User = require('./User');  // 이 부분은 당신이 사용자 모델을 어떻게 정의하였는지에 따라 달라집니다.
const Gifticon = require('./Gifticon');
const Card = require('./Card')
module.exports = {
  User, Gifticon,Card
  // 다른 모델들 ......
};