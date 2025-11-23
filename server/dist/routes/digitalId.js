"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const digitalIdController_1 = require("../controllers/digitalIdController");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
// Configure multer for memory storage
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    }
});
router.get('/:id/digital-id', digitalIdController_1.getDigitalID);
router.post('/documents', upload.single('file'), digitalIdController_1.uploadDocument);
router.get('/:userId/documents', digitalIdController_1.getDocuments);
router.post('/deactivate', digitalIdController_1.deactivateUser);
exports.default = router;
