const mongoose = require('mongoose');

const GifticonSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
    },
    donor_email: {
        type: String,
        required: true,
    },
    receiver_email: {
        type: String,
        default: null,
        required :false,
    },
    gifticon_name: {
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

const Gifticon = mongoose.model('Gifticon', GifticonSchema);
module.exports = Gifticon