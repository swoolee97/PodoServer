const express = require("express");
const cors = require('cors');
const passport = require('passport');
// asdf
const session = require('express-session');
// const morgan = require('morgan');
const app = express();
require('dotenv').config()
// app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
require('./passport/kakaoStrategy')()
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24
    }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', require('./routes/auth')); // api auth 시작하는 것들은 routes auth로 보낸다.
app.use('/api/emailAuth', require('./mailAuth'));
app.use('/api/gifticon', require('./routes/gifticon'));
app.use('/api/point', require('./routes/point'));

app.listen(3001, () => {
    console.log('listening@@commit7777')
});
