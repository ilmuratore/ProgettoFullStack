const express = require("express");
const fornitoriController = require("../controllers/fornitoriController");

const { auth } = require('../middleware/auth');
const { requirePermesso } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

const router = express.Router();

const createBlueprint = {
    ragione_sociale: { required: true, type: "string" },
    piva: { required: true, type: "string" },
    indirizzo: { required: false, type: "string" },
    email: { required: false, type: "string" },
    telefono: { required: false, type: "string" },
    sito_web: { required: false, type: "string" },
    descrizione_aziendale: { required: false, type: "string" }
};
const updateBlueprint = {
    ragione_sociale: { required: false, type: "string" },
    piva: { required: false, type: "string" },
    indirizzo: { required: false, type: "string" },
    email: { required: false, type: "string" },
    telefono: { required: false, type: "string" },
    sito_web: { required: false, type: "string" },
    descrizione_aziendale: { required: false, type: "string" },
    attivo: { required: false, type: "boolean" }
};


router.get("/", auth, requirePermesso("fornitori:read"), fornitoriController.getAll);
router.post("/", auth, requirePermesso("fornitori:write"), validate(createBlueprint), fornitoriController.create);
router.get("/:id", auth, requirePermesso("fornitori:read"), fornitoriController.getById);
router.patch("/:id", auth, requirePermesso("fornitori:write"), validate(updateBlueprint), fornitoriController.update);
router.delete("/:id", auth, requirePermesso("fornitori:delete"), fornitoriController.elimina);

module.exports = router;
