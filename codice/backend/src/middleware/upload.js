const multer = require('multer');

const ALLOWED_MIME_TYPES = new Set([
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/octet-stream'
]);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const lower = (file.originalname || '').toLowerCase();
        const isAllowedExtension = lower.endsWith('.csv') || lower.endsWith('.xlsx');
        const isAllowedMime = ALLOWED_MIME_TYPES.has(file.mimetype);

        if (!isAllowedExtension || !isAllowedMime) {
            const err = new Error('Formato file non supportato. Usa CSV o XLSX');
            err.code = 'VALIDATION_ERROR';
            err.details = [{ field: 'file', message: 'Sono ammessi solo file .csv o .xlsx' }];
            return cb(err);
        }

        cb(null, true);
    }
});

module.exports = {
    uploadSingleImportFile: upload.single('file')
};
