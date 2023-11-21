const mongoose = require('mongoose');
const moment = require('moment-timezone');

const CompletedMissionSchema = new mongoose.Schema({
    id : {
        type : Number,
        // required : true
    },
    email : {
        type : String,
        required : true,
    },
    text : {
        type : String,
        default : null,
    },
    completedDate : {
        type : Date,
        default : () => {
            const now = new Date();
            now.setHours(now.getHours() + 9);
            return now;
        }
    },
    type : {
        type :String,
        // required : true,
        default : null
    }
});

const CompletedMission = mongoose.model('CompletedMission', CompletedMissionSchema);

module.exports = CompletedMission;
