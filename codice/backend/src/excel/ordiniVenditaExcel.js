const ordiniModel = require('../models/ordiniModel');
const righeOrdineModel = require('../models/righe_ordineModel');
const {
    createWorkbook,
    styleHeaderRow,
    autosizeColumns,
    formatDateOnly,
    formatDateTime,
    getTodayFileStamp,
    workbookToBuffer
} = require('./helpers');

const buildOrdiniVenditaExcel = async () => {
    const workbook = createWorkbook('LogiChain ERP');
    const ordiniSheet = workbook.addWorksheet('Ordini');
    const righeSheet = workbook.addWorksheet('Righe');

    ordiniSheet.columns = [
        { header: 'ID', key: 'id' },
        { header: 'Cliente', key: 'cliente' },
        { header: 'Destinazione', key: 'destinazione' },
        { header: 'Stato', key: 'stato' },
        { header: 'Picking', key: 'stato_picking' },
        { header: 'Data Ordine', key: 'data_ordine' },
        { header: 'Data Consegna Richiesta', key: 'data_consegna_richiesta' },
        { header: 'Importo Totale', key: 'importo_totale' },
        { header: 'Responsabile', key: 'utente' }
    ];

    righeSheet.columns = [
        { header: 'ID Riga', key: 'id' },
        { header: 'Ordine ID', key: 'ordine_id' },
        { header: 'SKU', key: 'sku' },
        { header: 'Prodotto', key: 'prodotto' },
        { header: 'Quantita', key: 'quantita' },
        { header: 'Prezzo Unitario', key: 'prezzo_unitario' },
        { header: 'Totale Riga', key: 'totale_riga' },
        { header: 'Creata Il', key: 'created_at' }
    ];

    const ordiniRes = await ordiniModel.findAll();

    for (const ordine of ordiniRes.rows) {
        ordiniSheet.addRow({
            id: ordine.id,
            cliente: ordine.cliente,
            destinazione: ordine.destinazione || '',
            stato: ordine.stato,
            stato_picking: ordine.stato_picking,
            data_ordine: formatDateOnly(ordine.data_ordine),
            data_consegna_richiesta: formatDateOnly(ordine.data_consegna_richiesta),
            importo_totale: Number(ordine.importo_totale ?? 0),
            utente: ordine.utente || ''
        });

        const righeRes = await righeOrdineModel.findByOrdine(ordine.id);
        righeRes.rows.forEach((riga) => {
            righeSheet.addRow({
                id: riga.id,
                ordine_id: riga.ordine_id,
                sku: riga.sku,
                prodotto: riga.prodotto,
                quantita: Number(riga.quantita ?? 0),
                prezzo_unitario: Number(riga.prezzo_unitario ?? 0),
                totale_riga: Number(riga.quantita ?? 0) * Number(riga.prezzo_unitario ?? 0),
                created_at: formatDateTime(riga.created_at)
            });
        });
    }

    styleHeaderRow(ordiniSheet);
    styleHeaderRow(righeSheet);
    autosizeColumns(ordiniSheet);
    autosizeColumns(righeSheet);

    return {
        buffer: await workbookToBuffer(workbook),
        filename: `ordini-vendita-${getTodayFileStamp()}.xlsx`
    };
};

module.exports = { buildOrdiniVenditaExcel };
