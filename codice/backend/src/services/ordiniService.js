const pool = require('../config/db');
const ordiniModel = require('../models/ordiniModel');
const righeOrdineModel = require('../models/righe_ordineModel');
const clientiModel = require('../models/clientiModel');
const destinazioniModel = require('../models/destinazioneclientiModel');
const prodottiModel = require('../models/prodottiModel');
const giacenzeModel = require('../models/giacenzeModel');
const movimentiStockService = require('./movimenti_stockService');

const VALID_STATES = ['BOZZA', 'CONFERMATO', 'SPEDITO', 'ANNULLATO'];
const VALID_PICKING = ['NON_AVVIATO', 'IN_PICKING', 'PICKING_COMPLETATO'];

const throwError = (code, message) => {
    const err = new Error(message);
    err.code = code;
    throw err;
};

const canTransitionStato = (from, to) => {
    if (from === to) return true;
    switch (from) {
        case 'BOZZA': return to === 'CONFERMATO' || to === 'ANNULLATO';
        case 'CONFERMATO': return to === 'SPEDITO' || to === 'ANNULLATO';
        default: return false;
    }
};

const canTransitionPicking = (from, to) => {
    if (from === to) return true;
    switch (from) {
        case 'NON_AVVIATO': return to === 'IN_PICKING';
        case 'IN_PICKING': return to === 'PICKING_COMPLETATO';
        default: return false;
    }
};

const getGiacenzaTotale = async (prodotto_id, client) => {
    const res = await (client || pool).query(
        `SELECT COALESCE(SUM(quantita), 0)::int AS totale FROM giacenze WHERE prodotto_id = $1;`,
        [prodotto_id]
    );
    return res.rows[0].totale;
};

const getDisponibilita = async (prodotto_id, client) => {
    const prodottoRes = await prodottiModel.findById(prodotto_id);
    if (prodottoRes.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Prodotto non trovato');
    }

    const totale = await getGiacenzaTotale(prodotto_id, client);
    const impegnatoRes = await ordiniModel.getImpegnatoByProdotto(prodotto_id, client);
    const impegnato = impegnatoRes.rows[0].impegnato;

    return {
        prodotto_id: Number(prodotto_id),
        totale,
        impegnato,
        disponibile: totale - impegnato
    };
};

const getAll = async (filters = {}) => {
    const { stato, stato_picking, cliente_id } = filters;
    if (stato && !VALID_STATES.includes(stato)) {
        throwError('VALIDATION_ERROR', `Stato non valido. Valori ammessi: ${VALID_STATES.join(', ')}`);
    }
    if (stato_picking && !VALID_PICKING.includes(stato_picking)) {
        throwError('VALIDATION_ERROR', `Stato picking non valido. Valori ammessi: ${VALID_PICKING.join(', ')}`);
    }
    if (stato || stato_picking || cliente_id) {
        return (await ordiniModel.findFiltered({ stato, stato_picking, cliente_id })).rows;
    }
    return (await ordiniModel.findAll()).rows;
};

const getById = async (id) => {
    const ordineRes = await ordiniModel.findById(id);
    if (ordineRes.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Ordine non trovato');
    }
    const righeRes = await righeOrdineModel.findByOrdine(id);
    return { ordine: ordineRes.rows[0], righe: righeRes.rows };
};

