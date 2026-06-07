module.exports = (blueprint) => {
    return (req, res, next) => {
        const errors = [];

        for (const field in blueprint) {
            const rules = blueprint[field];
            const value = req.body[field];

            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push({
                    field,
                    message: `${field} è obbligatorio`
                });
                continue;
            }

            if (value === undefined || value === null) continue;

            if (rules.type && typeof value !== rules.type) {
                errors.push({
                    field,
                    message: `${field} deve essere di tipo ${rules.type}`
                });
            }

            if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
                errors.push({
                    field,
                    message: `${field} deve avere almeno ${rules.minLength} caratteri`
                });
            }

            if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
                errors.push({
                    field,
                    message: `${field} deve avere massimo ${rules.maxLength} caratteri`
                });
            }

            if (rules.integer && typeof value === 'number' && !Number.isInteger(value)) {
                errors.push({
                    field,
                    message: `${field} deve essere un numero intero`
                });
            }

            if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
                errors.push({
                    field,
                    message: `${field} deve essere >= ${rules.min}`
                });
            }

            if (rules.max !== undefined && typeof value === 'number' && value > rules.max) {
                errors.push({
                    field,
                    message: `${field} deve essere <= ${rules.max}`
                });
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                status: 'error',
                code: 'VALIDATION_ERROR',
                message: 'Errore di validazione',
                details: errors
            });
        }

        return next();
    };
};
