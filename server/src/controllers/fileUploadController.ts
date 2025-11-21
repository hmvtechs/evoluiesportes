import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for PDF uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/regulations');

        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
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
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'));
    }
};

// Multer instance
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

/**
 * Upload regulation PDF
 */
export const uploadRegulationPDF = async (req: Request, res: Response) => {
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
    } catch (error: any) {
        console.error('❌ Upload error:', error.message);
        res.status(500).json({ error: 'Failed to upload PDF' });
    }
};

/**
 * Download/serve regulation PDF
 */
export const getRegulationPDF = async (req: Request, res: Response) => {
    const { filename } = req.params;

    try {
        const filePath = path.join(__dirname, '../../uploads/regulations', filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.sendFile(filePath);
    } catch (error: any) {
        console.error('❌ Download error:', error.message);
        res.status(500).json({ error: 'Failed to download PDF' });
    }
};
