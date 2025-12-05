import { Router } from 'express';
import { listOrganizations, getOrganization, createOrganization, updateOrganization, deleteOrganization } from '../controllers/organizationController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

router.get('/', authenticate, listOrganizations);
router.get('/:id', authenticate, authorize(['ADMIN']), getOrganization);
router.post('/', authenticate, createOrganization);
router.put('/:id', authenticate, authorize(['ADMIN']), updateOrganization);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteOrganization);

export default router;
