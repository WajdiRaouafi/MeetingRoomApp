const express = require('express');
const bcrypt =require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/user');
const router =express.Router();


//register 
router.post('/register', async(req, res)=> {
    try {
        const { username, password } = req.body
        const user = new User({username, password})
        await user.save()
        res.status(201).redirect('/login');
        // res.status(201).send({ message: 'User registered successfully' })
    }catch (error) {
        res.status(400).send(error.message)
    }
})
// Login route
// router.post('/login', async (req, res) => {
//     try {
//         const { username, password } = req.body;

//         const user = await User.findOne({ username: username });
//         if (!user) {
//             return res.render('login', { message: 'User not found' }); // Pass message for user not found
//         }

//         const isPasswordMatch = await bcrypt.compare(password, user.password);
//         if (!isPasswordMatch) {
//             return res.render('login', { message: 'Invalid password' }); // Pass message for invalid password
//         }

//         const token = jwt.sign({ _id: user._id }, "wajdi"); // Replace with your secret key
//         req.session.token = token;
//         res.redirect('/home');
//     } catch (err) {
//         res.status(400).send(err.message);
//     }
// });

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).send('User not found');
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).send('Invalid password');
        }

        const token = jwt.sign({ _id: user._id }, "wajdi", { expiresIn: '1h' });
        res.send({ token });
    } catch (err) {
        res.status(400).send(err.message);
    }
});


// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Unable to log out');
        }
        res.redirect('/login'); // Redirect to login page after logout
    });
});
 
 module.exports = router;