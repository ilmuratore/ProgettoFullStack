const nodemailer = require('nodemailer');
const { getMailConfig } = require('../config/mail');

let transporter;

const getTransporter = () => {
    if (!transporter) {
        const config = getMailConfig();
        transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: config.auth,
            tls: config.tls,
        });
    }

    return transporter;
};

const normalizeAddressList = (value) => {
    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return value
            .flatMap((item) => normalizeAddressList(item))
            .filter(Boolean);
    }

    return String(value)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
};

const sendMail = async ({ to, cc, bcc, subject, text, html, attachments = [] }) => {
    const recipients = normalizeAddressList(to);

    if (recipients.length === 0) {
        const err = new Error('Destinatario email obbligatorio');
        err.code = 'VALIDATION_ERROR';
        err.details = [{ field: 'to', message: 'Indica almeno un destinatario valido' }];
        throw err;
    }

    const config = getMailConfig();
    const info = await getTransporter().sendMail({
        from: `"${config.from.name}" <${config.from.address}>`,
        to: recipients.join(', '),
        cc: normalizeAddressList(cc).join(', ') || undefined,
        bcc: normalizeAddressList(bcc).join(', ') || undefined,
        subject,
        text,
        html,
        attachments,
    });

    return info;
};

module.exports = {
    sendMail,
    normalizeAddressList,
};
