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
    if (!req.file || !req.file.location) {
        //file을 못받았거나 업로드에 실패했으면 실패메시지 전송
        res.status(500).json({
            message: '파일 오류 : 관리자에게 문의하세요',
        })
    }

    const s3 = new aws.S3()
    //db에 저장

    //가라 기프티콘 데이터 만들기
    const createRandomCode = () => {
        return (String(Math.floor(Math.random() * 1000000)).padStart(6, "0"))
    }
    const fakeBarcodeNumber = createRandomCode();
    let gifticon_name = '';
    if(fakeBarcodeNumber%4 == 0) {gifticon_name = '영화';}
    else if(fakeBarcodeNumber%4 == 1) gifticon_name = '상품권'
    else if(fakeBarcodeNumber%4 == 2) gifticon_name = '라면'
    else if(fakeBarcodeNumber%4 == 3) gifticon_name = '투썸'
    const price = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    try {
        let today = new Date();
        const gifticon = new Gifticon({
            donor_email: req.body.user_email,
            receiver_email: null,
            gifticon_name: `${gifticon_name}`,
            company: 'kakao',
            price: price,
            category: 'food',
            barcode_number: fakeBarcodeNumber,
            todate: today.toISOString().slice(0, 10),
            url: req.file.location
        })
        await gifticon.save();
        return res.status(200).json({
            accessToken: req.accessToken,
            message: '기부 성공!'
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
        // s3 저장 실패
        return res.status(500).json({
            accessToken: req.accessToken,
            message: '이미 등록된 기프티콘입니다',
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

router.get('/detail', async (req, res) => {
    const gifticonId = req.query.id
    try {
        const gifticon = await Gifticon.findOne({ _id: gifticonId })
        res.status(200).json({ success: true, gifticon })
    } catch (error) {
        res.status(500).json({ success: false })
        console.error(error)
    }

})
router.get('/list', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
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
        return res.status(200).json({ gifticons: gifticons, loading: hasMore });
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'error', loading: hasMore })
    }
});
router.get('/search', async (req, res) => {
    const keyword = req.query.keyword;
    const page = req.query.page;
    const limit = 10;
    const skip = (page-1)*limit;
    try {
        const regex = new RegExp(keyword, 'i');
        const gifticons = await Gifticon.find({ gifticon_name: regex }).skip(skip).limit(10);
        const hasMore = gifticons.length === limit;
        if (gifticons.length === 0) {
            return res.status(404).json({gifticons : [], message: '기프티콘 더 없음', hasMore : hasMore });
        }
        
        res.status(200).json({gifticons : gifticons, hasMore : hasMore});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
})


module.exports = router;
