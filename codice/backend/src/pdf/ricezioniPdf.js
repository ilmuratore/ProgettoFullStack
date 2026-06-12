const {
    buildPdfBuffer, drawDocHeader, drawKeyValue, drawTableHeader, drawTableRows,
    drawPageFooter, drawNotes, drawLine, formatDate, formatNumber, safeText, PAGE_MARGIN
} = require('./pdfUtils');

const COLUMNS = [
    { key: 'sku',               label: 'SKU',        x: 50,  width: 65,  align: 'left'  },
    { key: 'prodotto',          label: 'Prodotto',   x: 120, width: 170, align: 'left'  },
    { key: 'quantita_ricevuta', label: 'Qta ric.',   x: 295, width: 55,  align: 'right' },
    { key: 'ubicazione',        label: 'Ubicazione', x: 355, width: 80,  align: 'left'  },
    { key: 'magazzino',         label: 'Magazzino',  x: 440, width: 105, align: 'left'  },
];

const buildRicezioniPdf = async ({ ricezione, righe }) => {
    const filename = `ricezione-${ricezione.id}.pdf`;
    const buffer = await buildPdfBuffer((doc) => {
        drawDocHeader(doc, 'Bolla di ricezione', `RIC-${ricezione.id}`, new Date());
        const y = 110;
        drawKeyValue(doc, 'Fornitore',       ricezione.fornitore,                   PAGE_MARGIN, y,      240);
        drawKeyValue(doc, 'Ordine acquisto', `PO-${ricezione.ordine_acquisto_id}`,  330,         y,      100);
        drawKeyValue(doc, 'Data ricezione',  formatDate(ricezione.data_ricezione),  455,         y,      90);
        drawKeyValue(doc, 'Ricevuto da',     ricezione.utente,                      PAGE_MARGIN, y + 45, 240);
        drawKeyValue(doc, 'Stato ordine',    ricezione.stato_ordine,                330,         y + 45, 100);
        drawKeyValue(doc, 'N° righe',        String(righe.length),                  455,         y + 45, 90);
        doc.y = y + 95; drawLine(doc, doc.y); doc.moveDown(1.4);

        doc.font('Helvetica-Bold').fontSize(12).text('Articoli ricevuti');
        doc.y += 10;
        drawTableHeader(doc, COLUMNS, doc.y);
        drawTableRows(doc, COLUMNS, righe, (r) => ({
            sku:               safeText(r.sku),
            prodotto:          safeText(r.prodotto),
            quantita_ricevuta: formatNumber(r.quantita_ricevuta),
            ubicazione:        safeText(r.ubicazione),
            magazzino:         safeText(r.magazzino),
        }));
        drawNotes(doc, ricezione.note);
        drawPageFooter(doc);
    }, { info: { Title: `Bolla di ricezione ${ricezione.id}`, Author: 'LogiChain' } });
    return { buffer, filename };
};

module.exports = { buildRicezioniPdf };
