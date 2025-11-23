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
app.use((0, cors_1.default)());
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
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
