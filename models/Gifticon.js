const mongoose = require('mongoose');

const GifticonSchema = new mongoose.Schema({
    donor_id: {
        required: true,
    },
    receiver_id: {
        type: String,
        required: false,
        default: null,
    },
    name: {
        type: String,
        required: true,
    },
    company: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    barcode_number: {
        type: String,
        unique: true,
        required: true,
    },
    todate: {
        type: Date,
        required: true,
    }
})

module.exports = mongoose.model('Gifticon', GifticonSchema);