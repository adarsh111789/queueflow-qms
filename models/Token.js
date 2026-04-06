const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    tokenId: { type: String, required: true, unique: true },
    customerName: { type: String, default: 'Guest' },
    phoneNumber: { type: String },
    serviceType: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'waiting', 'serving', 'completed', 'cancelled'],
        default: 'pending'
    },
    issuedAt: { type: Date, default: Date.now },
    servedAt: { type: Date },
    completedAt: { type: Date },
    counterAllocated: { type: String }
});

module.exports = mongoose.model('Token', tokenSchema);
