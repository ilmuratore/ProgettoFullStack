const multer = require('multer');

const MAX_FILE_SIZE_MB = Number(process.env.CONTABILE_MAX_FILE_SIZE_MB || 10);

const ALLOWED_FILES = [
    { extension: '.pdf', mime: 'application/pdf' },
    { extension: '.jpg', mime: 'image/jpeg' },
    { extension: '.jpeg', mime: 'image/jpeg' },
    { extension: '.png', mime: 'image/png' },
    { extension: '.webp', mime: 'image/webp' },
];

const isAllowedFile = (file) => {
    const originalName = String(file.originalname || '').toLowerCase();
    return ALLOWED_FILES.some(({ extension, mime }) => originalName.endsWith(extension) && file.mimetype === mime);
};

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (!isAllowedFile(file)) {
            const err = new Error('Formato contabile non supportato. Usa PDF, JPG, PNG o WEBP');
            err.code = 'VALIDATION_ERROR';
            err.details = [{ field: 'contabile', message: 'Sono ammessi solo file .pdf, .jpg, .jpeg, .png, .webp' }];
            return cb(err);
        }

        cb(null, true);
    },
});

module.exports = {
    uploadSingleContabile: upload.single('contabile'),
};
