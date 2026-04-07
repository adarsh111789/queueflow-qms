// QueueFlow Configuration
const config = {
    // Server
    PORT: process.env.PORT || 3000,

    // MongoDB
    MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/queueflow',

    // Default Services seeded on first run
    DEFAULT_SERVICES: [
        { name: 'Doctor Consultation', prefix: 'D' },
        { name: 'Lab Test',            prefix: 'L' },
        { name: 'Billing',             prefix: 'B' },
        { name: 'Registration',        prefix: 'R' }
    ],

    // Token settings
    TOKEN_HISTORY_LIMIT: 50,

    // Bcrypt rounds
    BCRYPT_ROUNDS: 10
};

module.exports = config;
