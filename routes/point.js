const express = require('express');
router = express.Router();
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

// 가라데이터
const pointData = [
    { email: 'ghcho333@ajou.ac.or', points: 500 },
    { email: 'ghcho333@ajou.ac.kr', points: 750 },
    { email: 'swoolee97@ajou.ac.kr', points: 750 },
    { email: 'swoolee97@gmail.com', points: 750 },
];

router.get('/', (req, res) => {
    const userEmail = req.query.user_email;
    
    if (!userEmail) {
        return res.status(400).json({ message: 'Email is required' });
    }

    const userPoint = pointData.find(data => data.email === userEmail);

    if (!userPoint) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.json({ points: userPoint.points });
});

module.exports = router;