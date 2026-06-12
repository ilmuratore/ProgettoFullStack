const {
    buildPdfBuffer, drawDocHeader, drawKeyValue, drawLine, drawNotes,
    drawPageFooter, formatDate, formatNumber, safeText, PAGE_MARGIN
} = require('./pdfUtils');

const TIPO_LABEL = {
    CARICO_ACQUISTO:    'Carico da acquisto',
    SCARICO_VENDITA:    'Scarico per vendita',
    SPOSTAMENTO:        'Spostamento ubicazione',
    RETTIFICA_POSITIVA: 'Rettifica positiva (+)',
    RETTIFICA_NEGATIVA: 'Rettifica negativa (-)',
    RESO:               'Reso',
};

const buildMovimentoPdf = async ({ movimento }) => {
    const filename = `movimento-stock-${movimento.id}.pdf`;
    const buffer = await buildPdfBuffer((doc) => {
        const tipoLabel = TIPO_LABEL[movimento.tipo] || movimento.tipo;
        drawDocHeader(doc, tipoLabel, `MOV-${movimento.id}`, new Date());
        const y = 110;
        drawKeyValue(doc, 'Prodotto',    `${safeText(movimento.sku)} – ${safeText(movimento.prodotto)}`, PAGE_MARGIN, y, 300);
        drawKeyValue(doc, 'Quantità',    formatNumber(movimento.quantita), 430, y, 115);
        drawKeyValue(doc, 'Ubicazione',  safeText(movimento.ubicazione),   PAGE_MARGIN, y + 45, 200);
        drawKeyValue(doc, 'Riferimento', safeText(movimento.riferimento),  430, y + 45, 115);
        drawKeyValue(doc, 'Data',        formatDate(movimento.created_at), PAGE_MARGIN, y + 90, 200);
        doc.y = y + 135; drawLine(doc, doc.y); doc.moveDown(1.4);
        drawNotes(doc, movimento.note);
        drawPageFooter(doc);
    }, { info: { Title: `Movimento stock ${movimento.id}`, Author: 'LogiChain' } });
    return { buffer, filename };
};

module.exports = { buildMovimentoPdf };
