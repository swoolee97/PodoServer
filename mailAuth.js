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
    let purpose = req.body.purpose;
    let toEmail = req.body.user_email

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'swoolee97@gmail.com', // your Gmail account
            pass: process.env.GMAIL_KEY // your Gmail password
        }
    });
    const randomCode = req.body.randomCode;
    let mailOptions = {
        from: 'swoolee97@naver.com', // sender address
        to: toEmail, // list of receivers
        // subject: '가입 인증번호', // Subject line // 가입 인증번호, 비밀번호 재설정 인증번호 둘 다 구현해야함
        subject : purpose == '회원가입' ? '가입 인증번호' : '비밀번호 재설정',
        text: 'randomCode', // plain text body
        html: '<b>인증번호 : ' + randomCode + '</b>' // html body
    };

    try {
        let info = await transporter.sendMail(mailOptions)
        return res.status(500).json({success : true, randomCode : randomCode})
    } catch (error) {
        console.error(error)
        return res.status(200).json({success : false})
    }
})

module.exports = router