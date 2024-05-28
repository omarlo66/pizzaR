// server.js

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const Order = require('./orderModel');
const User = require('./userModel');

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB database
mongoose.connect('mongodb://localhost:27017/my_project')
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

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, email } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ username, email });
            await user.save();
        }

        res.json({ message: 'Login successful', userId: user._id });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Order endpoint
app.post('/order' , async (req, res) => {
    const { name, size, price, type, userId } = req.body;
    // console.log('fdfd');
    try {
        const order = new Order({ name, size, price, type, userId });
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
