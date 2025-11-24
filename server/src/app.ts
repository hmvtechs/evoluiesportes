import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import os from 'os';
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

// CORS Configuration para produção e rede local
const allowedOrigins: (string | RegExp)[] = [
    'http://localhost:5173',  // Desenvolvimento local
    'http://localhost:3000',
    process.env.FRONTEND_URL,  // URL do Vercel (configurar no .env)
    /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/,  // Rede local 192.168.x.x
    /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/,  // Rede local 10.x.x.x
].filter(Boolean) as (string | RegExp)[];

app.use(cors({
    origin: function (origin, callback) {
        // Permite requisições sem origin (como mobile apps ou Postman)
        if (!origin) return callback(null, true);

        // Permite qualquer subdomínio do Vercel (*.vercel.app)
        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        // Permite ngrok e outros túneis (*.ngrok.io, *.ngrok-free.app, *.loca.lt)
        if (origin.includes('.ngrok.io') || origin.includes('.ngrok-free.app') || origin.includes('.loca.lt')) {
            return callback(null, true);
        }

        // Verifica se origin está na lista (suporta strings e RegExp)
        const isAllowed = allowedOrigins.some(allowed => {
            if (typeof allowed === 'string') {
                return allowed === origin;
            } else if (allowed instanceof RegExp) {
                return allowed.test(origin);
            }
            return false;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`⚠️ CORS bloqueou origem: ${origin}`);
            callback(null, true); // Em produção, mude para false se necessário
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

// Start server on all network interfaces
const server = app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);

    // Exibir IPs da rede local
    const networkInterfaces = os.networkInterfaces();
    const addresses: string[] = [];

    Object.keys(networkInterfaces).forEach((interfaceName) => {
        networkInterfaces[interfaceName]?.forEach((iface) => {
            if (iface.family === 'IPv4' && !iface.internal) {
                addresses.push(iface.address);
            }
        });
    });

    if (addresses.length > 0) {
        console.log(`\n🌐 Acesso na rede local:`);
        addresses.forEach(addr => {
            console.log(`   http://${addr}:${PORT}`);
        });
        console.log('');
    }
});

export default app;
