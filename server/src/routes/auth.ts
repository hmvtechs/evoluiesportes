import { Router } from 'express';
import { login, validateRF, setup2FA } from '../controllers/authController';

const router = Router();

router.post('/login', login);
router.post('/validate-rf', validateRF);
router.post('/2fa/setup', setup2FA);

export default router;
