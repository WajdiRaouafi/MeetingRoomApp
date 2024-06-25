const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  title: String,
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  meetingRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'MeetingRoom', required: true },
});

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;
