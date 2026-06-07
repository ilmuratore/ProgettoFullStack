const pool = require('../config/db');


const search = async (q) => {
    const term = `%${q}%`;

    const [prodottiResult, fornitoriResult] = await Promise.all([
        pool.query(
            `SELECT
                 p.id,
                 p.sku,
                 p.nome,
                 p.prezzo,
                 -- Giacenza totale aggregata (somma su tutti i magazzini)
                 COALESCE(SUM(g.quantita), 0) AS giacenza_totale
             FROM  prodotti p
             LEFT JOIN giacenze g ON g.prodotto_id = p.id
             WHERE p.attivo = true
               AND (p.nome ILIKE $1 OR p.sku ILIKE $1)
             GROUP BY p.id
             ORDER BY p.nome ASC
             LIMIT 10`,
            [term]
        ),
        pool.query(
            `SELECT
                 f.id,
                 f.ragione_sociale,
                 f.piva,
                 f.source,
                 f.email,
                 f.sito_web
             FROM  fornitori f
             WHERE f.attivo = true
               AND (f.ragione_sociale ILIKE $1 OR f.piva ILIKE $1)
             ORDER BY f.ragione_sociale ASC
             LIMIT 10`,
            [term]
        )
    ]);

    return {
        prodotti:  prodottiResult.rows,
        fornitori: fornitoriResult.rows
    };
};


const getSchedaFornitore = (fornitore_id) =>
    pool.query(
        `SELECT
             f.id,
             f.ragione_sociale,
             f.piva,
             f.indirizzo,
             f.email,
             f.telefono,
             f.sito_web,
             f.descrizione_aziendale,
             f.lead_time_giorni,
             f.source,

             -- Contatti aziendali
             COALESCE(
                 (SELECT json_agg(jsonb_build_object(
                     'id',       cf.id,
                     'nome',     cf.nome,
                     'ruolo',    cf.ruolo,
                     'email',    cf.email,
                     'telefono', cf.telefono
                 ) ORDER BY cf.id)
                  FROM contatti_fornitori cf WHERE cf.fornitore_id = f.id),
                 '[]'::json
             ) AS contatti,

             -- Catalogo prodotti (distinti, da ordini storici)
             COALESCE(
                 (SELECT json_agg(DISTINCT jsonb_build_object(
                     'id',     p.id,
                     'sku',    p.sku,
                     'nome',   p.nome,
                     'prezzo', p.prezzo,
                     'attivo', p.attivo
                 ))
                  FROM ordini_acquisto oa
                  JOIN righe_po rp ON rp.ordine_acquisto_id = oa.id
                  JOIN prodotti p  ON p.id = rp.prodotto_id
                  WHERE oa.fornitore_id = f.id AND p.attivo = true),
                 '[]'::json
             ) AS catalogo_prodotti,

             -- Storico richieste acquisto (ultime 10)
             COALESCE(
                 (SELECT json_agg(ra ORDER BY ra.data_richiesta DESC)
                  FROM (
                      SELECT
                          r.id,
                          r.stato,
                          r.data_richiesta,
                          r.note
                      FROM richieste_acquisto r
                      WHERE r.fornitore_id = f.id
                      ORDER BY r.data_richiesta DESC
                      LIMIT 10
                  ) ra),
                 '[]'::json
             ) AS storico_richieste

         FROM  fornitori f
         WHERE f.id = $1`,
        [fornitore_id]
    );

const getCatalogoFornitore = (fornitore_id) =>
    pool.query(
        `SELECT DISTINCT
             p.id,
             p.sku,
             p.nome,
             p.descrizione,
             p.prezzo,
             p.unita_misura,
             -- Lead time dal fornitore
             f.lead_time_giorni,
             -- Giacenza interna totale
             COALESCE(SUM(g.quantita), 0) AS giacenza_interna
         FROM  ordini_acquisto oa
         JOIN  fornitori f  ON f.id  = oa.fornitore_id
         JOIN  righe_po rp  ON rp.ordine_acquisto_id = oa.id
         JOIN  prodotti p   ON p.id  = rp.prodotto_id
         LEFT JOIN giacenze g ON g.prodotto_id = p.id
         WHERE oa.fornitore_id = $1
           AND p.attivo = true
         GROUP BY p.id, f.lead_time_giorni
         ORDER BY p.nome ASC`,
        [fornitore_id]
    );


const getSchedaProdotto = (prodotto_id) =>
    pool.query(
        `SELECT
             p.id,
             p.sku,
             p.nome,
             p.descrizione,
             p.unita_misura,
             p.peso_kg,
             p.scorta_minima,
             p.prezzo,
             p.data_agg_prezzo,
             p.attivo,
             c.nome AS categoria,

             -- Disponibilità interna per magazzino
             COALESCE(
                 (SELECT json_agg(dispo ORDER BY dispo.magazzino_codice)
                  FROM (
                      SELECT
                          m.id         AS magazzino_id,
                          m.codice     AS magazzino_codice,
                          m.nome       AS magazzino_nome,
                          SUM(g.quantita) AS quantita_disponibile
                      FROM  giacenze g
                      JOIN  ubicazioni u ON u.id = g.ubicazione_id
                      JOIN  magazzini m  ON m.id = u.magazzino_id
                      WHERE g.prodotto_id = p.id
                        AND m.attivo = true
                      GROUP BY m.id
                      HAVING SUM(g.quantita) > 0
                  ) dispo),
                 '[]'::json
             ) AS disponibilita_magazzini,

             -- Giacenza totale
             COALESCE(
                 (SELECT SUM(g.quantita)
                  FROM giacenze g
                  WHERE g.prodotto_id = p.id),
                 0
             ) AS giacenza_totale,

             -- Fornitore principale (ultimo fornitore da cui è stato ordinato)
             (SELECT jsonb_build_object(
                  'id',             f.id,
                  'ragione_sociale',f.ragione_sociale,
                  'email',          f.email,
                  'lead_time_giorni', f.lead_time_giorni
              )
              FROM  ordini_acquisto oa
              JOIN  righe_po rp ON rp.ordine_acquisto_id = oa.id
              JOIN  fornitori f ON f.id = oa.fornitore_id
              WHERE rp.prodotto_id = p.id
              ORDER BY oa.created_at DESC
              LIMIT 1
             ) AS fornitore_principale

         FROM  prodotti p
         LEFT JOIN categorie c ON c.id = p.categoria_id
         WHERE p.id = $1`,
        [prodotto_id]
    );


const getDisponibilitaProdotto = (prodotto_id) =>
    pool.query(
        `SELECT
             m.id         AS magazzino_id,
             m.codice     AS magazzino_codice,
             m.nome       AS magazzino_nome,
             u.id         AS ubicazione_id,
             u.codice     AS ubicazione_codice,
             g.quantita
         FROM  giacenze g
         JOIN  ubicazioni u ON u.id = g.ubicazione_id
         JOIN  magazzini m  ON m.id = u.magazzino_id
         WHERE g.prodotto_id = $1
           AND g.quantita    > 0
           AND m.attivo      = true
         ORDER BY m.codice, u.codice`,
        [prodotto_id]
    );


module.exports = {

    search,
    getSchedaFornitore,
    getCatalogoFornitore,
    getSchedaProdotto,
    getDisponibilitaProdotto
};
