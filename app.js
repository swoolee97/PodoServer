const express = require("express");
const app = express()

// app.use(uploadS3)
// /api/login' 이라는 경로로 들어오는 모든 요청을 './routes/login' 모듈에 위임한다
// 여기서 어떤 경로로 갈 지 다 정의해 놓는다.
app.use(express.json())
app.use('/api/login', require('./routes/login'))
app.use('/api/register', require('./routes/register'))
app.use('/api/mypage', require('./routes/mypage'))
app.use('/api/emailAuth', require('./mailAuth'))
app.use('/api/uploadgifticon', require('./routes/uploadgifticon'))

app.listen(3001, () => {
    console.log('listening@@commit7777')
})