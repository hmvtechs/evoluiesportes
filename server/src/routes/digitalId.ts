import { Router } from 'express';
import { getDigitalID, uploadDocument, getDocuments, deactivateUser } from '../controllers/digitalIdController';

const router = Router();

router.get('/:id/digital-id', getDigitalID);
router.post('/documents', uploadDocument);
router.get('/:userId/documents', getDocuments);
router.post('/deactivate', deactivateUser);

export default router;
