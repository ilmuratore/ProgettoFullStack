# LogiChain Priority 3 - Postman

## Uso consigliato

1. Importa `LogiChain_ENV_Local_Priority3.postman_environment.json`.
2. Avvia il backend su `http://localhost:3000`.
3. Esegui prima i test automatici Jest per creare/reset DB e seed utenti test.
4. In Postman esegui `LogiChain_M00_Priority3_E2E_Smoke.postman_collection.json` con Runner.

Utenti test seedati da Jest/script:

- admin@logichain.it / Admin123!
- operatore@test.local / Test123!
- supporto@test.local / Test123!
- resp.acquisti@test.local / Test123!
- resp.vendite@test.local / Test123!
- resp.magazzino@test.local / Test123!

Le collection M01, M10 e M16 sono estratti focalizzati del flusso Priority 3.
