import { Router } from 'express';
import { getDigitalID, uploadDocument, getDocuments, deactivateUser } from '../controllers/digitalIdController';
import multer from 'multer';

const router = Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

router.get('/:id/digital-id', getDigitalID);
router.post('/documents', upload.single('file'), uploadDocument);
router.get('/:userId/documents', getDocuments);
router.post('/deactivate', deactivateUser);

export default router;
