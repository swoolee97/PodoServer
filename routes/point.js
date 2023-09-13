const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Point = require('../models/Point')
const updateDates = require('../CommonMethods/updateDates')
let today, startDate, endDate;

router.get('/sum', async (req, res) => {
    const userEmail = req.query.email;
    if (!userEmail) {
        return res.status(400).json({ message: 'Email is required', code: 400 });
    }
    [today,startDate,endDate] = updateDates(1);
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