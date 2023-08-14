const bodyParser = require('body-parser')
const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const models = require('../models')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const RefreshToken = require('../models/RefreshToken')
const passport = require('passport');
require('dotenv').config()

router.use(express.json())
// router.use(bodyParser.urlencoded({ extended: true }));
// router.use(bodyParser.json())
const saveRefreshToken = (user) => {
    const expirationDate = new Date();
    let refreshToken = jwt.sign({ user_email: user.user_email }, process.env.JWT_REFRESH_KEY, {
        expiresIn: '14d'
    })
    const newRefreshToken = new RefreshToken({
        user_email: user.user_email,
        token: refreshToken,
        expiresAt: new Date().setDate(expirationDate.getDate() + 14),
    });
    newRefreshToken.save()
}
//로그아웃
router.post('/logout', async (req, res) => {
    try {
        const user_email = req.body.user_email
        console.log(user_email)
        await RefreshToken.deleteMany({ user_email: user_email })
        res.status(200).json({ message: 'logout complete', success: true })
    } catch (err) {
        console.error(err)
    }
})

// 로그인
router.post('/login', async (req, res) => {
    const body = req.body
    const userEmail = req.body.user_email;
    const password = req.body.user_pw;
    // console.log(userEmail)
    // console.log(password)
    if (!userEmail) {
        res.status(501).json({
            message: '아이디 안적음',
            login: false
        })
        return;
    } else if (!password) {
        res.status(502).json({
            message: '비밀번호 안적음',
            login: false
        })
        return;
    }
    const user = await models.User.findOne({ user_email: body.user_email });

    if (!user) {
        res.status(500).json({
            message: '존재하지 않는 사용자요',
            login: false
        })
        return;
    }
    const passwordOk = bcrypt.compare(password, user.user_password)

    if (passwordOk) {
        let accessToken = jwt.sign({ user_email: user.user_email }, process.env.JWT_SECRET_KEY, {
            expiresIn: '1m'
        })
        // refresh token db에 저장.
        saveRefreshToken(user);

        return res.status(200).json({
            message: "로그인 성공",
            login: true,
            user_email: userEmail,
            accessToken
        })

    } else {
        res.status(500).json({
            message: "비밀번호 확인",
            login: false
        })
        return;
    }
})

// 회원가입
router.post('/register', async (req, res) => {
    let body = req.body
    if (String(body.user_pw).length < 8) {
        res.status(500).json({
            message: '비밀번호는 8자 이상으로',
            register: false
        })
        return;
    } else if (body.user_pw != body.check_password) {
        res.status(500).json({
            message: '비밀번호를 확인해주세요',
            register: false
        })
        return;
    } else if (body.user_email == '') {
        res.status(500).json({
            message: '이메일을 입력해주세요',
            register: false
        })
        return;
    }
    const user = await models.User.findOne({ user_email: body.user_email })

    if (user && user.user_email != undefined) {
        return res.status(500).json({
            message: '이미 가입된 이메일입니다',
            register: false
        })
    }

    try {
        const hashedPassword = await bcrypt.hash(body.user_pw, 10);

        const user = new User({
            user_password: hashedPassword,
            user_name: body.user_name,
            user_email: body.user_email,
        });
        await user.save();

        saveRefreshToken(user);
        let accessToken = jwt.sign({ user_email: user.user_email }, process.env.JWT_SECRET_KEY, {
            expiresIn: '1m'
        })
        res.status(200).json({
            message : '회원가입 성공',
            register: true,
            user_email: user.user_email,
            accessToken: accessToken,
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

    if (user != null) {
        console.log('로그인 : ', user.user_email)
        let accessToken = jwt.sign({ user_email: user.user_email }, process.env.JWT_SECRET_KEY, {
            expiresIn: '1m'
        })
        saveRefreshToken(user);
        res.status(203).json({
            user_email: body.email,
            message: '카카오로그인 성공',
            login: true,
            accessToken: accessToken,
        })
        // 가입이 안 돼 있으면
    } else {
        console.log('회원가입 : ', body.email)
        try {
            const user = new User({
                user_name: body.nickname,
                user_email: body.email,
            });
            await user.save();
        } catch (error) {
            console.error(error)
        }
        saveRefreshToken(user);
        res.status(202).json({
            user_email: body.email,
            message: '회원가입 성공',
            login: true,
        })
    }
});
module.exports = router;