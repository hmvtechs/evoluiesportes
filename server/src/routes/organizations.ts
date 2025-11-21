import { Router } from 'express';
import { listOrganizations, getOrganization, createOrganization } from '../controllers/organizationController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

router.get('/', authenticate, authorize(['ADMIN']), listOrganizations);
router.get('/:id', authenticate, authorize(['ADMIN']), getOrganization);
router.post('/', authenticate, authorize(['ADMIN']), createOrganization);

export default router;
