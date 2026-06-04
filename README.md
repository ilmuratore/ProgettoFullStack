# ProgettoFullStack — LogiChain ERP

Applicazione ERP full stack per la gestione della supply chain, sviluppata nell'ambito del corso di tirocinio **React / JavaScript Developer**.

## Team

| Ruolo | Nome |
|-------|------|
| Tech Lead / Responsabile progetto | Simone Iengo |
| Sviluppatore | Giorgio Gay |
| Sviluppatore | Cristina Buffone |
| Sviluppatore | Emma Santi Andrea |
| Sviluppatore | Agostino Schiattarella |

## Stack Tecnologico

- **Frontend:** React 18, React Router v6, Zustand, Tailwind CSS, Recharts
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL 14+
- **Auth:** JWT + bcrypt
- **Versioning:** Git / GitHub

---

## Prerequisiti

- Node.js 18+
- PostgreSQL 14+ (servizio attivo)
- Docker + Docker Compose (opzionale)

---

## Installazione e Avvio (senza Docker)

### 1. Clona il repository

```bash
git clone https://github.com/ilmuratore/progettofullstack.git
cd ProgettoFullStack
```

### 2. Backend

```bash
cd backend
npm install
```

Copia il file di configurazione e compilalo con i tuoi valori:

```bash
cp .env.example .env
```

Valori da impostare in `.env`:
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=logichain
DB_USER=postgres
DB_PASSWORD=postgres
DATABASE_URL=postgres://postgres:postgres@localhost:5432/logichain
JWT_SECRET=cambia_questo_valore
JWT_EXPIRES_IN=1h
NODE_ENV=development
### 3. Database

Crea il database (prima volta):

```bash
psql -U postgres -c "CREATE DATABASE logichain;"
```

Esegui le migration per creare tutte le tabelle:

```bash
npm run migrate
```

### 4. Avvio backend

```bash
npm run dev
```

Il server parte su `http://localhost:3000` e logga il numero di tabelle presenti nel DB (atteso: 27).

### 5. Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Il frontend parte su `http://localhost:5173`.

---

## Avvio con Docker

```bash
docker compose up --build
```

Questo avvia in un colpo solo: PostgreSQL, backend e frontend.

Per eseguire le migration dentro Docker:

```bash
docker compose exec backend npm run migrate
```

---

## Comandi utili

```bash
# Migration
npm run migrate          # esegui migration pendenti
npm run migrate:down     # rollback ultima migration
npm run migrate:redo     # rollback + re-esegui ultima migration

# Sviluppo
npm run dev              # avvia con nodemon (hot reload)
npm start                # avvia senza hot reload (produzione)
```

---

## Struttura del progetto
ProgettoFullStack/
├── backend/
│   ├── migrations/          # migration SQL versionate
│   ├── seeds/               # dati iniziali per test
│   ├── src/
│   │   ├── config/          # db.js, initDB.js
│   │   ├── controllers/     # handler HTTP per modulo
│   │   ├── middleware/      # auth, rbac, validate
│   │   ├── models/          # query SQL per entità
│   │   ├── queries/         # logichain_schema_v2.sql
│   │   ├── routes/          # definizione rotte
│   │   └── services/        # business logic
│   └── server.js
└── frontend/
└── src/
├── api/             # HTTP client centralizzato
├── components/      # componenti UI riutilizzabili
├── pages/           # componenti di pagina
└── store/           # Zustand store
---

## Licenza

Questo progetto è distribuito sotto licenza [MIT](LICENSE).