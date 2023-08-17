const jwt = require('jsonwebtoken');
const models = require('../models')
const RefreshToken = require('../models/RefreshToken')

const verifyAccessToken = (req, res, next) => {
    const token = req.headers['authorization'||""].split(' ')[1];
    const user_email = req.headers['user_email']
    if(user_email == 'null'){
        console.log('로그인 안했음')
        return res.status(402).json({message : 'no login'})
    }
    console.log('토큰 유효성 확인 미들웨어')
    if (!token) {
        return res.status(403).send({ message: 'No token provided!' });
    }
    // access token 유효한지 확인
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
        // access token이 유효하지 않다면 refresh token 유효한지 확인
        if (err) {
            console.error(err)
            console.log('유효하지 않은 access token')
            const refreshToken = await RefreshToken.findOne({ user_email: req.headers['user_email'] })
            if (refreshToken) {
                jwt.verify(refreshToken.token, process.env.JWT_REFRESH_KEY, async (err, decoded) => {
                    // refresh token이 유효하지 않으면
                    if (err) {
                        console.error(err)
                        console.log('유효하지 않은 refresh token')
                        return res.status(401).json({ message: '로그인 다시' })
                    }
                    // refresh token이 유효하면
                    console.log('유효한 refresh token')
                    req.donor_email = refreshToken.user_email;  // decoded 정보를 요청 객체에 첨부
                    // access token 재발급
                    let accessToken = jwt.sign({ user_email: refreshToken.user_email }, process.env.JWT_SECRET_KEY, {
                        expiresIn: '1m'
                    })
                    req.accessToken = accessToken
                    console.log('access token 재발급 완료')
                    // return res.status(200).json({message : 'access token 재발급 완료', accessToken : accessToken});
                })
            }else{
                return res.status(401).json({message : '로그인 다시'})
            }
        }
        console.log('유효한 access token')
        next();
    });
}
// refresh token 유효성 확인

module.exports = verifyAccessToken;