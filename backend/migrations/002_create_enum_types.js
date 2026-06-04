exports.up = (pgm) => {

    pgm.createType("purchase_order_state", [
        "BOZZA",
        "INVIATO",
        "CONFERMATO",
        "IN_RICEZIONE",
        "COMPLETATO",
        "ANNULLATO"
    ]);


    pgm.createType("sales_order_state", [
        "BOZZA",
        "CONFERMATO",
        "SPEDITO",
        "ANNULLATO"
    ]);

    pgm.createType("sales_order_picking_state", [
        "NON_AVVIATO",
        "IN_PICKING",
        "PICKING_COMPLETATO"
    ]);


    pgm.createType("shipping_state", [
        "IN_PREPARAZIONE",
        "SPEDITA",
        "CONSEGNATA",
        "PROBLEMA"
    ]);

    pgm.createType("movimento_tipo", [
        "CARICO_ACQUISTO",
        "SCARICO_VENDITA",
        "SPOSTAMENTO",
        "RETTIFICA_POSITIVA",
        "RETTIFICA_NEGATIVA",
        "RESO"
    ]);

    pgm.createType("notification_type", [
        "SOTTO_SCORTA",
        "PO_IN_RITARDO",
        "RICEZIONE_PARZIALE",
        "CAMBIO_STATO_SPEDIZIONE",
        "ALTRO"
    ]);
};

exports.down = (pgm) => {
    pgm.dropType("notification_type");
    pgm.dropType("movimento_tipo");
    pgm.dropType("shipping_state");
    pgm.dropType("sales_order_picking_state");
    pgm.dropType("sales_order_state");
    pgm.dropType("purchase_order_state");
};