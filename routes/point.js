const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', async (req, res) => {
    const userEmail = req.query.user_email;

    if (!userEmail) {
        return res.status(400).json({ message: 'Email is required', code: 400 });
    }

    try {
        const user = await User.findOne({ user_email: userEmail });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found', code: 404 });
        }
        const totalPoints = user.point.reduce((acc, pointObj) => acc + pointObj.price, 0);

        res.json({ points: totalPoints });

    } catch (error) {
        console.error("Error fetching user points:", error);
        res.status(500).json({ message: 'Internal Server Error', code: 500 });
    }
});

module.exports = router;