module.exports = (blueprint) => {
    return (req, res, next) => {
        const errors = [];

        for (const field in blueprint) {
            const rules = blueprint[field];
            const value = req.body[field];

            // Campo richiesto ma mancante
            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push({
                    field,
                    message: `${field} è obbligatorio`
                });
                continue;
            }

            // Se il campo non è richiesto e non è presente → skip
            if (value === undefined || value === null) continue;

            // Tipo
            if (rules.type && typeof value !== rules.type) {
                errors.push({
                    field,
                    message: `${field} deve essere di tipo ${rules.type}`
                });
            }

            // Min length (solo stringhe)
            if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
                errors.push({
                    field,
                    message: `${field} deve avere almeno ${rules.minLength} caratteri`
                });
            }

            // Max length (solo stringhe)
            if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
                errors.push({
                    field,
                    message: `${field} deve avere massimo ${rules.maxLength} caratteri`
                });
            }

            // Min (solo numeri)
            if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
                errors.push({
                    field,
                    message: `${field} deve essere >= ${rules.min}`
                });
            }

            // Max (solo numeri)
            if (rules.max !== undefined && typeof value === 'number' && value > rules.max) {
                errors.push({
                    field,
                    message: `${field} deve essere <= ${rules.max}`
                });
            }
        }

        // Se ci sono errori → 400 VALIDATION_ERROR
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
