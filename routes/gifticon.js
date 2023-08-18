// UploadGifticon에서 기부하기 버튼 눌렀을 때
const aws = require('aws-sdk');
const express = require('express');
const uploadS3 = require('../middleware/uploadS3');
const Gifticon = require('../models/Gifticon')
const jwt = require('jsonwebtoken')
const router = express.Router();
const verifyAccessToken = require('../middleware/verifyingToken')
const GifticonFetcher = require('../middleware/GifticonFetcher')
const multer = require('multer')
const bodyParser = require('body-parser')

// 기부 라우터
// 토큰 유효성 검사 => 기프티콘 정보 추출 => db에 업로드.
router.post('/upload', verifyAccessToken, uploadS3.single('file'), async (req, res) => {
    //클라이언트에서 file을 잘 받았고 S3에 업로드 잘 됐는지 확인
    console.log('donor_email : ', req.body.user_email)
    if (!req.file || !req.file.location) {
        //file을 못받았거나 업로드에 실패했으면 실패메시지 전송
        res.status(500).json({
            accessToken: req.accessToken,
            message: 'S3upload failed',
        })
    }

    const s3 = new aws.S3()
    //db에 저장
    try {
        let today = new Date();
        const gifticon = new Gifticon({
            donor_email: req.body.user_email,
            receiver_email: null,
            gifticon_name: '테스트',
            company: 'kakao',
            price: 1300,
            category: 'food',
            barcode_number: '1234567812345681',
            todate: today.toISOString().slice(0, 10),
            url: req.file.location
        })
        await gifticon.save();
        res.status(200).json({
            accessToken: req.accessToken,
            message: 'uploaded successfully'
        })
    } catch (error) {
        var params = {
            Bucket: 'parantestbucket3',
            Key: req.file.key,
        }
        // s3에 성공, db에 실패했을 때
        s3.deleteObject(params, (err, data) => {

        })
        console.error(error)
        res.status(500).json({
            accessToken: req.accessToken,
            message: 'db save failed',
        })
    }
});

const upload = multer();
router.use(bodyParser.urlencoded({ extended: true }), bodyParser.json(), upload.none());

router.post('/search', (req, res) => {
    let body = req.body;
    try {
        res.status(500).json({
            keyword: body.keyword
        })
    } catch (error) {
        console.error(error)
    }
})

router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    console.log(page)
    const limit = 10;
    const skip = (page - 1) * limit;
    try {
        const gifticons = await Gifticon.find()
            .sort({ _id: -1 }) // -1은 내림차순 정렬
            .skip(skip)
            .limit(limit);
        const hasMore = gifticons.length === limit;
        if (gifticons.length === 0) {
            return res.status(201).json({ gifticons: [], message: '기프티콘 더 없음', loading: hasMore });
        }
        console.log(hasMore)
        return res.status(200).json({ gifticons: gifticons, loading: hasMore });
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'error', loading: hasMore })
    }
});


module.exports = router;
