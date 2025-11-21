import { Router } from 'express';
import { createBooking, listMyBookings, getVenueAvailability } from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createBooking);
router.get('/my', authenticate, listMyBookings);
router.get('/venue/:venueId/availability', getVenueAvailability);

export default router;
