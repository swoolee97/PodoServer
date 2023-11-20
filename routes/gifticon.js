// UploadGifticon에서 기부하기 버튼 눌렀을 때
const aws = require('aws-sdk');
const s3 = new aws.S3();
const express = require('express');
const Gifticon = require('../models/Gifticon')
const User = require('../models/User')
const Point = require('../models/Point')
const router = express.Router();
const verifyAccessToken = require('../middleware/verifyingToken')
const GifticonFetcher = require('../middleware/GifticonFetcher')
const multer = require('multer')
const bodyParser = require('body-parser')
const parseKoreanDate = require('../CommonMethods/parseKoreanDate');
const { MongoServerError } = require('mongodb');
const updateDates = require('../CommonMethods/updateDates')
const stringToPrice = require('../CommonMethods/stringToPrice')
const multerS3 = require('multer-s3')
let today, startDate, endDate;
// 미션을 만든 적 있는지 판단하는 라우터
// 토큰 유효성 검사 => 기프티콘 정보 추출 => db에 업로드.
aws.config.update({
    secretAccessKey: process.env.GIFTICON_AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.GIFTICON_AWS_ACCESS_KEY_ID,
    region: 'ap-northeast-2'
});
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'parantestbucket2',
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '-' + file.originalname);
        }
    })
});

router.post('/upload', upload.array('files',2), async (req, res) => {
    
    //클라이언트에서 file을 잘 받았고 S3에 업로드 잘 됐는지 확인
    if (!req.files || !req.files[0].location) {
        //file을 못받았거나 업로드에 실패했으면 실패메시지 전송
        return res.status(500).json({
            message: '파일 오류 : 관리자에게 문의하세요',
        })
    }
    const s3 = new aws.S3()
    //db에 저장
    const donor_email = req.body.user_email
    const barcode_number = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    barcode_number = barcode_number.toString()
    try {
        const todate = parseKoreanDate(req.body.expiration_date)
        const gifticon = new Gifticon({
            donor_email: donor_email,
            receiver_email: null,
            gifticon_name: req.body.name,
            company: req.body.exchange_place,
            category: 'food',
            barcode_number: barcode_number,
            price: req.body.price,
            todate: todate,
            url: req.files[0].location,
            image_url : req.body.image_url
        })
        await gifticon.save();
        const newAccessToken = req.accessToken;
        return res.status(200).json({
            // accessToken: newAccessToken ?? req.headers['authorization' || ""].split(' ')[1],
            message: '기부 성공!'
        })
    } catch (error) {
        if (error instanceof MongoServerError && error.code === 11000) {
            var params = {
                Bucket: 'parantestbucket2',
                Key: req.files[0].key,
            }
            // s3에 성공, db에 실패했을 때 s3에 올라간 이미지 다시 삭제
            s3.deleteObject(params, (err, data) => {
                if (err) {
                    console.error(err)
                }
            })
            console.error(error)
            return res.status(500).json({
                message: '이미 등록된 기프티콘입니다'
            })
        }
        // s3 저장 실패
        console.error(error)
        return res.status(500).json({
            accessToken: req.accessToken,
            message: 'db저장 에러',
        })
    }
});


router.use(bodyParser.urlencoded({ extended: true }), bodyParser.json(), upload.none());


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
    [today, startDate, endDate] = updateDates();
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    try {
        const gifticons = await Gifticon.find({
            is_valid: true,
            todate: {
                $gte: today,
            }
        })
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
    const skip = (page - 1) * limit;
    try {
        const regex = new RegExp(keyword, 'i');
        const gifticons = await Gifticon.find({ gifticon_name: regex }).skip(skip).limit(10);
        const hasMore = gifticons.length === limit;
        if (gifticons.length === 0) {
            return res.status(404).json({ gifticons: [], message: '기프티콘 더 없음', hasMore: hasMore });
        }
        
        res.status(200).json({ gifticons: gifticons, hasMore: hasMore });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
})
router.post('/buy', async (req, res) => {
    const email = req.body.email;
    const gifticonId = req.body.gifticonId;
    const user = await User.findOne({
        user_email: email
    })
    const point = await Point.find({
        email: email,
    })
    if (!user) {
        return res.status(500).json({ message: '잘못된 접근입니다' })
    }
    if (!user.is_receiver) {
        return res.status(500).json({ message: '수혜자만 구매 가능합니다' })
    }
    updateDates();
    const gifticon = await Gifticon.findOne({
        _id: gifticonId,
    })
    if (gifticon.todate < today) {
        gifticon.is_valid = false;
        await gifticon.save();
        return res.status(500).json({ message: '유효기간이 만료된 기프티콘입니다' })
    }
    if (!gifticon.is_valid) {
        return res.status(500).json({
            message: '이미 판매된 기프티콘입니다'
        })
    }
    let sum = 0;
    for (i = 0; i < point.length; i++) {
        sum += point[i].price
    }
    if (gifticon.price > sum) {
        return res.status(500).json({ message: '포인트가 부족합니다', buy : false })
    } else {
        try {
            gifticon.is_valid = false;
            await gifticon.save();
            const point = new Point({
                email: user.user_email,
                price: gifticon.price*(-1),
                from: '기프티콘 구매',
                createdAt: today,
            })
            await point.save();
            gifticon.donor_email = user.user_email;
            await gifticon.save();
            return res.status(200).json({message : '구매 완료', buy : true})
        } catch (error) {
            console.error(error)
        }
    }
    return res.status(200).json({ gifticon })
})

router.post('/purchase', async(req,res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    try{
        const body = req.body;
        const gifticons = await Gifticon.find({
            receiver_email : body.email,
            // is_valid : true
        })
        .sort({ _id: -1 }) // -1은 내림차순 정렬
        .skip(skip)
        .limit(limit);
        const hasMore = gifticons.length === limit;
        
        return res.json({
            gifticons : gifticons,
            loading : hasMore
        });
    } catch (error) {
        // 오류 처리
        res.status(500).send(error.message);
    }
})

router.post('/purchase/used', async(req,res) => {
    try{
        const gifticonId = req.body.gifticonId;
    
        const updateResult = await Gifticon.updateOne({ _id: gifticonId }, { $set: { is_valid: false } });
        return res.status(200).json({
            message : '사용 처리 되었습니다'
        })
    }catch(error){
        console.log(error)
        return res.status(500).json({
            message : '원인 불명'
        })
    }
})

router.post('/count', async (req,res) =>{
    const email = req.body.email
    console.log(email)
    try{
        const result = await Gifticon.find({'donor_email' : email})
        console.log(result.length)
        res.status(200).json({'count' : result.length})
    }catch(error){
        res.status(500).json()
    }
})

router.post('/received', async (req,res) =>{
    const email = req.body.email
    console.log(email)
    try{
        const result = await Gifticon.find({'receiver_email' : email})
        console.log(result.length)
        res.status(200).json({'count' : result.length})
    }catch(error){
        res.status(500).json()
    }
})


module.exports = router;
