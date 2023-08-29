const express = require("express");
const router = express.Router();
const Feed = require('../models/Feed');
const verifyAccessToken = require('../middleware/verifyingToken')

router.post('/posts', verifyAccessToken, async (req, res) => {
    try {
        const email = req.user_email;
        const { text, imageUrl } = req.body;

        // 새로운 피드 객체를 생성
        const newPost = new Feed({ email, text, imageUrl });

        // 데이터베이스에 저장
        await newPost.save();

        // 클라이언트에게 응답
        res.status(201).json(newPost);
    } catch (error) {
        console.error("Error in POST /posts:", error);
        res.status(500).json({ message: 'Internal Server Error' });
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
