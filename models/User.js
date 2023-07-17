const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const PointSchema = new mongoose.Schema({
    user_id :{
        type : String,
        required : true,
    },

    price : {
        type : Number,
        default : 100,
    },
    to_date : {
        type :Date,
        default : () => {
            const to_date = new Date();
            to_date.setDate(new Date().getDate() + 180);
            return to_date;
        },
    }
})
const UserSchema = new mongoose.Schema({
    user_id: {
        type: String,
        // required: true,
        unique: false,
        default : '1'
    },
    user_email: {
        type: String,
        required: true,
        unique: true,
    },
    user_name: {
        type: String,
        default : '없어질거임'
    },
    user_password: {
        type: String,
        required: true,
        maxLength :100,
    },
    point: [PointSchema],
    is_receiver: {
        type : Boolean,
        default : false, 
    }
});


const User = mongoose.model('User',UserSchema);
module.exports = User