const create = async (payload) => {
    const { cliente_id, destinazione_id, data_consegna_richiesta, utente_id, righe = [] } = payload;

    if (!cliente_id || !destinazione_id || righe.length === 0) {
        throwError('VALIDATION_ERROR', 'cliente_id, destinazione_id e almeno una riga sono obbligatori');
    }

    const clienteRes = await clientiModel.findById(cliente_id);
    if (clienteRes.rowCount === 0 || clienteRes.rows[0].attivo === false) {
        throwError('RESOURCE_NOT_FOUND', 'Cliente non trovato');
    }

    const destRes = await destinazioniModel.findById(destinazione_id);
    if (destRes.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Destinazione non trovata');
    }
    if (destRes.rows[0].cliente_id !== Number(cliente_id)) {
        throwError('VALIDATION_ERROR', 'La destinazione non appartiene al cliente indicato');
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const righeConPrezzo = [];

        for (const r of righe) {
            const prodottoRes = await prodottiModel.findById(r.prodotto_id);
            if (prodottoRes.rowCount === 0) {
                throwError('RESOURCE_NOT_FOUND', `Prodotto ${r.prodotto_id} non trovato`);
            }
            if (prodottoRes.rows[0].attivo !== true) {
                throwError('VALIDATION_ERROR', `Prodotto ${r.prodotto_id} disattivato: non vendibile`);
            }

            righeConPrezzo.push({
                prodotto_id: r.prodotto_id,
                quantita: r.quantita,
                prezzo_unitario: Number(prodottoRes.rows[0].prezzo || 0)
            });
        }

        const importo_totale = righeConPrezzo.reduce((sum, r) =>
            sum + Number(r.quantita || 0) * Number(r.prezzo_unitario || 0), 0);

        const ordineRes = await ordiniModel.create({
            cliente_id,
            destinazione_id,
            data_consegna_richiesta,
            importo_totale,
            utente_id
        }, client);

        const ordine = ordineRes.rows[0];
        const righeCreated = [];

        for (const r of righeConPrezzo) {
            const rowRes = await righeOrdineModel.create({
                ordine_id: ordine.id,
                prodotto_id: r.prodotto_id,
                quantita: r.quantita,
                prezzo_unitario: r.prezzo_unitario
            }, client);
            righeCreated.push(rowRes.rows[0]);
        }

        await client.query('COMMIT');
        return { ordine, righe: righeCreated };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const update = async (id, payload) => {
    const ordineRes = await ordiniModel.findById(id);
    if (ordineRes.rowCount === 0) {
        throwError('RESOURCE_NOT_FOUND', 'Ordine non trovato');
    }
    if (ordineRes.rows[0].stato !== 'BOZZA') {
        throwError('STATE_TRANSITION_INVALID', 'Solo gli ordini in BOZZA sono modificabili');
    }
    const { data_consegna_richiesta } = payload;
    const res = await ordiniModel.update(id, { data_consegna_richiesta, importo_totale: undefined });
    return res.rows[0];
};

const updateStato = async (id, nuovoStato) => {
    if (!VALID_STATES.includes(nuovoStato)) {
        throwError('VALIDATION_ERROR', `Stato non valido. Valori ammessi: ${VALID_STATES.join(', ')}`);
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const ordineRes = await ordiniModel.findByIdForUpdate(id, client);
        if (ordineRes.rowCount === 0) {
            throwError('RESOURCE_NOT_FOUND', 'Ordine non trovato');
        }

        const ordine = ordineRes.rows[0];
        if (!canTransitionStato(ordine.stato, nuovoStato)) {
            throwError('STATE_TRANSITION_INVALID', `Transizione ${ordine.stato} -> ${nuovoStato} non consentita`);
        }

        if (nuovoStato === 'CONFERMATO') {
            const righeRes = await righeOrdineModel.findByOrdine(id, client);

            const fabbisogno = new Map();
            for (const r of righeRes.rows) {
                fabbisogno.set(r.prodotto_id, (fabbisogno.get(r.prodotto_id) || 0) + Number(r.quantita));
            }

            const prodottoIds = Array.from(fabbisogno.keys()).sort((a, b) => a - b);
            if (prodottoIds.length > 0) {
                await ordiniModel.lockGiacenzeByProdottoIds(prodottoIds, client);

                const precedentiRes = await ordiniModel.findOrdiniBozzaPrecedentiConStessiProdotti(
                    ordine.id,
                    prodottoIds,
                    ordine.data_ordine,
                    client
                );

                if (precedentiRes.rowCount > 0) {
                    throwError(
                        'STATE_TRANSITION_INVALID',
                        'Esistono ordini più vecchi sugli stessi prodotti da processare prima'
                    );
                }
            }

            for (const [prodotto_id, richiesto] of fabbisogno.entries()) {
                const disp = await getDisponibilita(prodotto_id, client);
                if (richiesto > disp.disponibile) {
                    throwError(
                        'INSUFFICIENT_STOCK',
                        `Disponibilita insufficiente per il prodotto ${prodotto_id}: richiesti ${richiesto}, disponibili ${disp.disponibile}`
                    );
                }
            }
        }

        if (nuovoStato === 'SPEDITO' && ordine.stato_picking !== 'PICKING_COMPLETATO') {
            throwError('STATE_TRANSITION_INVALID', 'Impossibile spedire: il picking non e completato');
        }

        if (nuovoStato === 'ANNULLATO' && ordine.stato_picking === 'PICKING_COMPLETATO') {
            throwError('STATE_TRANSITION_INVALID', 'Impossibile annullare: picking completato. Gestire il rientro merce tramite movimento RESO in magazzino');
        }

        const res = await ordiniModel.updateStato(id, nuovoStato, client);

        await client.query('COMMIT');
        return res.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};


const isPositiveInteger = (value) => Number.isInteger(Number(value)) && Number(value) > 0;

const validatePrelieviCompletamentoPicking = (prelievi, righeById) => {
    if (righeById.size === 0) {
        throwError('VALIDATION_ERROR', 'Ordine senza righe: impossibile completare il picking');
    }

    if (!Array.isArray(prelievi) || prelievi.length === 0) {
        throwError('VALIDATION_ERROR', 'Per completare il picking serve la lista prelievi per ogni riga');
    }

    const righeViste = new Set();

    for (const [index, p] of prelievi.entries()) {
        if (!isPositiveInteger(p?.riga_id)) {
            throwError('VALIDATION_ERROR', `prelievi[${index}].riga_id deve essere un intero positivo`);
        }

        const rigaId = Number(p.riga_id);

        if (righeViste.has(rigaId)) {
            throwError('VALIDATION_ERROR', `Riga ordine ${rigaId} duplicata nei prelievi`);
        }

        const riga = righeById.get(rigaId);
        if (!riga) {
            throwError('VALIDATION_ERROR', `Riga ordine ${rigaId} non trovata in questo ordine`);
        }

        if (!Array.isArray(p.ubicazioni) || p.ubicazioni.length === 0) {
            throwError('VALIDATION_ERROR', `La riga ${rigaId} non ha ubicazioni di prelievo`);
        }

        righeViste.add(rigaId);

        const ubicazioniViste = new Set();
        let sommaPrelievi = 0;

        for (const [ubicazioneIndex, u] of p.ubicazioni.entries()) {
            if (!isPositiveInteger(u?.ubicazione_id)) {
                throwError('VALIDATION_ERROR', `prelievi[${index}].ubicazioni[${ubicazioneIndex}].ubicazione_id deve essere un intero positivo`);
            }

            if (!isPositiveInteger(u?.quantita)) {
                throwError('VALIDATION_ERROR', `prelievi[${index}].ubicazioni[${ubicazioneIndex}].quantita deve essere un intero positivo`);
            }

            const ubicazioneId = Number(u.ubicazione_id);
            if (ubicazioniViste.has(ubicazioneId)) {
                throwError('VALIDATION_ERROR', `Ubicazione ${ubicazioneId} duplicata nella riga ${rigaId}`);
            }

            ubicazioniViste.add(ubicazioneId);
            sommaPrelievi += Number(u.quantita);
        }

        if (sommaPrelievi !== Number(riga.quantita)) {
            throwError(
                'VALIDATION_ERROR',
                `La somma dei prelievi (${sommaPrelievi}) per la riga ${rigaId} non corrisponde alla quantita ordinata (${riga.quantita})`
            );
        }
    }

    for (const rigaId of righeById.keys()) {
        if (!righeViste.has(rigaId)) {
            throwError('VALIDATION_ERROR', `Manca il prelievo per la riga ordine ${rigaId}`);
        }
    }
};

const updateStatoPicking = async (id, nuovoStatoPicking, prelievi) => {
    if (!VALID_PICKING.includes(nuovoStatoPicking)) {
        throwError('VALIDATION_ERROR', `Stato picking non valido. Valori ammessi: ${VALID_PICKING.join(', ')}`);
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const ordineRes = await ordiniModel.findByIdForUpdate(id, client);
        if (ordineRes.rowCount === 0) {
            throwError('RESOURCE_NOT_FOUND', 'Ordine non trovato');
        }

        const ordine = ordineRes.rows[0];

        if (ordine.stato !== 'CONFERMATO') {
            throwError('STATE_TRANSITION_INVALID', 'Il picking e gestibile solo su ordini CONFERMATO');
        }

        if (!canTransitionPicking(ordine.stato_picking, nuovoStatoPicking)) {
            throwError(
                'STATE_TRANSITION_INVALID',
                `Transizione picking ${ordine.stato_picking} -> ${nuovoStatoPicking} non consentita`
            );
        }

        if (nuovoStatoPicking !== 'PICKING_COMPLETATO') {
            const res = await ordiniModel.updateStatoPicking(id, nuovoStatoPicking, client);
            await client.query('COMMIT');
            return { ordine: res.rows[0], movimenti: [] };
        }

        const righeRes = await righeOrdineModel.findByOrdine(id, client);
        const righeById = new Map(righeRes.rows.map(r => [Number(r.id), r]));

        validatePrelieviCompletamentoPicking(prelievi, righeById);

        const movimenti = [];
        for (const p of prelievi) {
            const riga = righeById.get(Number(p.riga_id));
            for (const u of p.ubicazioni) {
                const movimento = await movimentiStockService.create({
                    prodotto_id: Number(riga.prodotto_id),
                    ubicazione_id: Number(u.ubicazione_id),
                    quantita: Number(u.quantita),
                    movimento_tipo: 'SCARICO_VENDITA',
                    riferimento: `ordine:${id}`,
                    note: null
                }, client);
                movimenti.push(movimento);
            }
        }

        const res = await ordiniModel.updateStatoPicking(id, 'PICKING_COMPLETATO', client);

        await client.query('COMMIT');
        return { ordine: res.rows[0], movimenti };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const { buildOrdineVenditaPdf } = require('../pdf/ordineVenditaPdf');

const generaPdfOrdineVendita = async (id) => {
    const { ordine, righe } = await getById(id);
    return buildOrdineVenditaPdf({ ordine, righe });
};

module.exports = {
    getAll,
    getById,
    getDisponibilita,
    create,
    update,
    updateStato,
    updateStatoPicking,
    generaPdfOrdineVendita
};
