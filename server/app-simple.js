require('doten')

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Import routes - using require to avoid ES module issues
const authRoutes = require('./routes/auth');
const matchRoutes = require('./routes/matches');
const userRoutes = require('./routes/users');
const digitalIdRoutes = require('./routes/digitalId');
const competitionRoutes = require('./routes/competitions');
const venueRoutes = require('./routes/venues');
const bookingRoutes = require('./routes/bookings');
const modalityRoutes = require('./routes/modalities');
const organizationRoutes = require('./routes/organizations');

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/matches', matchRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/digital-id', digitalIdRoutes);
app.use('/api/v1/competitions', competitionRoutes);
app.use('/api/v1/venues', venueRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/modalities', modalityRoutes);
app.use('/api/v1/organizations', organizationRoutes);

app.get('/', (req, res) => {
    res.send('e-Esporte API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('ERROR:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
