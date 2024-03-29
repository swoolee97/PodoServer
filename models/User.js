const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const getToDate = () => {
    const to_date = new Date();
    to_date.setDate(new Date().getDate() + 180);
    return to_date;
};

const UserSchema = new mongoose.Schema({
    user_email: {
        type: String,
        required: true,
        unique: true,
    },
    user_name: { // 닉네임임.
        type: String,
        default : '없어질거임'
    },
    user_password: {
        type: String,
        // required: true,
        maxLength :100,
    },
    is_receiver: {
        type : Boolean,
        default : false, 
    },
    login_failed_count : {
        type : Number,
        default :0,
    },
    card_number : {
        type : String,
    },
    nick_name :{
        type :String,
        unique : true
    }
});

const User = mongoose.model('User',UserSchema);
module.exports = User