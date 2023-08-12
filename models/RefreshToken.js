const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// RefreshToken Schema
const RefreshTokenSchema = new Schema({
    user_email: {
        type: String,
        required: true,
        unique : true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    used: {
        type: Boolean,
        default: false
    }
},{
    timestamps : true
});

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);