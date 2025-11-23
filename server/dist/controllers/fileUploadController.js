"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRegulationPDF = exports.uploadRegulationPDF = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Configure multer for PDF uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../uploads/regulations');
        // Create directory if it doesn't exist
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp_originalname
        const uniqueName = `${Date.now()}_${file.originalname}`;
        cb(null, uniqueName);
    }
});
// File filter: only PDFs
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    }
    else {
        cb(new Error('Only PDF files are allowed'));
    }
};
// Multer instance
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});
/**
 * Upload regulation PDF
 */
const uploadRegulationPDF = async (req, res) => {
    console.log('\n=== PDF UPLOAD ===');
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const fileUrl = `/uploads/regulations/${req.file.filename}`;
        console.log('✅ PDF uploaded:', req.file.filename);
        console.log('File size:', req.file.size, 'bytes');
        res.json({
            message: 'PDF uploaded successfully',
            url: fileUrl,
            filename: req.file.filename,
            size: req.file.size
        });
    }
    catch (error) {
        console.error('❌ Upload error:', error.message);
        res.status(500).json({ error: 'Failed to upload PDF' });
    }
};
exports.uploadRegulationPDF = uploadRegulationPDF;
/**
 * Download/serve regulation PDF
 */
const getRegulationPDF = async (req, res) => {
    const { filename } = req.params;
    try {
        const filePath = path_1.default.join(__dirname, '../../uploads/regulations', filename);
        if (!fs_1.default.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }
        res.sendFile(filePath);
    }
    catch (error) {
        console.error('❌ Download error:', error.message);
        res.status(500).json({ error: 'Failed to download PDF' });
    }
};
exports.getRegulationPDF = getRegulationPDF;
