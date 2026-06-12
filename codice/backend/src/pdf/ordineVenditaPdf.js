const {
    buildPdfBuffer, drawDocHeader, drawKeyValue, drawTableHeader, drawTableRows,
    drawPageFooter, drawNotes, drawLine, ensureSpace,
    formatDate, formatCurrency, formatNumber, safeText, PAGE_MARGIN
} = require('./pdfUtils');

const COLUMNS = [
    { key: 'sku',             label: 'SKU',      x: 50,  width: 65,  align: 'left'  },
    { key: 'prodotto',        label: 'Prodotto', x: 120, width: 195, align: 'left'  },
    { key: 'quantita',        label: 'Qta',      x: 320, width: 45,  align: 'right' },
    { key: 'prezzo_unitario', label: 'Prezzo',   x: 370, width: 70,  align: 'right' },
    { key: 'totale_riga',     label: 'Totale',   x: 445, width: 70,  align: 'right' },
];

const buildOrdineVenditaPdf = async ({ ordine, righe }) => {
    const filename = `ordine-vendita-${ordine.id}.pdf`;
    const buffer = await buildPdfBuffer((doc) => {
        drawDocHeader(doc, 'Ordine di vendita', `SO-${ordine.id}`, new Date());
        const y = 110;
        drawKeyValue(doc, 'Cliente',        ordine.cliente,                          PAGE_MARGIN, y,      240);
        drawKeyValue(doc, 'Stato',          ordine.stato,                            330,         y,      100);
        drawKeyValue(doc, 'Data consegna',  formatDate(ordine.data_consegna_richiesta), 455,      y,      90);
        drawKeyValue(doc, 'Destinazione',   ordine.destinazione,                     PAGE_MARGIN, y + 45, 240);
        drawKeyValue(doc, 'Stato picking',  ordine.stato_picking,                    330,         y + 45, 100);
        drawKeyValue(doc, 'Totale',         formatCurrency(ordine.importo_totale),   455,         y + 45, 90);
        doc.y = y + 95; drawLine(doc, doc.y); doc.moveDown(1.4);

        doc.font('Helvetica-Bold').fontSize(12).text('Righe ordine');
        doc.y += 10;
        drawTableHeader(doc, COLUMNS, doc.y);
        drawTableRows(doc, COLUMNS, righe, (r) => ({
            sku:             safeText(r.sku),
            prodotto:        safeText(r.prodotto),
            quantita:        formatNumber(r.quantita),
            prezzo_unitario: formatCurrency(r.prezzo_unitario),
            totale_riga:     formatCurrency(Number(r.quantita) * Number(r.prezzo_unitario)),
        }));

        const totale = righe.reduce((s, r) => s + Number(r.quantita) * Number(r.prezzo_unitario), 0);
        ensureSpace(doc, 45);
        doc.font('Helvetica-Bold').fontSize(11)
            .text('Totale', 370, doc.y, { width: 70, align: 'right' })
            .text(formatCurrency(totale), 445, doc.y - 13, { width: 70, align: 'right' });
        doc.moveDown(2);
        drawNotes(doc, ordine.note);
        drawPageFooter(doc);
    }, { info: { Title: `Ordine di vendita ${ordine.id}`, Author: 'LogiChain' } });
    return { buffer, filename };
};

module.exports = { buildOrdineVenditaPdf };
