import express from "express";
import {abrirForo, deleteForo, getForoCuentaId, getForoId, getForos, 
    updateForo, responderForo, getRespuestasForo, updateRespuesta, deleteRespuesta, cantRespuestas} from "../controllers/foroController.js"

const router = express.Router();

router.post("/abrir", abrirForo);
router.post("/responder/:idforo", responderForo);

router.get("/listarForos", getForos);
router.get("/listarForo/:id",getForoId);
router.get("/listarForoCuenta/:id", getForoCuentaId);
router.get("/respuestas/traerRespuestas/:idforo", getRespuestasForo);
router.get("/cantidadRespuestas/:id", cantRespuestas);

router.patch("/actualizarForo/:id", updateForo);
router.patch("/respuesta/actualizar/:idrespuesta", updateRespuesta);

router.delete("/eliminarForo/:id",deleteForo);
router.delete("/respuesta/eliminar/:idrespuesta", deleteRespuesta);

export default router;
