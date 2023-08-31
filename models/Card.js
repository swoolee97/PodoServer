const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
    card_number: {
        type: String,
        required: true
    },
    month: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    cvc: {
        type: String,
        default: null,
    },
    password: {
        type: String,
    },
    fail_count: {
        type: Number,
        default: 0,
    },
    email : {
        type : String,
    }
});

const Card = mongoose.model('Card', CardSchema);

module.exports = Card;
