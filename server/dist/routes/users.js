"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authorize_1 = require("../middleware/authorize");
// Assuming we have an authentication middleware that populates req.user. 
// For this prototype, we'll assume a mock middleware or that the controller handles it, 
// but strictly speaking 'authorize' needs 'req.user'. 
// Let's assume a 'authenticate' middleware exists or we mock it here for the flow.
const authenticate_1 = require("../middleware/authenticate"); // We need to create this or mock it.
const router = (0, express_1.Router)();
// Public
router.post('/', userController_1.register);
// Protected (User)
router.patch('/profile', authenticate_1.authenticate, userController_1.updateProfile);
router.get('/dashboard', authenticate_1.authenticate, userController_1.getDashboard);
// Search users (authenticated)
router.get('/search', authenticate_1.authenticate, userController_1.searchUsers);
// Admin Routes
router.patch('/admin/:id', authenticate_1.authenticate, (0, authorize_1.authorize)(['ADMIN']), userController_1.updateAdminUser);
router.post('/admin/:id/obfuscate', authenticate_1.authenticate, (0, authorize_1.authorize)(['ADMIN']), userController_1.obfuscateUser);
router.get('/admin/dashboard', authenticate_1.authenticate, (0, authorize_1.authorize)(['ADMIN']), userController_1.getAdminDashboard);
router.get('/admin/users', authenticate_1.authenticate, (0, authorize_1.authorize)(['ADMIN']), userController_1.getUsers);
exports.default = router;
