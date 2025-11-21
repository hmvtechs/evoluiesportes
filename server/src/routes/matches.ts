import { Router } from 'express';
import { getLineup, addEvent, updateStatus, createMatch } from '../controllers/matchController';

const router = Router();

router.get('/:id/lineup', getLineup);
router.post('/:id/events', addEvent);
router.patch('/:id/status', updateStatus);
router.post('/', createMatch);

export default router;
