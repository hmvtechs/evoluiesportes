"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const os_1 = __importDefault(require("os"));
const auth_1 = __importDefault(require("./routes/auth"));
const matches_1 = __importDefault(require("./routes/matches"));
const users_1 = __importDefault(require("./routes/users"));
const digitalId_1 = __importDefault(require("./routes/digitalId"));
const competitions_1 = __importDefault(require("./routes/competitions"));
const venues_1 = __importDefault(require("./routes/venues"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const modalities_1 = __importDefault(require("./routes/modalities"));
const organizations_1 = __importDefault(require("./routes/organizations"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// CORS Configuration para produção e rede local
const allowedOrigins = [
    'http://localhost:5173', // Desenvolvimento local
    'http://localhost:3000',
    process.env.FRONTEND_URL, // URL do Vercel (configurar no .env)
    /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/, // Rede local 192.168.x.x
    /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/, // Rede local 10.x.x.x
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Permite requisições sem origin (como mobile apps ou Postman)
        if (!origin)
            return callback(null, true);
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
            }
            else if (allowed instanceof RegExp) {
                return allowed.test(origin);
            }
            return false;
        });
        if (isAllowed) {
            callback(null, true);
        }
        else {
            console.warn(`⚠️ CORS bloqueou origem: ${origin}`);
            callback(null, true); // Em produção, mude para false se necessário
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});
// Routes
app.use('/api/v1/auth', auth_1.default);
app.use('/api/v1/matches', matches_1.default);
app.use('/api/v1/users', users_1.default);
app.use('/api/v1/digital-id', digitalId_1.default);
app.use('/api/v1/competitions', competitions_1.default);
app.use('/api/v1/venues', venues_1.default);
app.use('/api/v1/bookings', bookings_1.default);
app.use('/api/v1/modalities', modalities_1.default);
app.use('/api/v1/organizations', organizations_1.default);
app.get('/', (req, res) => {
    res.send('e-Esporte API is running');
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('ERROR:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});
// Start server on all network interfaces
const server = app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    // Exibir IPs da rede local
    const networkInterfaces = os_1.default.networkInterfaces();
    const addresses = [];
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
exports.default = app;
