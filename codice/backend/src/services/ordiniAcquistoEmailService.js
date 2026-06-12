const pool = require('../config/db');
const ordiniAcquistoModel = require('../models/ordini_acquistoModel');
const fornitoriModel = require('../models/fornitoriModel');
const emailLogModel = require('../models/ordini_acquisto_email_logModel');
const ordiniAcquistoService = require('./ordiniAcquistoService');
const emailService = require('./emailService');

const throwError = (code, message, details) => {
    const err = new Error(message);
    err.code = code;
    if (details) err.details = details;
    throw err;
};

const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const nl2br = (value) => escapeHtml(value).replace(/\r?\n/g, '<br>');

const getSupplierEmail = async (ordine) => {
    const fornitoreRes = await fornitoriModel.findById(ordine.fornitore_id);
    const fornitore = fornitoreRes.rows[0];
    return fornitore?.email || null;
};

const buildDefaultSubject = (ordine) => `Ordine di acquisto PO-${ordine.id} - ${ordine.fornitore}`;

const buildDefaultMessage = (ordine) => [
    'Buongiorno,',
    '',
    `in allegato trasmettiamo il documento relativo all'ordine di acquisto PO-${ordine.id}.`,
    '',
    'Cordiali saluti.',
].join('\n');

const buildHtmlBody = ({ ordine, message, hasContabile }) => `
    <p>${nl2br(message)}</p>
    <hr>
    <p>
        <strong>Riferimento ordine:</strong> PO-${escapeHtml(ordine.id)}<br>
        <strong>Fornitore:</strong> ${escapeHtml(ordine.fornitore)}<br>
        <strong>Stato:</strong> ${escapeHtml(ordine.stato)}
    </p>
    <p>
        Allegati:<br>
        - Documento ordine di acquisto PDF<br>
        ${hasContabile ? '- Contabile bonifico<br>' : ''}
    </p>
`;

const buildContabileAttachment = (file) => {
    if (!file) return null;

    return {
        filename: file.originalname,
        content: file.buffer,
        contentType: file.mimetype,
    };
};

const createEmailLog = async (payload, client = pool) => {
    const result = await emailLogModel.create(payload, client);
    return result.rows[0];
};

const inviaOrdineAcquistoEmail = async ({ ordineId, userId, payload = {}, contabileFile }) => {
    const ordineCompleto = await ordiniAcquistoService.getOrdineAcquistoById(ordineId);
    const ordine = ordineCompleto.ordine;

    if (!ordine) {
        throwError('RESOURCE_NOT_FOUND', 'Ordine di acquisto non trovato');
    }

    if (ordine.stato === 'ANNULLATO') {
        throwError('STATE_TRANSITION_INVALID', 'Non puoi inviare via email un ordine annullato');
    }

    const supplierEmail = await getSupplierEmail(ordine);
    const to = payload.to || supplierEmail;

    if (!to) {
        throwError('VALIDATION_ERROR', 'Il fornitore non ha una email configurata', [
            { field: 'to', message: 'Indica un destinatario oppure valorizza email sul fornitore' },
        ]);
    }

    const subject = payload.subject || buildDefaultSubject(ordine);
    const message = payload.message || buildDefaultMessage(ordine);

    const { buffer: ordinePdfBuffer, filename: ordinePdfFilename } = await ordiniAcquistoService.generaPdfOrdineAcquisto(ordineId);
    const contabileAttachment = buildContabileAttachment(contabileFile);

    const attachments = [
        {
            filename: ordinePdfFilename,
            content: ordinePdfBuffer,
            contentType: 'application/pdf',
        },
        ...(contabileAttachment ? [contabileAttachment] : []),
    ];

    const logBase = {
        ordine_acquisto_id: Number(ordineId),
        utente_id: userId || null,
        destinatario: Array.isArray(to) ? to.join(', ') : String(to),
        cc: payload.cc || null,
        bcc: payload.bcc || null,
        subject,
        body: message,
        allegato_ordine_filename: ordinePdfFilename,
        allegato_contabile_filename: contabileFile?.originalname || null,
        allegato_contabile_mime: contabileFile?.mimetype || null,
        allegato_contabile_size: contabileFile?.size || null,
    };

    let info;

    try {
        info = await emailService.sendMail({
            to,
            cc: payload.cc,
            bcc: payload.bcc,
            subject,
            text: message,
            html: buildHtmlBody({ ordine, message, hasContabile: Boolean(contabileFile) }),
            attachments,
        });
    } catch (err) {
        await createEmailLog({
            ...logBase,
            stato: 'FALLITA',
            errore: err.message,
        });

        const wrapped = new Error(`Invio email fallito: ${err.message}`);
        wrapped.code = err.code === 'VALIDATION_ERROR' ? 'VALIDATION_ERROR' : 'EMAIL_SEND_FAILED';
        wrapped.details = err.details;
        throw wrapped;
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const log = await createEmailLog({
            ...logBase,
            stato: 'INVIATA',
            provider_message_id: info.messageId || null,
            sent_at: new Date(),
        }, client);

        if (ordine.stato === 'BOZZA') {
            await ordiniAcquistoModel.updateStato(ordineId, 'INVIATO', client);
        }

        await client.query('COMMIT');

        return {
            ordine_id: Number(ordineId),
            email_log: log,
            message_id: info.messageId || null,
            stato_ordine: ordine.stato === 'BOZZA' ? 'INVIATO' : ordine.stato,
        };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const listInviiEmailOrdineAcquisto = async (ordineId) => {
    const result = await emailLogModel.findByOrdineAcquistoId(ordineId);
    return result.rows;
};

module.exports = {
    inviaOrdineAcquistoEmail,
    listInviiEmailOrdineAcquisto,
};
