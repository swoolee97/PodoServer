const express = require('express');
const router = express.Router();
const missionList = require('../missionList.json')
const bodyParser = require('body-parser')
const CompletedMission = require('../models/CompletedMission')

let today, startDate, endDate;
// 미션을 만든 적 있는지 판단하는 라우터
const updateDates = () => {
    today = new Date().getTime() + (9 * 60 * 60 * 1000);
    today = new Date(today)
    // 오늘 날짜의 시작 시각 설정 (00:00:00)
    startDate = new Date(today);
    startDate.setUTCHours(0, 0, 0, 0);
    // 오늘 날짜의 마지막 시각 설정 (23:59:59)
    endDate = new Date(today);
    endDate.setUTCHours(23, 59, 59, 999);
}
router.get('/isMissionCompleted', async (req, res) => {
    const user_email = req.query.user_email;
    // 수혜자가 아니면 리턴
    // if (!user || !user.is_receiver) {
    //     console.log('수혜자 아님')
    //     return res.status(200).json({ completed: true })
    // }
    updateDates();
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
    const user_email = req.query.email
    updateDates();
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
    updateDates();
    let completedMission = await CompletedMission.findOne({
        email: email,
        completedDate: {
            $gte: startDate,
            $lte: endDate
        }
    })
    completedMission.text = text;
    await completedMission.save();
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