const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const MeetingRoom = require('../model/meetingroom');
const Reservation = require('../model/reservation');
const User = require('../model/user');




router.post('/create', async (req, res) => {
    try {
        const { username, roomName, date, timeSlot } = req.body;

        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find room by name
        const room = await MeetingRoom.findOne({ name: roomName });
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Ensure availability is an array
        if (!Array.isArray(room.availability)) {
            room.availability = [];
        }

        // Check if the room is available for the given date and time slot
        const existingReservation = room.availability.find(avail => avail.date === date);
        if (existingReservation && existingReservation.timeSlots.includes(timeSlot)) {
            return res.status(400).json({ message: 'Room already reserved for the selected time slot' });
        }

        // Update the room availability
        if (existingReservation) {
            existingReservation.timeSlots.push(timeSlot);
        } else {
            room.availability.push({ date, timeSlots: [timeSlot] });
        }
        await room.save();

        // Create a new reservation record
        const newReservation = new Reservation({
            user: user._id,
            meetingRoom: room._id,
            date,
            timeSlot,
        });
        await newReservation.save();

        res.status(201).json({ message: 'Room reserved successfully', reservation: newReservation });
    } catch (error) {
        console.error('Error reserving room:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.get('/all', async (req, res) => {
    try {
        const reservations = await Reservation.find()
            .populate('user', 'username')
            .populate('meetingRoom', 'name');
        res.status(200).json(reservations);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { username, roomName, date, timeSlot } = req.body;

        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find room by name
        const room = await MeetingRoom.findOne({ name: roomName });
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Ensure availability is an array
        if (!Array.isArray(room.availability)) {
            room.availability = [];
        }

        // Check if the room is available for the given date and time slot
        const existingReservation = room.availability.find(avail => avail.date === date);
        if (existingReservation && existingReservation.timeSlots.includes(timeSlot)) {
            return res.status(400).json({ message: 'Room already reserved for the selected time slot' });
        }

        // Find the existing reservation by ID
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Update reservation details
        reservation.user = user._id;
        reservation.meetingRoom = room._id;
        reservation.date = date;
        reservation.timeSlot = timeSlot;
        await reservation.save();

        res.status(200).json({ message: 'Reservation updated successfully', reservation });
    } catch (error) {
        console.error('Error updating reservation:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const reservation = await Reservation.findByIdAndDelete(req.params.id);
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Update the meeting room availability
        const room = await MeetingRoom.findById(reservation.meetingRoom);
        if (room) {
            const existingReservation = room.availability.find(avail => avail.date === reservation.date);
            if (existingReservation) {
                const timeSlotIndex = existingReservation.timeSlots.indexOf(reservation.timeSlot);
                if (timeSlotIndex > -1) {
                    existingReservation.timeSlots.splice(timeSlotIndex, 1);
                }

                // Remove the date if there are no more time slots for that date
                if (existingReservation.timeSlots.length === 0) {
                    room.availability = room.availability.filter(avail => avail.date !== reservation.date);
                }
                await room.save();
            }
        }

        res.status(200).json({ message: 'Reservation deleted successfully' });
    } catch (error) {
        console.error('Error deleting reservation:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;
