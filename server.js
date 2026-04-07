const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Token = require('./models/Token');
const Service = require('./models/Service');
const Counter = require('./models/Counter');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve frontend files

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/queueflow')
    .then(() => console.log('Connected to MongoDB via local instance!'))
    .catch(err => console.error('MongoDB connection error:', err));

// Seed default services if they don't exist
async function seedDefaultServices() {
    try {
        const count = await Service.countDocuments();
        if (count === 0) {
            await Service.insertMany([
                { name: 'Doctor Consultation', prefix: 'D' },
                { name: 'Lab Test', prefix: 'L' },
                { name: 'Billing', prefix: 'B' },
                { name: 'Registration', prefix: 'R' }
            ]);
            console.log("Default services seeded!");
        }
    } catch (e) {
        console.error("Error seeding services:", e);
    }
}
mongoose.connection.once('open', seedDefaultServices);

// --- ROUTES ---

// 1. Get queue statistics/metrics
app.get('/api/queue/stats', async (req, res) => {
    try {
        const totalTokens = await Token.countDocuments();
        const activeCounters = await Counter.countDocuments({ status: 'open' });
        const completed = await Token.countDocuments({ status: 'completed' });
        const waitingCount = await Token.countDocuments({ status: 'waiting' });
        
        // Wait time calculation approximation
        const lastCompletedTokens = await Token.find({ status: 'completed' }).sort({ completedAt: -1 }).limit(10);
        let avgWait = 12.0; // fallback
        if (lastCompletedTokens.length > 0) {
            let totalTime = 0;
            let count = 0;
            lastCompletedTokens.forEach(t => {
                if(t.issuedAt && t.completedAt) {
                    totalTime += (t.completedAt - t.issuedAt) / 60000; // in minutes
                    count++;
                }
            });
            if(count > 0) avgWait = (totalTime/count);
        }

        const upcoming = await Token.find({ status: 'waiting' }).sort({ issuedAt: 1 }).limit(7).select('tokenId -_id');

        res.json({
            totalTokens,
            activeCounters: activeCounters || 8, // fallback if counters aren't seeded
            avgWaitTime: avgWait.toFixed(1),
            completedToday: completed,
            waitingCount,
            upcomingTokens: upcoming.map(u => u.tokenId)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Generate a new token
app.post('/api/queue/token', async (req, res) => {
    try {
        const { serviceType, customerName, phoneNumber } = req.body;
        
        let service = await Service.findOne({ name: serviceType });
        if(!service) {
             service = await Service.findOne(); // grab fallback
        }
        const prefix = service ? service.prefix : 'A';
        
        // Count total tokens for this service to ensure unique global ID
        const totalCount = await Token.countDocuments({ 
            serviceType: serviceType || service.name
        });
        
        const tokenId = `${prefix}-${String(totalCount + 1).padStart(3, '0')}`;
        
        const newToken = new Token({
            tokenId,
            customerName: customerName || 'Guest',
            phoneNumber,
            serviceType: serviceType || service.name
        });
        
        await newToken.save();
        res.status(201).json(newToken);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Call next token
app.patch('/api/queue/call', async (req, res) => {
    try {
        // Complete the current serving token
        await Token.updateMany({ status: 'serving' }, { 
            status: 'completed', 
            completedAt: new Date() 
        });

        // Find the oldest waiting token
        const nextToken = await Token.findOne({ status: 'waiting' }).sort({ issuedAt: 1 });
        if (!nextToken) {
            return res.status(404).json({ message: 'No tokens waiting.' });
        }

        nextToken.status = 'serving';
        nextToken.servedAt = new Date();
        // Optional: req.body.counterAllocation could be used here
        await nextToken.save();

        res.json({ calledToken: nextToken });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3.1 Get pending tokens
app.get('/api/queue/pending', async (req, res) => {
    try {
        const pendingTokens = await Token.find({ status: 'pending' }).sort({ issuedAt: 1 });
        res.json(pendingTokens);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3.2 Approve pending token
app.patch('/api/queue/approve/:tokenId', async (req, res) => {
    try {
        const token = await Token.findOne({ tokenId: req.params.tokenId, status: 'pending' });
        if (!token) return res.status(404).json({ message: 'Pending token not found.' });
        
        token.status = 'waiting';
        await token.save();
        res.json({ message: 'Token approved.', token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Reset queue
app.post('/api/queue/reset', async (req, res) => {
    try {
        await Token.deleteMany({});
        res.json({ message: 'Queue data has been completely reset.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- AUTH ROUTES ---

// 5. Register User
app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already exists' });
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = new User({ fullName, email, password: hashedPassword, role });
        await newUser.save();
        
        res.status(201).json({ message: 'User registered successfully', role: newUser.role, email: newUser.email, fullName: newUser.fullName });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Login User
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });
        
        // Validate role matches
        if (user.role !== role) return res.status(403).json({ message: 'Access denied for this role' });
        
        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
        
        res.json({ message: 'Login successful', role: user.role, email: user.email, fullName: user.fullName });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. Get full token history (completed tokens)
app.get('/api/queue/history', async (req, res) => {
    try {
        const history = await Token.find({ status: 'completed' })
            .sort({ completedAt: -1 })
            .limit(50);
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 8. Get all registered users (Admin only)
app.get('/api/admin/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Exclude password field
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 9. Get all services
app.get('/api/services', async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 10. Get per-service token breakdown
app.get('/api/queue/breakdown', async (req, res) => {
    try {
        const breakdown = await Token.aggregate([
            { $group: { _id: '$serviceType', total: { $sum: 1 }, pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }, waiting: { $sum: { $cond: [{ $eq: ['$status', 'waiting'] }, 1, 0] } }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } },
            { $sort: { total: -1 } }
        ]);
        res.json(breakdown);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`QueueFlow backend running on port ${PORT}`);
});
