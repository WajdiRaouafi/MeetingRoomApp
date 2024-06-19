const mongoose = require('mongoose');

const meetingRoomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    capacity: { type: Number, required: true },
    equipment: [String],
    availability: { 
        type: [{ date: String, timeSlots: [String] }],
        default: []
    },
});

const MeetingRoom = mongoose.model('MeetingRoom', meetingRoomSchema);

module.exports = MeetingRoom;
