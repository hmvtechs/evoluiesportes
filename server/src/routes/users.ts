import { Router } from 'express';
import { register, updateProfile, updateAdminUser, obfuscateUser, getAdminDashboard, getUsers, getDashboard, searchUsers } from '../controllers/userController';
import { authorize } from '../middleware/authorize';
// Assuming we have an authentication middleware that populates req.user. 
// For this prototype, we'll assume a mock middleware or that the controller handles it, 
// but strictly speaking 'authorize' needs 'req.user'. 
// Let's assume a 'authenticate' middleware exists or we mock it here for the flow.
import { authenticate } from '../middleware/authenticate'; // We need to create this or mock it.

const router = Router();

// Public
router.post('/', register);

// Protected (User)
router.patch('/profile', authenticate, updateProfile);
router.get('/dashboard', authenticate, getDashboard);

// Search users (authenticated)
router.get('/search', authenticate, searchUsers);

// Admin Routes
router.patch('/admin/:id', authenticate, authorize(['ADMIN']), updateAdminUser);
router.post('/admin/:id/obfuscate', authenticate, authorize(['ADMIN']), obfuscateUser);
router.get('/admin/dashboard', authenticate, authorize(['ADMIN']), getAdminDashboard);
router.get('/admin/users', authenticate, authorize(['ADMIN']), getUsers);

export default router;
