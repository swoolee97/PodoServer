const express = require('express');
const router = express.Router();
const missionList = require('../missionList.json')
const bodyParser = require('body-parser')
const CompletedMission = require('../models/CompletedMission')
const User = require('../models/User')
const Point = require('../models/Point')
const updateDates = require('../CommonMethods/updateDates')
let today, startDate, endDate;
// 미션을 만든 적 있는지 판단하는 라우터
router.get('/isMissionCompleted', async (req, res) => {
    const user_email = req.query.email;
    const user = await User.findOne({'user_email' : user_email})
    console.log(user)
    // 수혜자가 아니면 리턴
    if (!user || !user.is_receiver) {
        console.log('수혜자 아님')
        return res.status(200).json({ completed: true })
    }
    [today,startDate,endDate] = updateDates(0);
    const record = await CompletedMission.findOne({
        email: user_email,
        completedDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        }
    });
    if (record) {
        return res.status(200).json({ completed: !!record.text })
    }
    return res.status(200).json({ completed: !!record })
})

// 미션 생성하는 라우터. 
// 오늘 만든 적 있으면 만든걸로 진행하고 만든 적 없으면 새로만들어서 진행.
router.get('/createMission', async (req, res) => {
    const user_email = req.query.email;
    [today,startDate,endDate] = updateDates(0);
    const record = await CompletedMission.findOne({
        email: user_email,
        completedDate: {
            $gte: startDate,
            $lte: endDate
        }
    });
    // 받은 데일리 미션이 있으면 받은 미션 리턴
    if (record) {
        return res.status(200).json({
            mission: missionList.find(mission => mission.id == record.id)
        })
    }
    // 받은 데일리 미션이 없으면 새로운 미션 생성
    const num = Math.floor(Math.random() * 1000000) % missionList.length
    const mission = new CompletedMission({
        id: num,
        email: user_email
    })
    await mission.save();
    return res.status(200).json({
        mission: missionList.find(mission => mission.id == num)
    })
})
// 미션 전송 라우터
router.post('/save', async (req, res) => {
    const text = req.body.text;
    const email = req.body.email;
    [today,startDate,endDate] = updateDates(0);
    let completedMission = await CompletedMission.findOne({
        email: email,
        completedDate: {
            $gte: startDate,
            $lte: endDate
        }
    })
    completedMission.text = text;
    await completedMission.save();
    const point = new Point({
        email : email,
        price : 100,
        from : '일일 미션',
        createdAt : today,
        expireAt : new Date(today.getTime() + (24*60*60*1000*180)).setUTCHours(0,0,0,0)
    })
    await point.save();

    return res.status(200).json({ success: true, message: '미션을 완료했어요!' })
})

router.get('/list', async (req, res) => {
    const email = req.query.email;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    try {
        const missions = await CompletedMission.find({
            email: email,
            text: { $ne: null } 
        })
            .sort({ _id: -1 }) // 내림차순
            .skip(skip)
            .limit(limit);
        const hasMore = missions.length === limit;
        if (missions.length === 0) {//
            return res.status(201).json({ missions: [], hasMore: hasMore });
        }
        return res.status(200).json({ missions: missions, hasMore: hasMore, missionList: missionList });
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'error', hasMore: hasMore })
    }
})

module.exports = router;