const express = require('express');
const mongoose = require('mongoose'); 
const session = require('express-session');
// const methodOverride = require('method-override');
const app = express(); // creation instance from express 
const auth = require('./routes/auth');

//middleware for parsing body data to json responses
app.use(express.json());


// Middleware for managing sessions
app.use(session({
    secret: 'wajdi',
    resave: false,
    saveUninitialized: true,
}));

// Middleware for parsing body data to JSON
app.use(express.urlencoded({ extended: true }));

// Middleware for overriding HTTP methods (for PUT and DELETE in forms)
// app.use(methodOverride('_method'));


// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Routes
const meetingRoomController = require('./controllers/meetingRoomController');
const reservationController = require('./controllers/reservationController');
app.use('/auth',auth)
app.use('/meetingRooms', meetingRoomController);
app.use('/reservations', reservationController);


// Home route
app.get('/home', (req, res) => {
    const token = req.session.token;
    res.render('home', { isAuthenticated: !!token });
});

// app.get("/home", (req, res) => res.render("home"))
app.get("/register", (req, res) => res.render("register"))
app.get("/login", (req, res) => res.render("login"))


// test server web
app.get('/hello', (req, res) => {
    res.send('welcome to the world');
})




// link to DB "user" 
mongoose.connect('mongodb+srv://wajdiraouafi:WAJdi112233@cluster0.knp1peb.mongodb.net/MeetingRoomApp').
then(()=> app.listen(9002,()=>{
     console.log('server listening successfully')
}));

// mongoose.connect('mongodb+srv://wajdiraouafi:WAJdi112233@cluster0.knp1peb.mongodb.net/MeetingRoomApp', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }).then(() => {
//     app.listen(9002, () => {
//         console.log('Server listening successfully on port 9002');
//     });
// }).catch((error) => {
//     console.error('Database connection error:', error);
// });
