const mongoose = require('mongoose');

const PointSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    price : {
        type : Number,
        required : true
    },
    from : {
        type : String,
        required: true
    },
    createdAt: { // 언제 받았는지, 썼는지
        type: Date, 
        required: true,
        default : () => {
            const now = new Date();
            now.setHours(now.getHours() + 9);
            return now;
        }
    },
});
// 2000원 포인트 쌓고 1000원 쓰고 포인트 모두 소멸되면 0원이 돼야함.
const Point = mongoose.model('Point', PointSchema);

module.exports = Point;
