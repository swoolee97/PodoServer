// UploadGifticon에서 기부하기 버튼 눌렀을 때
const aws = require('aws-sdk');
const express = require('express');
const uploadS3 = require('../middleware/uploadS3');
const Gifticon = require('../models/Gifticon')

const router = express.Router();

router.post('/', uploadS3.single('file'), async (req, res) => {
    //클라이언트에서 file을 잘 받았고 S3에 업로드 잘 됐는지 확인
    if (!req.file || !req.file.location) {
        //file을 못받았거나 업로드에 실패했으면 실패메시지 전송
        res.status(500).json({
            message: 'S3upload failed'
        })
    }
    //const s3 = new aws.S3();
    const s3 = new aws.S3()
    //db에 저장
    try {
        let today = new Date();
        const gifticon = new Gifticon({
            donor_email: req.body.donor_email,
            receiver_email: null,
            gifticon_name: 'milk',
            company: 'kakao',
            price: 1000,
            category: 'food',
            barcode_number: '1234567812345679',
            todate: today.toISOString().slice(0, 10),
            url: req.file.location
        })
        await gifticon.save();
        res.status(200).json({
            message : 'uploaded successfully'
        })
    } catch (error) {
        var params = {
            Bucket: 'parantestbucket2',
            Key: req.file.key,
        }
        // s3에 성공, db에 실패했을 때
        s3.deleteObject(params, (err, data) => {
            if (err) console.log(err, err.stack)
            else console.log(data)
        })
        console.error(error)
        res.status(500).json({
            message : 'db save failed',
        })
    }
});

module.exports = router;
