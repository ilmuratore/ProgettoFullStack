BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM ruoli WHERE id = 1) THEN
        RAISE EXCEPTION 'Ruolo Admin (id=1) non trovato - esegui prima seed_ruoli_permessi.sql';
    END IF;
END $$;

-- Prima di eseguire il file, sostituisci i valori qui sotto.
INSERT INTO utenti (nome, cognome, email, password_hash, ruolo_id, attivo)
VALUES (
    'Admin',
    'LogiChain',
    'admin@logichain.it',
    crypt('CambiaMiSubito_2025!', gen_salt('bf', 12)),
    1,
    true
)
ON CONFLICT (email) DO NOTHING;

COMMIT;
