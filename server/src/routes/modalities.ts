import { Router } from 'express';
import { listModalities } from '../controllers/modalityController';

const router = Router();

router.get('/', listModalities);

export default router;
