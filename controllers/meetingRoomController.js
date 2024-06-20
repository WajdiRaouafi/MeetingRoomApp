const express = require('express');
const MeetingRoom = require('../model/meetingroom');
const authMiddleware = require('../authMiddleware') // Import your verifyToken middleware
const router = express.Router();

// Create a new meeting room
router.post('/create',authMiddleware, async (req, res) => {
    try {
        const { name, capacity, equipment, availability } = req.body;
        
         // Check if room (by name) already exists
         const existingRoom = await MeetingRoom.findOne({ name });
         if (existingRoom) {
             return res.status(400).json({ message: 'A room with the same name already exists' });
         }
        

        // Create a new meeting room
        const meetingRoom = new MeetingRoom({ name, capacity, equipment, availability });
        await meetingRoom.save();
        res.status(201).json({ message: 'Meeting room created successfully'});
        // res.status(201).send(meetingRoom);
    } catch (error) {
        // res.status(400).send(error.message);
        console.error('Error creating meeting room:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all meeting rooms
router.get('/all',authMiddleware, async (req, res) => {
    try {
        const meetingRooms = await MeetingRoom.find();
        res.status(200).send(meetingRooms);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Get a meeting room by ID
router.get('/:id',authMiddleware, async (req, res) => {
    try {
        const meetingRoom = await MeetingRoom.findById(req.params.id);
        if (!meetingRoom) {
            return res.status(404).send('Meeting room not found');
        }
        res.status(200).send(meetingRoom);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Update a meeting room by ID
router.put('/:id',authMiddleware, async (req, res) => {
    try {
        const updates = req.body;
        const meetingRoom = await MeetingRoom.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!meetingRoom) {
            return res.status(404).send('Meeting room not found');
        }
        res.status(200).send(meetingRoom);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Delete a meeting room by ID
router.delete('/:id',authMiddleware, async (req, res) => {
    try {
        const meetingRoom = await MeetingRoom.findByIdAndDelete(req.params.id);
        if (!meetingRoom) {
            return res.status(404).send('Meeting room not found');
        }
        res.status(200).send('Meeting room deleted successfully');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;







// const express = require('express');
// const MeetingRoom = require('../model/meetingroom');
// const router = express.Router();

// // Create a new meeting room
// // router.post('/create', async (req, res) => {
// //     try {
// //         const { name, capacity, equipment, availability } = req.body;
// //         const meetingRoom = new MeetingRoom({ name, capacity, equipment, availability });
// //         await meetingRoom.save();
// //         res.status(201).send(meetingRoom);
// //         res.redirect('/MeetingRooms');
// //     } catch (error) {
// //         res.status(400).send(error.message);
// //     }
// // });



// router.post('/', async (req, res) => {
//         try {
//             const { name, capacity, equipment,availability } = req.body;
    
//             // Check if room (by name) already exists
//             const existingRoom = await MeetingRoom.findOne({ name });
//             if (existingRoom) {
//                 return res.status(400).json({ message: 'A room with the same name already exists' });
//             }
    
//             // Create a new meeting room
//             const newRoom = new MeetingRoom({ name, capacity, equipment,availability });
//             await newRoom.save();
    
//             res.status(201).json({ message: 'Meeting room created successfully', room: newRoom });
//         } catch (error) {
//             console.error('Error creating meeting room:', error);
//             res.status(500).json({ message: 'Internal server error' });
//         }
// });

// // Get all meeting rooms
// router.get('/all', async (req, res) => {
//     try {
//         const meetingRooms = await MeetingRoom.find();
//         // res.render('meetingRooms', { meetingRooms });
//         res.status(200).send(meetingRooms);
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// });

// // Render form to create a new meeting room
// // router.get('/new', (req, res) => {
// //     res.render('newMeetingRoom');
// // });


// // Get a meeting room by ID
// router.get('/:id', async (req, res) => {
//     try {
//         const meetingRoom = await MeetingRoom.findById(req.params.id);
//         if (!meetingRoom) {
//             return res.status(404).send('Meeting room not found');
//         }
//         // res.render('editMeetingRoom', { meetingRoom });
//         res.status(200).send(meetingRoom);
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// });

// // Update a meeting room by ID
// router.put('/:id', async (req, res) => {
//     try {
//         const updates = req.body;
//         const meetingRoom = await MeetingRoom.findByIdAndUpdate(req.params.id, updates, { new: true });
//         if (!meetingRoom) {
//             return res.status(404).send('Meeting room not found');
//         }
//         // res.redirect('/MeetingRooms');
//         res.status(200).send(meetingRoom);
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// });

// // Delete a meeting room by ID
// router.delete('/:id', async (req, res) => {
//     try {
//         const meetingRoom = await MeetingRoom.findByIdAndDelete(req.params.id);
//         if (!meetingRoom) {
//             return res.status(404).send('Meeting room not found');
//         }
//         // res.redirect('/MeetingRooms');
//         res.status(200).send('Meeting room deleted successfully');
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// });

// // module.exports = router;
// // const express = require('express');
// // const router = express.Router();
// // const MeetingRoom = require('../model/meetingroom');

// // // Route to get all meeting rooms
// // router.get('/', async (req, res) => {
// //     try {
// //         const meetingRooms = await MeetingRoom.find();
// //         res.render('meetingRooms', { meetingRooms });
// //     } catch (error) {
// //         res.status(500).send(error.message);
// //     }
// // });

// // // Route to get form for adding a new meeting room
// // router.get('/new', (req, res) => {
// //     res.render('newMeetingRoom');
// // });

// // // Route to handle creation of a new meeting room
// // router.post('/', async (req, res) => {
// //     try {
// //         const { name, capacity, equipment, availability } = req.body;
// //         console.log(req.body); // Log the request body to inspect its contents
// //         const meetingRoom = new MeetingRoom({ name, capacity, equipment, availability });
// //         await meetingRoom.save();
// //         res.redirect('/meetingRooms');
// //     } catch (error) {
// //         console.error(error);
// //         res.status(400).send(error.message);
// //     }
// // });





// // // Route to delete a meeting room
// // router.delete('/:id', async (req, res) => {
// //     try {
// //         const { id } = req.params;
// //         await MeetingRoom.findByIdAndDelete(id);
// //         res.redirect('/meetingRooms');
// //     } catch (error) {
// //         res.status(500).send(error.message);
// //     }
// // });

// // module.exports = router;



