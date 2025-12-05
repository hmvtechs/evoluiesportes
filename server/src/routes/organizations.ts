import { Router } from 'express';
import { listOrganizations, getOrganization, createOrganization, updateOrganization, deleteOrganization } from '../controllers/organizationController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

// TEMP: Removed auth from organization list and create to fix team registration
router.get('/', listOrganizations);
router.get('/:id', getOrganization);
router.post('/', createOrganization);
router.put('/:id', authenticate, authorize(['ADMIN']), updateOrganization);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteOrganization);

export default router;
