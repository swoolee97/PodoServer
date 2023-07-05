const express = require('express');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
var bodyParser = require('body-parser')
const router = express.Router()
var models = require('../models')
const { User } = require('../models/User');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json())

router.post('/', async (req, res) => {
    let body = req.body
    console.log(body)
    if (!body.user_email) {
        res.status(500)
        console.log('이메일 입력해주세요')
        return;
    }
    else if (body.user_pw == '') {
        res.status(500)
        console.log('비밀번호 입력해주세요')
        return;
    }
    const user = await models.User.findOne({ user_email: body.user_email });
    console.log(user)
    if(user == null){
        return res.status(401).json({message : 'invalid user'})
    }
    
    const isPasswordValid = await bcrypt.compare(body.user_pw, user.user_password)

    if(!isPasswordValid){
        return res.status(401).json({message : 'invalid Password'})
    }
    let token = null;
    token = jwt.sign({user_email : user.user_email},'secretKey')
    
    res.json({
        token,
        login: 'success',
        user_email: body.user_email,
    })
})

module.exports = router;