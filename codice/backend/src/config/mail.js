const requiredEnv = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_FROM_EMAIL'];

const getMailConfig = () => {
    const missing = requiredEnv.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        const err = new Error(`Configurazione SMTP incompleta: ${missing.join(', ')}`);
        err.code = 'EMAIL_CONFIG_MISSING';
        throw err;
    }

    const secure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';

    const auth = process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        }
        : undefined;

    return {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure,
        auth,
        tls: {
            rejectUnauthorized: String(process.env.SMTP_REJECT_UNAUTHORIZED || 'true').toLowerCase() !== 'false',
        },
        from: {
            name: process.env.SMTP_FROM_NAME || 'LogiChain ERP',
            address: process.env.SMTP_FROM_EMAIL,
        },
    };
};

module.exports = { getMailConfig };
