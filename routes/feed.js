const express = require("express");
const router = express.Router();
const Feed = require('../models/Feed');
const verifyAccessToken = require('../middleware/verifyingToken');
const aws = require('aws-sdk');
const multer = require('multer')
const multerS3 = require('multer-s3');

aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: 'ap-northeast-2'
});

const s3 = new aws.S3();

const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'feedpodo',
      key: function (req, file, cb) {
        cb(null, Date.now().toString() + '-' + file.originalname);
      }
    })
  });
  
  
router.post('/posts', verifyAccessToken, upload.array('image'), async (req, res) => {
    try {

        console.log(req)
        const email = req.headers['user_email'];
        const text = req.body.text;
        
        // 이미지 처리
        const images = req.files;
        const imageUrls = images.map(file => file.location);
    
        console.log("Image URLs: ", imageUrls);

        // 새로운 피드 객체 생성
        const newPost = new Feed({ email, text, imageUrl: imageUrls });
    
        // 데이터베이스에 저장
        await newPost.save();

        // 클라이언트에게 응답
        res.status(201).json({
            success: true, // successfully created a post
            message: '포스트가 성공적으로 생성되었습니다.',
            post: newPost  // you can still send the newPost object if needed
        });
    } catch (error) {
        console.error("Error in POST /posts:", error);
        res.status(500).json({
            success: false, // indicates that the operation was not successful
            message: 'Internal Server Error'
        });
    }
});


router.get('/posts', async (req, res) => {
    try {
        const posts = await Feed.find({});
        res.status(200).json(posts);
    } catch (error) {
        console.error("Error in GET /posts:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
