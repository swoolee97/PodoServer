const express = require("express");
const app = express()

app.use('/api/user/login',require('./routes/user.login'))

app.listen(3001, () =>{
    console.log('listening')
})