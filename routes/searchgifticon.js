const express = require('express')
const Gifticon = require('../models/Gifticon')
const router = express.Router();
const multer = require('multer')
var bodyParser = require('body-parser')
const upload = multer();
// 미들웨어 사용 선언
router.use(bodyParser.urlencoded({ extended: true }), bodyParser.json(), upload.none());

router.post('/', (req, res) => {
    let body = req.body;
    console.log(body)
    try {
        res.status(500).json({
            keyword : body.keyword
        })
    }catch(error){
        console.error(error)
    }
})

module.exports = router;