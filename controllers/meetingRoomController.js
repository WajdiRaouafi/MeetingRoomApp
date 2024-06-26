const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware') // Import your verifyToken middleware
const MeetingRoom = require('../model/meetingroom');

// Render form to create a new meeting room
router.get('/new',authMiddleware, (req, res) => {
    res.render('newMeet', { title: 'Add New Meeting Room' });
});

router.post('/create',authMiddleware, async (req, res) => {
    try {
        // const { name, capacity, equipment, availability } = req.body;
        const { name, capacity, equipment } = req.body;


        // Check if room (by name) already exists
        const existingRoom = await MeetingRoom.findOne({ name });
        if (existingRoom) {
            return res.status(400).json({ message: 'A room with the same name already exists' });
        }

        // Create a new meeting room
        const meetingRoom = new MeetingRoom({
            name,
            capacity,
            equipment: equipment.split(','), // Split comma-separated equipment into an array
            // availability: parsedAvailability // Assign parsed availability
        });

        await meetingRoom.save();
        res.redirect('/meetingrooms/all');
    } catch (error) {
        console.error('Error creating meeting room:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all meeting rooms
router.get('/all',authMiddleware, async (req, res) => {
    try {
        const meetingRooms = await MeetingRoom.find();
        res.render('indexMeet', { title: 'Meeting Rooms', meetingRooms });
    } catch (error) {
        res.status(400).send(error.message);
    }
});


// Route to handle editing a meeting room
router.post('/edit/:id',authMiddleware, async (req, res) => {
    try {
      const meetingRoomId = req.params.id;
      const updatedName = req.body.name;
  
      // Check for existing meeting room with the same name (excluding the one being edited)
      const existingMeetingRoom = await MeetingRoom.findOne({
        name: updatedName,
        _id: { $ne: meetingRoomId }, // Exclude the meeting room being edited
      });
  
      if (existingMeetingRoom) {
        return res.status(400).render('editMeet', {
          error: 'Meeting room name already exists. Please choose a unique name.',
          meetingRoom: await MeetingRoom.findById(meetingRoomId), // Get meeting room details for pre-filling the form
        });
      }
  
      // Update meeting room details only if the name is unique
      const meetingRoom = await MeetingRoom.findByIdAndUpdate(meetingRoomId, req.body, {
        new: true, // Return the updated document
        runValidators: true, // Enforce validation rules
      });
  
      if (!meetingRoom) {
        return res.status(404).render('editMeet', { error: 'Meeting room not found', meetingRoom: {} });
      }
  
      res.redirect('/meetingRooms/all'); // Redirect to the list of meeting rooms or wherever appropriate
    } catch (err) {
      res.status(500).render('editMeet', { error: err.message, meetingRoom: {} });
    }
  });
  

// Render form to edit a meeting room
router.get('/edit/:id',authMiddleware, async (req, res) => {
    try {
        const meetingRoom = await MeetingRoom.findById(req.params.id);
        if (!meetingRoom) {
            return res.status(404).render('editMeet', { error: 'Meeting room not found', meetingRoom: {} });
        }
        res.render('editMeet', { meetingRoom, error: null });
    } catch (err) {
        res.status(500).render('editMeet', { error: err.message, meetingRoom: {} });
    }
});
// Delete a meeting room by ID
router.delete('/:id',authMiddleware, async (req, res) => {
    try {
        const meetingRoom = await MeetingRoom.findByIdAndDelete(req.params.id);
        if (!meetingRoom) {
            return res.status(404).send('Meeting room not found');
        }
        res.redirect('/meetingrooms/all');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;

