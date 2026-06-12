const ordiniAcquistoModel = require('../models/ordini_acquistoModel');
const righePoModel = require('../models/righe_poModel');
const {
    createWorkbook,
    styleHeaderRow,
    autosizeColumns,
    formatDateOnly,
    formatDateTime,
    getTodayFileStamp,
    workbookToBuffer
} = require('./helpers');

const buildOrdiniAcquistoExcel = async () => {
    const workbook = createWorkbook('LogiChain ERP');
    const ordiniSheet = workbook.addWorksheet('Ordini');
    const righeSheet = workbook.addWorksheet('Righe');

    ordiniSheet.columns = [
        { header: 'ID', key: 'id' },
        { header: 'Fornitore', key: 'fornitore' },
        { header: 'Stato', key: 'stato' },
        { header: 'Data Creazione', key: 'created_at' },
        { header: 'Data Prevista', key: 'data_prevista' },
        { header: 'Totale Righe', key: 'numero_righe' },
        { header: 'Importo Totale', key: 'importo_totale' },
        { header: 'Responsabile', key: 'utente' }
    ];

    righeSheet.columns = [
        { header: 'ID Riga', key: 'id' },
        { header: 'Ordine ID', key: 'ordine_acquisto_id' },
        { header: 'SKU', key: 'sku' },
        { header: 'Prodotto', key: 'prodotto' },
        { header: 'Quantita Ordinata', key: 'quantita_ordinata' },
        { header: 'Quantita Ricevuta', key: 'quantita_ricevuta' },
        { header: 'Prezzo Unitario', key: 'prezzo_unitario' },
        { header: 'Totale Riga', key: 'totale_riga' },
        { header: 'Creata Il', key: 'created_at' }
    ];

    const ordiniRes = await ordiniAcquistoModel.findAllFiltered({});

    for (const ordine of ordiniRes.rows) {
        ordiniSheet.addRow({
            id: ordine.id,
            fornitore: ordine.fornitore,
            stato: ordine.stato,
            created_at: formatDateTime(ordine.created_at),
            data_prevista: formatDateOnly(ordine.data_prevista),
            numero_righe: Number(ordine.numero_righe ?? 0),
            importo_totale: Number(ordine.importo_totale ?? 0),
            utente: ordine.utente || ''
        });

        const righeRes = await righePoModel.findByOrdineAcquistoId(ordine.id);
        righeRes.rows.forEach((riga) => {
            righeSheet.addRow({
                id: riga.id,
                ordine_acquisto_id: riga.ordine_acquisto_id,
                sku: riga.sku,
                prodotto: riga.prodotto,
                quantita_ordinata: Number(riga.quantita_ordinata ?? 0),
                quantita_ricevuta: Number(riga.quantita_ricevuta ?? 0),
                prezzo_unitario: Number(riga.prezzo_unitario ?? 0),
                totale_riga: Number(riga.totale_riga ?? 0),
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
        filename: `ordini-acquisto-${getTodayFileStamp()}.xlsx`
    };
};

module.exports = { buildOrdiniAcquistoExcel };
