// server.js

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const Order = require('./orderModel');
const User = require('./userModel');
//const env = require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB database
mongoose.connect('mongodb://127.0.0.1:27017/test')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(error => console.error('Error connecting to MongoDB:', error));

// Setup session
app.use(session({
    secret: 'yourSecretKey', 
    resave: false,
    saveUninitialized: false
}));
// Setup static files service
app.use(express.static('public'));

// Login verification middleware
function isLoggedIn(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login.html');
    }
}

async function getUserId(req) {
    try {
        const token = req.cookies.token;
        const user = await User.findOne({ token });
        return user ? user._id : null;
    } catch (error) {
        console.error('Error fetching userId:', error);
        return null;
    }
}

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, email } = req.body;

    try {
        let user = await User.findOne({ email });
        if (! user) {
            let token = Math.random().toString(36).substring(2);
            user = new User({ username, email, password: 'password', token });
            await user.save();
        }else{
            user.token = Math.random().toString(36).substring(2);
            await user.save();
        }
        res.cookie('token', user.token, { httpOnly: true }, { maxAge: 30 * 24 * 60 * 60 * 1000 });
        req.session.userId = user._id;
        res.json({ message: 'Login successful', userId: user._id });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Order endpoint
app.post('/order' , async (req, res) => {
    console.log(User.where({ token: req.cookies.token }));
    const { name, size, type, price } = req.body;
    console.log(name, size, type, price, req.body.user_id);
    let userId = await getUserId(req);
    try {
        const order = new Order({ name, size, type, price, userId });
        await order.save();
        res.status(201).json({ message: 'Order saved successfully' });
    } catch (error) {
        console.error('Error saving order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get orders endpoint
app.get('/orders', isLoggedIn, async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

app.get('/current_user', isLoggedIn, async (req, res) => {
    const userId = getUserId(req);
    const user = await User.findById(userId);
    res.json(user);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
