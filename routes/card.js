const express = require('express')
const router = express.Router();
const User = require('../models/User')
const Card = require('../models/Card')
const faker = require('faker');
const bcrypt = require('bcrypt')
router.get('/', async (req,res)=>{
    const email = req.query.email
    const user = await User.findOne({
        'user_email' : email
    })
    if(user.is_receiver){
        return res.status(500).json({message: '이미 인증한 회원입니다'})
    }else{
        return res.status(200).json({message : '성공'})
    }
})
router.post('/certification', async (req, res) => {
    const body = req.body;
    const month = Number.parseInt(body.month);
    const year = Number.parseInt(body.year);
    const cvc = body.cvc;
    const password = body.password;
    const email = body.email;

    const card = await Card.findOne({
        card_number: body.cardNumber,
    })
    if (!card) {
        return res.status(500).json({ message: '일치하는 카드가 없습니다' });
    }
    if(card.fail_count == 5){
        return res.status(500).json({message : '시도 횟수 초과'})
    }
    if(card.email){
        return res.status(500).json({message : '이미 등록된 카드입니다'})
    }
    const cvcCorrect = await bcrypt.compare(cvc,card.cvc)
    const passwordCorrect = await bcrypt.compare(password,card.password)
    
    if (card.month !== month || card.year !== year || !cvcCorrect || !passwordCorrect) {
        card.fail_count = card.fail_count + 1;
        await card.save();
        return res.status(500).json({ message: '카드를 다시 확인해주세요' })
    }
    else {
        const user = await User.findOne({
            user_email: email
        })
        card.email = email;
        card.fail_count = 0;
        user.is_receiver = true;
        user.card_number = body.cardNumber;
        await user.save();
        await card.save();
        return res.status(200).json({ message: '인증 완료', success: true })
    }
})

const saltRounds = 10;
router.get('/fake', (req, res) => {
    
    let month = null;
    let year = null;
    let cvc = null;
    let password = null;
    let generateFakeCardData = async () => {
        card_number = faker.helpers.replaceSymbolWithNumber("################").slice(0, 16);
        month = faker.random.number({ min: 1, max: 12 });
        year = faker.random.number({ min: 22, max: 30 });  // 2022년부터 2030년까지
        cvc = faker.helpers.replaceSymbolWithNumber("###").slice(0, 3);
        password = faker.random.number({ min: 1000, max: 9999 });
        const hashedCVC = await bcrypt.hash(cvc, saltRounds);
        const hashedPassword = await bcrypt.hash(password.toString(), saltRounds);

        return {
            card_number,
            month,
            year,
            cvc: hashedCVC,
            password: hashedPassword,
        };
    };
    const fillFakeCardData = async () => {
        const fakeCardData = await generateFakeCardData();
        const newCard = new Card(fakeCardData);
        return newCard.save();
    };
    fillFakeCardData();
    res.status(200).json({card_number,month,year,cvc,password})
})

module.exports = router;