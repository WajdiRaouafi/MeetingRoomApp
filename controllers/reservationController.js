const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authMiddleware = require('../authMiddleware') // Import your verifyToken middleware

const MeetingRoom = require('../model/meetingroom');
const Reservation = require('../model/reservation');
const User = require('../model/user');



router.get('/new',authMiddleware, async (req, res) => {
    try {
      const users = await User.find(); // Fetch all users
      const meetingRooms = await MeetingRoom.find(); // Fetch all meeting rooms (optional)
  
      res.render('newResv', { users, meetingRooms }); // Pass users and optionally meetingRooms data
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).render('error', { message: 'Internal server error' }); // Or handle error appropriately
    }
  });


router.post('/create',authMiddleware, async (req, res) => {
    try {
      const { title,userId, roomId, startDate, startTime, endTime } = req.body;
  
      // Combine startDate with startTime and endDate with endTime to create valid Date objects
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${startDate}T${endTime}`);
  
      // Check availability using combined dates and times
      const existingReservation = await Reservation.findOne({
        meetingRoom: roomId,
        $or: [
          { startDate: { $lte: startDateTime }, endDate: { $gte: startDateTime } },  // Overlaps start datetime
          { startDate: { $lte: endDateTime }, endDate: { $gte: endDateTime } },   // Overlaps end datetime
          { startDate: { $gt: startDateTime }, endDate: { $lt: endDateTime } }    // Completely within existing reservation
        ]
      });
  
      if (existingReservation) {
        return res.status(400).json({ message: 'Room already reserved for the selected time slot' });
      }
  
      // Create a new reservation record
      const newReservation = new Reservation({
        title,
        user: userId,
        meetingRoom: roomId,
        startDate: startDateTime,
        endDate: endDateTime,
      });
  
      await newReservation.save();
      res.redirect('/reservations/all');
    //   res.status(201).json({ message: 'Room reserved successfully', reservation: newReservation });
    } catch (error) {
      console.error('Error reserving room:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
});  


  // Get all reservations

router.get('/all',authMiddleware, async (req, res) => {
    try {
      const reservations = await Reservation.find()
        .populate('user', 'username')
        .populate('meetingRoom', 'name');
        res.render('indexResv', { title: 'Reservations', reservations });
    } catch (error) {
        res.status(400).send(error.message);
    }
});


// GET route to render the edit form
router.get('/edit/:id',authMiddleware ,async (req, res) => {
    try {
      const reservation = await Reservation.findById(req.params.id)
        .populate('user', 'username') // Populate user details
        .populate('meetingRoom', 'name'); // Populate meeting room details
      if (!reservation) {
        return res.status(404).render('editResv', { error: 'Reservation not found', reservation: {} });
      }
  
      // Fetch all users or filter based on your logic (e.g., active users)
      const users = await User.find({}, 'username'); // Or your filtering criteria
  
      const meetingRooms = await MeetingRoom.find({}, 'name'); // Assuming you need meeting rooms
      const startDate = reservation.startDate.toISOString().split('T')[0];
      const startTime = reservation.startDate.toISOString().split('T')[1].slice(0, 5);
      const endTime = reservation.endDate.toISOString().split('T')[1].slice(0, 5);
  
      // Pass the fetched user data to the view
      res.render('editResv', {
        reservation,
        startDate,
        startTime,
        endTime,
        users, // This is the key variable
        meetingRooms,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching reservation:', error);
      res.status(500).render('editResv', { error: 'Internal server error', reservation: {} });
    }
  });
  

router.post('/edit/:id',authMiddleware, async (req, res) => {
    try {
        const { title, userId, meetingRoomId, startDate, startTime, endTime } = req.body;
        const reservationId = req.params.id;

        // Check for existing overlapping reservations
        const existingReservation = await Reservation.findOne({
            meetingRoom: meetingRoomId,
            _id: { $ne: reservationId }, // Exclude the current reservation from the check
            $or: [
                { startDate: { $lte: startDate }, endDate: { $gte: startDate } },
                { startDate: { $lte: endTime }, endDate: { $gte: endTime } },
                { startDate: { $gt: startDate }, endDate: { $lt: endTime } }
            ]
        });

        if (existingReservation) {
            const users = await User.find({}, 'username');
            const meetingRooms = await MeetingRoom.find({}, 'name');

            return res.status(400).render('editResv', {
                error: 'Room already reserved for the selected time slot',
                reservation: await Reservation.findById(reservationId).populate('user', 'username').populate('meetingRoom', 'name'),
                users,
                meetingRooms
            });
        }

        // Update reservation details
        const reservation = await Reservation.findByIdAndUpdate(
            reservationId,
            {
                title,
                user: userId,
                meetingRoom: meetingRoomId,
                startDate,
                startTime,
                endTime,
                endDate: new Date(new Date(startDate).setHours(new Date(startDate).getHours() + (endTime.split(':')[0] - startTime.split(':')[0]), endTime.split(':')[1] - startTime.split(':')[1]))
            },
            { new: true, runValidators: true }
        );

        if (!reservation) {
            return res.status(404).render('editResv', { error: 'Reservation not found', reservation: {} });
        }

        res.redirect('/reservations/all'); // Redirect to the list of reservations or wherever appropriate
    } catch (err) {
        res.status(500).render('editResv', { error: err.message, reservation: {} });
    }
});

router.delete('/:id', authMiddleware ,async (req, res) => {
    try {
        const reservation = await Reservation.findByIdAndDelete(req.params.id);
        if (!reservation) {
            return res.status(404).send('Reservation not found');
        }
        res.redirect('/reservations/all');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;

  
























// router.get('/edit/:id', async (req, res) => {
//     try {
//         const reservation = await Reservation.findById(req.params.id)
//             .populate('user', 'username')
//             .populate('meetingRoom', 'name');

//         if (!reservation) {
//             return res.status(404).render('editResv', { error: 'Reservation not found', reservation: {} });
//         }

//         const users = await User.find({}, 'username');
//         const meetingRooms = await MeetingRoom.find({}, 'name');

//         res.render('editResv', { reservation, users, meetingRooms, error: null });
//     } catch (err) {
//         res.status(500).render('editResv', { error: err.message, reservation: {} });
//     }
// });

//   // Route to handle editing a reservation 

// router.post('/edit/:id', async (req, res) => {
//     try {
//         const { userId, meetingRoomId, startDate, startTime, endTime } = req.body;
//         const reservationId = req.params.id;

//         // Check for existing overlapping reservations
//         const existingReservation = await Reservation.findOne({
//             meetingRoom: meetingRoomId,
//             _id: { $ne: reservationId }, // Exclude the current reservation from the check
//             $or: [
//                 { startDate: { $lte: startDate }, endDate: { $gte: startDate } },
//                 { startDate: { $lte: endTime }, endDate: { $gte: endTime } },
//                 { startDate: { $gt: startDate }, endDate: { $lt: endTime } }
//             ]
//         });

//         if (existingReservation) {
//             const users = await User.find({}, 'username');
//             const meetingRooms = await MeetingRoom.find({}, 'name');

//             return res.status(400).render('editResv', {
//                 error: 'Room already reserved for the selected time slot',
//                 reservation: await Reservation.findById(reservationId).populate('user', 'username').populate('meetingRoom', 'name'),
//                 users,
//                 meetingRooms
//             });
//         }

//         // Update reservation details
//         const reservation = await Reservation.findByIdAndUpdate(
//             reservationId,
//             {
//                 user: userId,
//                 meetingRoom: meetingRoomId,
//                 startDate,
//                 startTime,
//                 endTime,
//                 endDate: new Date(new Date(startDate).setHours(new Date(startDate).getHours() + (endTime.split(':')[0] - startTime.split(':')[0]), endTime.split(':')[1] - startTime.split(':')[1]))
//             },
//             { new: true, runValidators: true }
//         );

//         if (!reservation) {
//             return res.status(404).render('editResv', { error: 'Reservation not found', reservation: {} });
//         }


// router.delete('/:id', async (req, res) => {
//     try {
//         const reservation = await Reservation.findByIdAndDelete(req.params.id);
//         if (!reservation) {
//             return res.status(404).send('Reservation not found');
//         }
//         res.redirect('/reservations/all');
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// });

// module.exports = router;



// // router.post('/edit/:id', async (req, res) => {
// //     try {
// //     //   const meetingRoomId = req.params.id;
// //     //   const updatedName = req.body.name;
// //     //   const { title,username, roomName, startDate, startTime, endTime } = req.body;

// //         // Find user by username
// //         const user = await User.findOne({ username });
// //         if (!user) {
// //             return res.status(404).send({ message: 'User not found' });
// //         }

// //         // Find room by name
// //         const room = await MeetingRoom.findOne({ name: roomName });
// //         if (!room) {
// //             return res.status(404).send({ message: 'Room not found' });
// //         }

// //         // Find the existing reservation by ID
// //         const reservation = await Reservation.findById(req.params.id);
// //         if (!reservation) {
// //             return res.status(404).send({ message: 'Reservation not found' });
// //         }
// //         // Check if the room is available for the given date and time slot
// //         const existingReservation = await Reservation.findOne({
// //             meetingRoom: room._id,
// //             _id: { $ne: reservation._id }, // Exclude the current reservation from the check
// //             $or: [
// //                 { startDate: { $lte: startDate }, endDate: { $gte: startDate } },
// //                 { startDate: { $lte: endTime }, endDate: { $gte: endTime } },
// //                 { startDate: { $gt: startDate }, endDate: { $lt: endTime } }
// //             ]
// //         });
// //         if (existingReservation) {
// //             return res.status(400).render('editResv', {
// //                       error: 'Room already reserved for the selected time slot.',
// //                       reservation: await Reservation.findById(req.params.id), // Get meeting room details for pre-filling the form
// //                     });
// //         }
// //         reservation.title = title;
// //         reservation.user = user._id;
// //         reservation.meetingRoom = room._id;
// //         reservation.startDate = startDate;
// //         reservation.startTime = startTime;
// //         reservation.endTime = endTime;
// //         reservation.endDate = new Date(new Date(startDate).setHours(new Date(startDate).getHours() + (endTime.split(':')[0] - startTime.split(':')[0]), endTime.split(':')[1] - startTime.split(':')[1]));

// //         await reservation.save();

// //         res.status(200).json({ message: 'Reservation updated successfully', reservation });
// //     } catch (error) {
// //         console.error('Error updating reservation:', error);
// //         res.status(500).json({ message: 'Internal server error' });
// //     }



// //     //   // Check for existing meeting room with the same name (excluding the one being edited)
// //     //   const existingMeetingRoom = await MeetingRoom.findOne({
// //     //     name: updatedName,
// //     //     _id: { $ne: meetingRoomId }, // Exclude the meeting room being edited
// //     //   });
  
// //     //   if (existingMeetingRoom) {
// //     //     return res.status(400).render('editMeet', {
// //     //       error: 'Meeting room name already exists. Please choose a unique name.',
// //     //       meetingRoom: await MeetingRoom.findById(meetingRoomId), // Get meeting room details for pre-filling the form
// //     //     });
// //     //   }
  
// //       // Update meeting room details only if the name is unique
// //       const meetingRoom = await MeetingRoom.findByIdAndUpdate(meetingRoomId, req.body, {
// //         new: true, // Return the updated document
// //         runValidators: true, // Enforce validation rules
// //       });
  
// //       if (!meetingRoom) {
// //         return res.status(404).render('editMeet', { error: 'Meeting room not found', meetingRoom: {} });
// //       }
  
// //       res.redirect('/meetingRooms/all'); // Redirect to the list of meeting rooms or wherever appropriate
// //     } catch (err) {
// //       res.status(500).render('editMeet', { error: err.message, meetingRoom: {} });
// //     }
// //   });
  

// // // Render form to edit a meeting room
// // router.get('/edit/:id', async (req, res) => {
// //     try {
// //         const meetingRoom = await MeetingRoom.findById(req.params.id);
// //         if (!meetingRoom) {
// //             return res.status(404).render('editMeet', { error: 'Meeting room not found', meetingRoom: {} });
// //         }
// //         res.render('editMeet', { meetingRoom, error: null });
// //     } catch (err) {
// //         res.status(500).render('editMeet', { error: err.message, meetingRoom: {} });
// //     }
// // });


// // router.put('/:id', async (req, res) => {
// //     try {
// //         const { username, roomName, startDate, startTime, endTime } = req.body;

// //         // Find user by username
// //         const user = await User.findOne({ username });
// //         if (!user) {
// //             return res.status(404).send({ message: 'User not found' });
// //         }

// //         // Find room by name
// //         const room = await MeetingRoom.findOne({ name: roomName });
// //         if (!room) {
// //             return res.status(404).send({ message: 'Room not found' });
// //         }

// //         // Ensure availability is an array
// //         if (!Array.isArray(room.availability)) {
// //             room.availability = [];
// //         }

// //         // Check if the room is available for the given date and time slot
// //         const existingReservation = room.availability.find(avail => avail.date === date);
// //         if (existingReservation && existingReservation.timeSlots.includes(timeSlot)) {
// //             return res.status(400).json({ message: 'Room already reserved for the selected time slot' });
// //         }

// //         // Find the existing reservation by ID
// //         const reservation = await Reservation.findById(req.params.id);
//         if (!reservation) {
//             return res.status(404).json({ message: 'Reservation not found' });
//         }

//         // Update reservation details
//         reservation.user = user._id;
//         reservation.meetingRoom = room._id;
//         reservation.date = date;
//         reservation.timeSlot = timeSlot;
//         await reservation.save();

//         res.status(200).json({ message: 'Reservation updated successfully', reservation });
//     } catch (error) {
//         console.error('Error updating reservation:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// router.delete('/:id', async (req, res) => {
//     try {
//         const reservation = await Reservation.findByIdAndDelete(req.params.id);
//         if (!reservation) {
//             return res.status(404).json({ message: 'Reservation not found' });
//         }

//         // Update the meeting room availability
//         const room = await MeetingRoom.findById(reservation.meetingRoom);
//         if (room) {
//             const existingReservation = room.availability.find(avail => avail.date === reservation.date);
//             if (existingReservation) {
//                 const timeSlotIndex = existingReservation.timeSlots.indexOf(reservation.timeSlot);
//                 if (timeSlotIndex > -1) {
//                     existingReservation.timeSlots.splice(timeSlotIndex, 1);
//                 }

//                 // Remove the date if there are no more time slots for that date
//                 if (existingReservation.timeSlots.length === 0) {
//                     room.availability = room.availability.filter(avail => avail.date !== reservation.date);
//                 }
//                 await room.save();
//             }
//         }

//         res.status(200).json({ message: 'Reservation deleted successfully' });
//     } catch (error) {
//         console.error('Error deleting reservation:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });


// module.exports = router;
