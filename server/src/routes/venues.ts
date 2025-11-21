import { Router } from 'express';
import { createVenue, listVenues, getVenue, updateVenue, deleteVenue } from '../controllers/venueController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', listVenues);
router.get('/:id', getVenue);
router.post('/', authenticate, authorize(['ADMIN']), createVenue);
router.put('/:id', authenticate, authorize(['ADMIN']), updateVenue);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteVenue);

export default router;
