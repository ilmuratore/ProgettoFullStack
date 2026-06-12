const PDFDocument = require('pdfkit');

const PAGE_MARGIN = 50;
const TABLE_TOP_MARGIN = 10;
const ROW_HEIGHT = 22;

const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

const formatNumber = (value) =>
    new Intl.NumberFormat('it-IT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value || 0));

const formatCurrency = (value) => `${formatNumber(value)} EUR`;

const safeText = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    return String(value);
};

const buildPdfBuffer = (render, options = {}) =>
    new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: 'A4',
            margin: PAGE_MARGIN,
            bufferPages: true,
            info: options.info || {},
        });

        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        Promise.resolve()
            .then(() => render(doc))
            .then(() => doc.end())
            .catch(reject);
    });

const drawLine = (doc, y) => {
    doc.moveTo(PAGE_MARGIN, y)
        .lineTo(doc.page.width - PAGE_MARGIN, y)
        .strokeColor('#cccccc')
        .stroke();
};

const ensureSpace = (doc, neededHeight) => {
    const bottom = doc.page.height - PAGE_MARGIN;
    if (doc.y + neededHeight > bottom) {
        doc.addPage();
    }
};

const drawKeyValue = (doc, label, value, x, y, width = 220) => {
    doc.font('Helvetica-Bold').fontSize(9).text(label, x, y, { width });
    doc.font('Helvetica').fontSize(10).text(safeText(value), x, y + 12, { width });
};

const formatCompanyAddress = (azienda) => {
    if (!azienda) return null;

    const cityLine = [azienda.cap, azienda.citta, azienda.provincia ? `(${azienda.provincia})` : null]
        .filter(Boolean)
        .join(' ');

    return [azienda.indirizzo, cityLine, azienda.nazione]
        .filter(Boolean)
        .join(' - ');
};

const drawHeader = (doc, ordine, azienda) => {
    const companyName = azienda?.ragione_sociale || 'LogiChain ERP';
    const companyAddress = formatCompanyAddress(azienda);
    const companyFiscal = [
        azienda?.piva ? `P.IVA ${azienda.piva}` : null,
        azienda?.codice_fiscale ? `CF ${azienda.codice_fiscale}` : null,
    ].filter(Boolean).join(' - ');

    doc.font('Helvetica-Bold').fontSize(20).text('Ordine di acquisto', PAGE_MARGIN, 45);
    doc.font('Helvetica').fontSize(10).text(`PO-${ordine.id}`, PAGE_MARGIN, 70);

    let y = 45;
    doc.font('Helvetica-Bold')
        .fontSize(10)
        .text(companyName, 340, y, { width: 205, align: 'right' });

    y += 14;
    doc.font('Helvetica').fontSize(8);

    [companyFiscal, companyAddress, azienda?.email, azienda?.telefono].filter(Boolean).forEach((line) => {
        doc.text(line, 340, y, { width: 205, align: 'right' });
        y += 10;
    });

    doc.text(`Generato il ${formatDate(new Date())}`, 340, y, { width: 205, align: 'right' });

    drawLine(doc, 102);
    doc.y = 108;
    doc.moveDown(2);
};

const drawInfoSection = (doc, ordine) => {
    const y = 125;

    drawKeyValue(doc, 'Fornitore', ordine.fornitore, PAGE_MARGIN, y, 240);
    drawKeyValue(doc, 'Stato', ordine.stato, 330, y, 100);
    drawKeyValue(doc, 'Data prevista', formatDate(ordine.data_prevista), 455, y, 90);

    drawKeyValue(doc, 'Creato da', ordine.utente, PAGE_MARGIN, y + 45, 240);
    drawKeyValue(doc, 'Data creazione', formatDate(ordine.created_at), 330, y + 45, 100);
    drawKeyValue(doc, 'Totale ordine', formatCurrency(ordine.importo_totale), 455, y + 45, 90);

    doc.y = y + 95;
    drawLine(doc, doc.y);
    doc.moveDown(1.4);
};

