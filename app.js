const express = require("express");
const app = express()
// /api/login' 이라는 경로로 들어오는 모든 요청을 './routes/login' 모듈에 위임한다
// 여기서 어떤 경로로 갈 지 다 정의해 놓는다.
app.use('/api/login', require('./routes/login'))
app.use('/api/register', require('./routes/register'))
app.use('/api/mypage', require('./routes/mypage'))
app.use('/api/emailAuth', require('./mailAuth'))

app.use(express.json())

// const mongoose = require('mongoose');
// mongoose
//     .connect(
//         "mongodb://127.0.0.1:27017/Gibu",
//         {
//             useNewUrlParser: true, // 새로운 URL 문자열 파서를 사용하도록 설정
//             useUnifiedTopology: true, // 새로운 연결 관리 엔진을 사용하도록 설정
//             // useCreateIndex: true, // MongoDB가 자동으로 인덱스를 생성하도록 설정
//             // useFindAndModify: false, // findAndModify() 대신에 findoneAndUpdate()를 사용하도록 설정
//         }
//     )
//     .then(() => console.log('MongoDB conected'))
//     .catch((err) => {
//         console.log(err);
//     });

app.listen(3001, () => {
    console.log('listening@@commit7777')
})