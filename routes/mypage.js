const express = require('express');
var bodyParser = require('body-parser')
const router = express.Router()
var models = require('../models')
const User = require('../models/User');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json())

router.get('/:userEmail', async (req, res) => {
    const user_email = req.params.userEmail;
    try{
        const user = await models.User.findOne({'user_email' : user_email})
        if(user){
            res.json({user_email : user.user_email})
        }else{
            res.json({message : 'Cannot find user'})
        }
    }catch(error){
        console.error(error)
        res.status(500).json({message : 'mypage error'})
    }
})

module.exports = router;