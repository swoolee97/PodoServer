const express = require('express');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
var bodyParser = require('body-parser')
const router = express.Router()
var models = require('../models')
const User = require('../models/User');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json())

router.post('/', async (req, res) => {
    let body = req.body
    if (String(body.user_pw).length < 8) {
        res.status(500)
        console.log('비밀번호는 8자 이상으로')
        return;
    } else if (body.user_pw != body.check_password) {
        res.status(500)
        console.log('비밀번호를 확인해주세요')
        return;
    } else if (body.user_email == '') {
        res.status(500)
        console.log('이메일 입력해주세요')
        return;
    } else if (user_name = '') {
        res.status(500)
        console.log('이름을 입력해주세요')
        return;
    }
    
    const user = models.User.findOne({user_email : body.user_email})
    
    if(user.user_email != undefined){
        console.log('중복')
        res.json({
            status : -1, // 이메일 중복
        })
        return;
    }

    try {
        const hashedPassword = await bcrypt.hash(body.user_pw, 10); // 비밀번호를 해쉬값으로 변환하여 암호화 한 뒤 데이터베이스에 저장

        const user = new User({
            user_password: hashedPassword,
            user_name: body.user_name,
            user_email: body.user_email  // 비밀번호 재설정을 위해 이메일을 받고 패스워드를 바꾸는 방법 생각
        });

        // Save the user to the database
        const savedUser = await user.save();
        
        res.json({
            register: 'success',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }

})

module.exports = router;