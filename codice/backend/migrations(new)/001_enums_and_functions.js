exports.up = (pgm) => {

    pgm.createFunction('fn_set_updated_at', [], {
        returns: 'trigger', language: 'plpgsql'
    }, `BEGIN NEW.updated_at = NOW(); RETURN NEW; END;`);

    pgm.createFunction('fn_set_data_agg_prezzo', [], {
        returns: 'trigger', language: 'plpgsql'
    }, `BEGIN
        IF NEW.prezzo IS DISTINCT FROM OLD.prezzo THEN
            NEW.data_agg_prezzo = NOW();
        END IF;
        RETURN NEW;
    END;`);

    pgm.createType('purchase_order_state', [
        'BOZZA', 'INVIATO', 'CONFERMATO', 'IN_RICEZIONE', 'COMPLETATO', 'ANNULLATO'
    ]);

    pgm.createType('sales_order_state', [
        'BOZZA', 'CONFERMATO', 'SPEDITO', 'ANNULLATO'
    ]);

    pgm.createType('sales_order_picking_state', [
        'NON_AVVIATO', 'IN_PICKING', 'PICKING_COMPLETATO'
    ]);

    pgm.createType('shipping_state', [
        'IN_PREPARAZIONE', 'SPEDITA', 'CONSEGNATA', 'PROBLEMA'
    ]);

    pgm.createType('movimento_tipo', [
        'CARICO_ACQUISTO', 'SCARICO_VENDITA', 'SPOSTAMENTO',
        'RETTIFICA_POSITIVA', 'RETTIFICA_NEGATIVA', 'RESO'
    ]);

    pgm.createType('notification_type', [
        'SOTTO_SCORTA', 'PO_IN_RITARDO', 'RICEZIONE_PARZIALE',
        'CAMBIO_STATO_SPEDIZIONE', 'ALTRO',
        'RICHIESTA_ACCETTATA', 'RICHIESTA_RIFIUTATA', 'MESSAGGIO_FORNITORE'
    ]);

    pgm.createType('richiesta_acquisto_state', [
        'BOZZA', 'INVIATA', 'IN_VALUTAZIONE', 'ACCETTATA', 'RIFIUTATA'
    ]);
};

exports.down = (pgm) => {
    pgm.dropType('richiesta_acquisto_state');
    pgm.dropType('notification_type');
    pgm.dropType('movimento_tipo');
    pgm.dropType('shipping_state');
    pgm.dropType('sales_order_picking_state');
    pgm.dropType('sales_order_state');
    pgm.dropType('purchase_order_state');
    pgm.dropFunction('fn_set_data_agg_prezzo', []);
    pgm.dropFunction('fn_set_updated_at', []);
};