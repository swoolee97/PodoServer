const express = require('express');
var bodyParser = require('body-parser')
const router = express.Router()
router.use(bodyParser.urlencoded({extended:true}));
router.use(bodyParser.json())

router.post('/',async (req,res) => {
    let body = req.body
    console.log(body)
    if(!body.user_id){
        res.status(500)
        console.log('아이디 입력해주세요')
        return;
    }
    else if(body.user_pw == ''){
        res.status(500)
        console.log('비밀번호 입력해주세요')
        return;
    }

    res.json({
        login : 'success',
        // user_id : body.user_id,
        // user_password :body.user_pw
    })
})

module.exports = router;