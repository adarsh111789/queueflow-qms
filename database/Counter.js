const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    counterName: { type: String, required: true, unique: true },
    status: { 
        type: String, 
        enum: ['open', 'closed', 'paused'],
        default: 'open'
    }
});

module.exports = mongoose.model('Counter', counterSchema);
