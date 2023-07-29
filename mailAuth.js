const express = require('express');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
var bodyParser = require('body-parser')
const router = express.Router()
var models = require('./models')
const User = require('./models/User');
const nodemailer = require('nodemailer')
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json())
require('dotenv').config()

router.post('/', async (req, res) => {

    let toEmail = req.body.user_email
    // 인증번호 이메일 보내기
    let randomCode = req.body.randomCode;
    console.log(randomCode)
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'swoolee97@gmail.com', // your Gmail account
            pass: process.env.GMAIL_KEY // your Gmail password
        }
    });

    let mailOptions = {
        from: 'swoolee97@naver.com', // sender address
        to: toEmail, // list of receivers
        subject: '가입 인증번호', // Subject line
        text: randomCode, // plain text body
        html: '<b>인증번호 : ' + randomCode + '</b>' // html body
    };

    try {
        let info = await transporter.sendMail(mailOptions)
        res.json({success : true})
    } catch (error) {
        console.error(error)
        res.json({success : false})
    }
    // console.log('Message sent: %s', info.messageId);
})

module.exports = router