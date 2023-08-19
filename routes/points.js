const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

// 가라데이터
const pointData = [
    { email: 'ghcho333@ajou.ac.or', points: 500 },
    { email: 'ghcho333@ajou.ac.kr', points: 750 },
];

app.get('/api/user/points', (req, res) => {
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

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});