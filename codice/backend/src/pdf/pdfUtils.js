const PDFDocument = require('pdfkit');

const PAGE_MARGIN = 50;
const ROW_HEIGHT = 22;

const formatDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatNumber = (value) =>
    new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0));

const formatCurrency = (value) => `${formatNumber(value)} EUR`;

const safeText = (value) => (value === null || value === undefined || value === '') ? '-' : String(value);

const buildPdfBuffer = (render, options = {}) =>
    new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: PAGE_MARGIN, bufferPages: true, info: options.info || {} });
        const chunks = [];
        doc.on('data', (c) => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
        Promise.resolve().then(() => render(doc)).then(() => doc.end()).catch(reject);
    });

const drawLine = (doc, y, color = '#cccccc') => {
    doc.moveTo(PAGE_MARGIN, y).lineTo(doc.page.width - PAGE_MARGIN, y).strokeColor(color).stroke();
};

const ensureSpace = (doc, needed) => {
    if (doc.y + needed > doc.page.height - PAGE_MARGIN) doc.addPage();
};

const drawKeyValue = (doc, label, value, x, y, width = 220) => {
    doc.font('Helvetica-Bold').fontSize(9).text(label, x, y, { width });
    doc.font('Helvetica').fontSize(10).text(safeText(value), x, y + 12, { width });
};

const drawTableHeader = (doc, columns, y) => {
    doc.font('Helvetica-Bold').fontSize(8);
    columns.forEach((col) => doc.text(col.label, col.x, y, { width: col.width, align: col.align || 'left' }));
    drawLine(doc, y + 14);
    doc.y = y + 20;
};

const drawTableRows = (doc, columns, rows, valueMapper) => {
    rows.forEach((row) => {
        ensureSpace(doc, ROW_HEIGHT + 18);
        if (doc.y < 80) drawTableHeader(doc, columns, doc.y);
        const y = doc.y;
        const values = valueMapper(row);
        doc.font('Helvetica').fontSize(8);
        columns.forEach((col) => doc.text(safeText(values[col.key]), col.x, y, { width: col.width, align: col.align || 'left', ellipsis: true }));
        doc.y = y + ROW_HEIGHT;
    });
    drawLine(doc, doc.y);
    doc.moveDown(1);
};

const drawPageFooter = (doc) => {
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.font('Helvetica').fontSize(8).fillColor('#666666')
            .text(`Pagina ${i + 1} di ${range.count}`, PAGE_MARGIN, doc.page.height - 35, {
                width: doc.page.width - PAGE_MARGIN * 2, align: 'center'
            }).fillColor('#000000');
    }
};

const drawDocHeader = (doc, title, subtitle, refDate) => {
    doc.font('Helvetica-Bold').fontSize(20).text(title, PAGE_MARGIN, 45);
    doc.font('Helvetica').fontSize(10).text(subtitle, PAGE_MARGIN, 70);
    doc.font('Helvetica-Bold').fontSize(10).text('LogiChain', 390, 45, { width: 155, align: 'right' });
    doc.font('Helvetica').fontSize(9).text(`Generato il ${formatDate(refDate || new Date())}`, 390, 62, { width: 155, align: 'right' });
    drawLine(doc, 92);
    doc.moveDown(2);
};

const drawNotes = (doc, note) => {
    if (!note) return;
    ensureSpace(doc, 80);
    doc.font('Helvetica-Bold').fontSize(12).text('Note');
    doc.moveDown(0.4);
    doc.font('Helvetica').fontSize(9).text(note, { width: doc.page.width - PAGE_MARGIN * 2 });
};

module.exports = {
    PAGE_MARGIN, ROW_HEIGHT,
    formatDate, formatNumber, formatCurrency, safeText,
    buildPdfBuffer, drawLine, ensureSpace, drawKeyValue,
    drawTableHeader, drawTableRows, drawPageFooter, drawDocHeader, drawNotes
};