const tableColumns = [
    { key: 'sku', label: 'SKU', x: 50, width: 65, align: 'left' },
    { key: 'prodotto', label: 'Prodotto', x: 120, width: 190, align: 'left' },
    { key: 'quantita_ordinata', label: 'Qta ord.', x: 315, width: 55, align: 'right' },
    { key: 'quantita_ricevuta', label: 'Qta ric.', x: 375, width: 55, align: 'right' },
    { key: 'prezzo_unitario', label: 'Prezzo', x: 435, width: 60, align: 'right' },
    { key: 'totale_riga', label: 'Totale', x: 500, width: 45, align: 'right' },
];

const drawTableHeader = (doc, y) => {
    doc.font('Helvetica-Bold').fontSize(8);
    tableColumns.forEach((col) => {
        doc.text(col.label, col.x, y, { width: col.width, align: col.align });
    });
    drawLine(doc, y + 14);
    doc.y = y + 20;
};

const drawRows = (doc, righe) => {
    doc.font('Helvetica-Bold').fontSize(12).text('Righe ordine');
    doc.y += TABLE_TOP_MARGIN;

    drawTableHeader(doc, doc.y);

    righe.forEach((riga) => {
        ensureSpace(doc, ROW_HEIGHT + 18);

        if (doc.y < 80) {
            drawTableHeader(doc, doc.y);
        }

        const y = doc.y;
        const totale = Number(riga.totale_riga || 0) ||
            Number(riga.quantita_ordinata || 0) * Number(riga.prezzo_unitario || 0);

        const values = {
            sku: safeText(riga.sku),
            prodotto: safeText(riga.prodotto),
            quantita_ordinata: formatNumber(riga.quantita_ordinata),
            quantita_ricevuta: formatNumber(riga.quantita_ricevuta),
            prezzo_unitario: formatCurrency(riga.prezzo_unitario),
            totale_riga: formatCurrency(totale),
        };

        doc.font('Helvetica').fontSize(8);
        tableColumns.forEach((col) => {
            doc.text(values[col.key], col.x, y, {
                width: col.width,
                align: col.align,
                ellipsis: true,
            });
        });

        doc.y = y + ROW_HEIGHT;
    });

    drawLine(doc, doc.y);
    doc.moveDown(1);
};

const drawTotals = (doc, righe) => {
    const totale = righe.reduce((sum, riga) => {
        const totaleRiga = Number(riga.totale_riga || 0) ||
            Number(riga.quantita_ordinata || 0) * Number(riga.prezzo_unitario || 0);
        return sum + totaleRiga;
    }, 0);

    ensureSpace(doc, 45);
    doc.font('Helvetica-Bold')
        .fontSize(11)
        .text('Totale', 390, doc.y, { width: 80, align: 'right' })
        .text(formatCurrency(totale), 475, doc.y - 13, { width: 70, align: 'right' });
    doc.moveDown(2);
};

const drawNotes = (doc, ordine) => {
    if (!ordine.note) return;

    ensureSpace(doc, 80);
    doc.font('Helvetica-Bold').fontSize(12).text('Note');
    doc.moveDown(0.4);
    doc.font('Helvetica').fontSize(9).text(ordine.note, {
        width: doc.page.width - PAGE_MARGIN * 2,
        align: 'left',
    });
};

const drawFooter = (doc) => {
    const range = doc.bufferedPageRange();

    for (let i = range.start; i < range.start + range.count; i += 1) {
        doc.switchToPage(i);
        const pageNumber = i + 1;
        const text = `Pagina ${pageNumber} di ${range.count}`;

        doc.font('Helvetica')
            .fontSize(8)
            .fillColor('#666666')
            .text(text, PAGE_MARGIN, doc.page.height - 35, {
                width: doc.page.width - PAGE_MARGIN * 2,
                align: 'center',
            })
            .fillColor('#000000');
    }
};

const buildOrdineAcquistoPdf = async ({ ordine, righe, azienda }) => {
    const filename = `ordine-acquisto-${ordine.id}.pdf`;

    const buffer = await buildPdfBuffer((doc) => {
        drawHeader(doc, ordine, azienda);
        drawInfoSection(doc, ordine);
        drawRows(doc, righe);
        drawTotals(doc, righe);
        drawNotes(doc, ordine);
        drawFooter(doc);
    }, {
        info: {
            Title: `Ordine di acquisto ${ordine.id}`,
            Author: azienda?.ragione_sociale || 'LogiChain ERP',
            Subject: 'Ordine di acquisto',
        },
    });

    return { buffer, filename };
};

module.exports = { buildOrdineAcquistoPdf };
