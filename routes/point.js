const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Point = require('../models/Point')
const updateDates = require('../CommonMethods/updateDates')

router.get('/sum', async (req, res) => {
    const userEmail = req.query.email;
    if (!userEmail) {
        return res.status(400).json({ message: 'Email is required', code: 400 });
    }
    [today,startDate,endDate] = updateDates(1);
    try {
        const points = await Point.find({ 
            email: userEmail,
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

router.get('/list', async (req,res)=>{
    const email = req.query.email;
    const page = req.query.page;
    const limit = 10;
    let skip = (page-1)*limit;
    try {
        const points = await Point.find({
            email: email
        })
            .sort({ _id: -1 }) // 내림차순
            .skip(skip)
            .limit(limit);
        const hasMore = points.length === limit;
        if (points.length === 0) {//
            return res.status(201).json({ points: [], hasMore: hasMore });
        }
        return res.status(200).json({ points: points, hasMore: hasMore });
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'error', hasMore: hasMore })
    }

})

module.exports = router;