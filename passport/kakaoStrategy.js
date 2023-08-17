const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;
const { User } = require('../models');
const morgan = require('morgan'); // Morgan을 import합니다
require('dotenv').config()

module.exports = () => {
    passport.use(
        new KakaoStrategy({
            callbackURL: 'http://localhost:3001/auth/kakao/callback', // 카카오 로그인 Redirect URI 경로
            clientID: process.env.KAKAO_ID, // 카카오 로그인에서 발급받은 REST API 키
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const exUser = await User.findOne({ snsId: profile.id, /*providerType: 'kakao'*/ });

                // 이미 가입된 카카오 프로필이면 성공
                if (exUser) {
                    done(null, exUser); // 로그인 인증 완료
                } else {
                    // 가입되지 않는 유저면 회원가입 시키고 로그인을 시킨다
                    const newUser = new User({
                        email: profile._json && profile._json.kakao_account_email,
                        nickname: profile.displayName,
                        snsId: profile.id,
                        providerType: 'kakao',
                    });
                    await newUser.save();
                    done(null, newUser); // 회원가입하고 로그인 인증 완료
                }
            } catch (error) {
                done(error);
            }
        },
        ),
    );
    passport.serializeUser((user,done)=>{ 
        done(null,user);
    });
    passport.deserializeUser((user,done)=>{
        done(null,user);
    });
};
