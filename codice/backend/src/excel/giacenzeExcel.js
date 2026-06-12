const giacenzeModel = require('../models/giacenzeModel');
const {
    createWorkbook,
    styleHeaderRow,
    autosizeColumns,
    formatDateTime,
    getTodayFileStamp,
    workbookToBuffer
} = require('./helpers');

const buildGiacenzeExcel = async () => {
    const workbook = createWorkbook('LogiChain ERP');
    const sheet = workbook.addWorksheet('Giacenze');

    sheet.columns = [
        { header: 'SKU', key: 'sku' },
        { header: 'Prodotto', key: 'prodotto' },
        { header: 'Magazzino', key: 'magazzino' },
        { header: 'Ubicazione', key: 'ubicazione' },
        { header: 'Quantita', key: 'quantita' },
        { header: 'Scorta Minima', key: 'scorta_minima' },
        { header: 'Sotto Scorta', key: 'sotto_scorta' },
        { header: 'Ultimo Movimento', key: 'ultimo_movimento' }
    ];

    const giacenzeRes = await giacenzeModel.findAllFiltered({});
    giacenzeRes.rows.forEach((item) => {
        sheet.addRow({
            sku: item.sku,
            prodotto: item.prodotto,
            magazzino: item.magazzino,
            ubicazione: item.ubicazione,
            quantita: Number(item.quantita ?? 0),
            scorta_minima: Number(item.scorta_minima ?? 0),
            sotto_scorta: item.sotto_scorta ? 'SI' : 'NO',
            ultimo_movimento: formatDateTime(item.ultimo_movimento)
        });
    });

    styleHeaderRow(sheet);
    autosizeColumns(sheet);

    return {
        buffer: await workbookToBuffer(workbook),
        filename: `giacenze-${getTodayFileStamp()}.xlsx`
    };
};

module.exports = { buildGiacenzeExcel };
