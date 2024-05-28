const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    size: {
        type: String,
        required: false // جعل هذا الحقل اختياريًا
    },
    price: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
