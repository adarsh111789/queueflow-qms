const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    prefix: { type: String, required: true },
    isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Service', serviceSchema);
