const bodyParser = require('body-parser')
const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const models = require('../models')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const passport = require('passport');
require('dotenv').config()

router.use(express.json())
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json())

router.post('/login', async (req, res) => {
    let body = req.body;
    const userEmail = body.user_email;
    const password = body.user_pw;

    if (!userEmail) {
        res.status(501).json({
            message: '아이디 안적음',
            login: 'fail'
        })
        return;
    } else if (!password) {
        res.status(502).json({
            message: '비밀번호 안적음',
            login: 'fail'
        })
        return;
    }
    const user = await models.User.findOne({ user_email: body.user_email });

    if (!user) {
        res.status(500).json({
            message: '존재하지 않는 사용자요',
            login: 'fail'
        })
        return;
    }
    const passwordOk = await bcrypt.compare(password, user.user_password)


    if (passwordOk) {
        let token = jwt.sign({ user_email: user.user_email }, process.env.JWT_SECRET_KEY)
        res.status(200).json({
            message: "로그인 성공",
            login: 'success',
            user_email: userEmail,
            token
        })
        return;
    } else {
        res.status(500).json({
            message: "비밀번호 확인",
            login: 'fail'
        })
        return;
    }
})

router.post('/register', async (req, res) => {
    let body = req.body
    if (String(body.user_pw).length < 8) {
        res.status(500).json({
            message: '비밀번호는 8자 이상으로',
            register: 'fail'
        })
        return;
    } else if (body.user_pw != body.check_password) {
        res.status(500).json({
            message: '비밀번호를 확인해주세요',
            register: 'fail'
        })
        return;
    } else if (body.user_email == '') {
        res.status(500).json({
            message: '이메일을 입력해주세요',
            register: 'fail'
        })
        return;
    }
    const user = await models.User.findOne({ user_email: body.user_email })

    if (user && user.user_email != undefined) {
        res.status(500).json({
            message: '이미 가입된 이메일입니다',
            register: 'fail'
        })
        return;
    }

    try {
        const hashedPassword = await bcrypt.hash(body.user_pw, 10);

        const user = new User({
            user_password: hashedPassword,
            user_name: body.user_name,
            user_email: body.user_email,
        });

        // Save the user to the database
        await user.save();

        res.status(200).json({
            register: 'success',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
})

//? /kakao로 요청오면, 카카오 로그인 페이지로 가게 되고, 카카오 서버를 통해 카카오 로그인을 하게 되면, 다음 라우터로 요청한다.
router.post('/kakao', async (req, res) => {
    let body = req.body;

    // 해당 아이디로 가입이 되어 있다면
    const user = await models.User.findOne({ user_email: body.email })
    
    let token = null;
    if (user != null) {
        console.log('로그인 : ', user.user_email)
        token = jwt.sign({ user_email: user.user_email }, process.env.JWT_SECRET_KEY)
        res.status(203).json({
            user_email: body.email,
            message: '카카오로그인 성공',
            login: 'success',
            token
        })
        // 가입이 안 돼 있으면
    } else {
        console.log('회원가입 : ', body.email)
        // token = jwt.sign({ user_email: user.user_email }, process.env.JWT_SECRET_KEY)
        try {
            const user = new User({
                user_name: body.nickname,
                user_email: body.email,
            });
            await user.save();
        } catch (error) {
            console.log(error)
        }
        res.status(202).json({
            user_email: body.email,
            message: '회원가입 성공',
            login: 'success',
            token
        })
    }
});
// //? 위에서 카카오 서버 로그인이 되면, 카카오 redirect url 설정에 따라 이쪽 라우터로 오게 된다.
// router.get(
//     '/kakao/callback',
//     //? 그리고 passport 로그인 전략에 의해 kakaoStrategy로 가서 카카오계정 정보와 DB를 비교해서 회원가입시키거나 로그인 처리하게 한다.
//     passport.authenticate('kakao', {
//         failureRedirect: '/', // kakaoStrategy에서 실패한다면 실행
//     }),
//     // kakaoStrategy에서 성공한다면 콜백 실행
//     (req, res) => {
//         res.redirect('/login');
//     },
// );
module.exports = router;