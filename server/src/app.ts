import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
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
const PORT = process.env.PORT || 3000;

// CORS Configuration para produção
const allowedOrigins = [
    'http://localhost:5173',  // Desenvolvimento local
    'http://localhost:3000',
    process.env.FRONTEND_URL,  // URL do Vercel (configurar no .env)
    // Adicione outras URLs conforme necessário
].filter(Boolean); // Remove undefined

app.use(cors({
    origin: function (origin, callback) {
        // Permite requisições sem origin (como mobile apps ou Postman)
        if (!origin) return callback(null, true);

        // Permite qualquer subdomínio do Vercel (*.vercel.app)
        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`⚠️ CORS bloqueou origem: ${origin}`);
            callback(null, true); // Em produção, mude para false
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
    console.error('ERROR:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
