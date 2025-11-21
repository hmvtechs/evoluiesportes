import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
// import { PrismaClient } from '@prisma/client'; // Removed for Supabase migration
import authRoutes from './routes/auth';
import matchRoutes from './routes/matches';
import userRoutes from './routes/users';
import digitalIdRoutes from './routes/digitalId';
import competitionRoutes from './routes/competitions';
import venueRoutes from './routes/venues';
import bookingRoutes from './routes/bookings';
import modalityRoutes from './routes/modalities';
import organizationRoutes from './routes/organizations';

const app = express();
// const prisma = new PrismaClient(); // Removed for Supabase migration
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

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

// Seed route for prototype - DISABLED FOR SUPABASE MIGRATION
// app.get('/seed', async (req, res) => {
//     try {
//         // ... (Prisma seed logic removed)
//         res.json({ message: 'Seed disabled' });
//     } catch (e) {
//         console.error(e);
//         res.status(500).json({ error: 'Seed failed' });
//     }
// });

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
    console.error('ERROR:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
