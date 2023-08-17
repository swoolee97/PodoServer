const mongoose = require('mongoose');

const GifticonSchema = new mongoose.Schema({
    // 상품사진, 기업로고 S3 스토리지 따로 파기
    
    url: { // S3에 저장된 주소
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