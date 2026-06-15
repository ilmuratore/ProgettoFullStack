const validate = (blueprint) => {
    return (req, res, next) => {
        const errors = [];
        const body = req.body && typeof req.body === 'object' ? req.body : {};
        const fields = Object.keys(blueprint);
        const hasRequiredFields = fields.some((field) => blueprint[field].required);
        const isEmptyBody = Object.keys(body).length === 0;

        if (!hasRequiredFields && isEmptyBody) {
            const err = new Error('Nessun campo da aggiornare');
            err.code = 'VALIDATION_ERROR';
            err.status = 400;
            err.details = [{ field: 'body', message: 'Nessun campo da aggiornare' }];
            return next(err);
        }

        for (const field in blueprint) {
            const rules = blueprint[field];
            const value = body[field];

            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push({ field, message: `${field} è obbligatorio` });
                continue;
            }

            if (value === undefined || value === null) continue;

            if (rules.type && typeof value !== rules.type) {
                errors.push({ field, message: `${field} deve essere di tipo ${rules.type}` });
            }

            if (rules.enum && Array.isArray(rules.enum) && !rules.enum.includes(value)) {
                errors.push({ field, message: `${field} deve essere uno di: ${rules.enum.join(', ')}` });
            }

            if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
                errors.push({ field, message: `${field} deve avere almeno ${rules.minLength} caratteri` });
            }

            if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
                errors.push({ field, message: `${field} deve avere massimo ${rules.maxLength} caratteri` });
            }

            if (rules.integer && typeof value === 'number' && !Number.isInteger(value)) {
                errors.push({ field, message: `${field} deve essere un numero intero` });
            }

            if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
                errors.push({ field, message: `${field} deve essere >= ${rules.min}` });
            }

            if (rules.max !== undefined && typeof value === 'number' && value > rules.max) {
                errors.push({ field, message: `${field} deve essere <= ${rules.max}` });
            }
        }

        if (errors.length > 0) {
            const err = new Error('Errore di validazione');
            err.code = 'VALIDATION_ERROR';
            err.status = 400;
            err.details = errors;
            return next(err);
        }

        next();
    };
};

module.exports ={  validate };
