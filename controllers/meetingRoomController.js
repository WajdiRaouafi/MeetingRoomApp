const express = require('express');
const MeetingRoom = require('../model/meetingroom');
const router = express.Router();



// Render form to create a new meeting room
router.get('/new', (req, res) => {
    res.render('new', { title: 'Add New Meeting Room' });
});

// // Handle POST request to create a new meeting room
// router.post('/new', async (req, res) => {
//     try {
//         const { name, capacity, equipment, availability } = req.body;
//         const meetingRoom = new MeetingRoom({ name, capacity, equipment, availability });
//         await meetingRoom.save();
//         res.redirect('/meetingRooms'); // Redirect to the list of meeting rooms after successful creation
//     } catch (error) {
//         res.render('new', { error: error.message }); // Render the form again with error message
//     }
// });

router.post('/create', async (req, res) => {
    try {
        const { name, capacity, equipment, availability } = req.body;

        // Check if room (by name) already exists
        const existingRoom = await MeetingRoom.findOne({ name });
        if (existingRoom) {
            return res.status(400).json({ message: 'A room with the same name already exists' });
        }

        // Parse availability only if it's a valid JSON string
        let parsedAvailability = {};
        if (availability) {
            try {
                parsedAvailability = JSON.parse(availability);
            } catch (error) {
                console.error('Error parsing availability:', error);
                return res.status(400).json({ message: 'Invalid JSON format for availability' });
            }
        }

        // Create a new meeting room
        const meetingRoom = new MeetingRoom({
            name,
            capacity,
            equipment: equipment.split(','), // Split comma-separated equipment into an array
            availability: parsedAvailability // Assign parsed availability
        });

        await meetingRoom.save();
        res.redirect('/meetingrooms/all');
    } catch (error) {
        console.error('Error creating meeting room:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// Get all meeting rooms
// router.get('/all', async (req, res) => {
//     try {
//         const meetingRooms = await MeetingRoom.find();
//         res.status(200).send(meetingRooms);
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// });

// Get all meeting rooms
router.get('/all', async (req, res) => {
    try {
        const meetingRooms = await MeetingRoom.find();
        res.render('index', { title: 'Meeting Rooms', meetingRooms });
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Get a meeting room by ID
// router.get('/:id', async (req, res) => {
//     try {
//         const meetingRoom = await MeetingRoom.findById(req.params.id);
//         if (!meetingRoom) {
//             return res.status(404).send('Meeting room not found');
//         }
//         res.status(200).send(meetingRoom);
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// });

// Route to handle editing a meeting room
router.post('/edit/:id', async (req, res) => {
    try {
        const meetingRoom = await MeetingRoom.findById(req.params.id);
        if (!meetingRoom) {
            return res.status(404).render('edit', { error: 'Meeting room not found', meetingRoom: {} });
        }

        // Update meeting room details
        meetingRoom.name = req.body.name;
        meetingRoom.capacity = req.body.capacity;
        meetingRoom.equipment = req.body.equipment;
        meetingRoom.availability = JSON.parse(availability);

        await meetingRoom.save();
        res.redirect('/meetingRooms'); // Redirect to the list of meeting rooms or wherever appropriate
    } catch (err) {
        res.status(500).render('edit', { error: err.message, meetingRoom: {} });
    }
});

// Render form to edit a meeting room
router.get('/edit/:id', async (req, res) => {
    try {
        const meetingRoom = await MeetingRoom.findById(req.params.id);
        if (!meetingRoom) {
            return res.status(404).render('edit', { error: 'Meeting room not found', meetingRoom: {} });
        }
        res.render('edit', { meetingRoom, error: null });
    } catch (err) {
        res.status(500).render('edit', { error: err.message, meetingRoom: {} });
    }
});


// Update a meeting room by ID
// router.put('/:id', async (req, res) => {
//     try {
//         const updates = req.body;
//         const meetingRoom = await MeetingRoom.findByIdAndUpdate(req.params.id, updates, { new: true });
//         if (!meetingRoom) {
//             return res.status(404).send('Meeting room not found');
//         }
//         res.status(200).send(meetingRoom);
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// });

// Update a meeting room by ID
router.put('/:id', async (req, res) => {
    try {
        const updates = req.body;
        updates.equipment = updates.equipment.split(',');
        updates.availability = JSON.parse(updates.availability);

        const meetingRoom = await MeetingRoom.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!meetingRoom) {
            return res.status(404).send('Meeting room not found');
        }
        res.redirect('/meetingrooms/all');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Delete a meeting room by ID
// router.delete('/:id', async (req, res) => {
//     try {
//         const meetingRoom = await MeetingRoom.findByIdAndDelete(req.params.id);
//         if (!meetingRoom) {
//             return res.status(404).send('Meeting room not found');
//         }
//         res.status(200).send('Meeting room deleted successfully');
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// });

// Delete a meeting room by ID
router.delete('/:id', async (req, res) => {
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



