const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Point = require('../models/Point')
let today, startDate, endDate;
// 미션을 만든 적 있는지 판단하는 라우터
const updateDates = () => {
    today = new Date().getTime() + (9 * 60 * 60 * 1000);
    today = new Date(today)
    // 오늘 날짜의 시작 시각 설정 (00:00:00)
    startDate = new Date(today);
    startDate.setUTCHours(0, 0, 0, 0);
    // 오늘 날짜의 마지막 시각 설정 (23:59:59)
    expireDate = new Date(startDate.getTime() + (24*60*60*1000*180));
}
router.get('/sum', async (req, res) => {
    const userEmail = req.query.email;
    if (!userEmail) {
        return res.status(400).json({ message: 'Email is required', code: 400 });
    }
    updateDates();
    try {
        const points = await Point.find({ 
            email: userEmail,
            expireAt: {
                $gte: today
            }
        })
        let sum = 0;
        for(i=0; i<points.length; i++){
            sum += points[i].price;
        }
        
        return res.status(200).json({ sum })
    } catch (error) {
        console.error("Error fetching user points:", error);
        res.status(500).json({ message: 'Internal Server Error', code: 500 });
    }
});

module.exports = router;