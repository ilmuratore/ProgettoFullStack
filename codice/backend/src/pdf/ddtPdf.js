const {
    buildPdfBuffer, drawDocHeader, drawKeyValue, drawTableHeader, drawTableRows,
    drawPageFooter, drawNotes, drawLine, ensureSpace,
    formatDate, formatNumber, safeText, PAGE_MARGIN
} = require('./pdfUtils');

const COLUMNS = [
    { key: 'sku',      label: 'SKU',      x: 50,  width: 65,  align: 'left'  },
    { key: 'prodotto', label: 'Prodotto', x: 120, width: 200, align: 'left'  },
    { key: 'quantita', label: 'Quantità', x: 325, width: 70,  align: 'right' },
    { key: 'note',     label: 'Note',     x: 400, width: 145, align: 'left'  },
];

const buildDdtPdf = async ({ ddt, spedizione, righe }) => {
    const filename = `ddt-${ddt.numero_ddt}.pdf`;
    const buffer = await buildPdfBuffer((doc) => {
        drawDocHeader(doc, 'Documento di Trasporto', `DDT n. ${ddt.numero_ddt}`, ddt.data_ddt);
        const y = 110;
        drawKeyValue(doc, 'Destinatario',     spedizione.cliente,              PAGE_MARGIN, y,      240);
        drawKeyValue(doc, 'Indirizzo',        spedizione.destinazione,         330,         y,      120);
        drawKeyValue(doc, 'Data DDT',         formatDate(ddt.data_ddt),        455,         y,      90);
        drawKeyValue(doc, 'Corriere',         safeText(spedizione.corriere),   PAGE_MARGIN, y + 45, 150);
        drawKeyValue(doc, 'Tracking',         safeText(spedizione.tracking_number), 210,   y + 45, 120);
        drawKeyValue(doc, 'Stato sped.',      spedizione.stato,                355,         y + 45, 90);
        if (ddt.trasportatore) drawKeyValue(doc, 'Trasportatore', ddt.trasportatore, PAGE_MARGIN, y + 90, 240);
        doc.y = y + (ddt.trasportatore ? 140 : 95); drawLine(doc, doc.y); doc.moveDown(1.4);

        doc.font('Helvetica-Bold').fontSize(12).text('Articoli trasportati');
        doc.y += 10;
        drawTableHeader(doc, COLUMNS, doc.y);
        drawTableRows(doc, COLUMNS, righe, (r) => ({
            sku: safeText(r.sku), prodotto: safeText(r.prodotto),
            quantita: formatNumber(r.quantita), note: safeText(r.note),
        }));

        ensureSpace(doc, 80);
        doc.y += 20;
        const sy = doc.y;
        doc.font('Helvetica').fontSize(9).text('Firma conducente', PAGE_MARGIN, sy);
        drawLine(doc, sy + 35);
        doc.font('Helvetica').fontSize(9).text('Firma destinatario', 330, sy);
        doc.moveTo(330, sy + 35).lineTo(545, sy + 35).strokeColor('#333333').stroke();
        doc.moveDown(3);
        drawNotes(doc, ddt.note);
        drawPageFooter(doc);
    }, { info: { Title: `DDT ${ddt.numero_ddt}`, Author: 'LogiChain' } });
    return { buffer, filename };
};

module.exports = { buildDdtPdf };
