const mongoose = require('mongoose');

const FeedSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        default: null,
    },
    imageUrl: {
        type: [String],
        default: null
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const Feed = mongoose.model('Post', FeedSchema);

module.exports = Feed;

