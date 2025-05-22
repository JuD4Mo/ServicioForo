import * as foroService from "../service/foroService.js";
import { broadcastForo, broadcastRespuesta } from "../service/realTime.js";

export const abrirForo = async (req, res) => {
    try {
        const { data, error } = await foroService.crearForo(req.body);
        if (error) return res.status(400).json({ message: "Error al abrir el foro", error });
        await broadcastForo(data[0]);
        res.status(201).json({ data });
    } catch (error) {
        res.status(500).json(error.message);
    }
};

export const getForos = async (req, res) => {
    try {
        const { data, error } = await foroService.listarForos();
        if (error) return res.status(400).json({ message: "Error al obtener los foros", error });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json(error.message);
    }
};

export const getForoId = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await foroService.listarForoId(id);
        if (error) return res.status(400).json({ message: "Error al obtener el foro", error });
        if (!data) return res.status(404).json({ message: "Foro no encontrado" });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json(error.message);
    }
};

export const getForoCuentaId = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await foroService.listarForoIdCuenta(id);
        if (error) return res.status(400).json({ message: "Error al obtener el foro", error });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json(error.message);
    }
};

export const updateForo = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await foroService.actualizarForo(id, req.body);
        await broadcastForo({
        tipo: "foro-actualizado",
        foro: {
            idforo: id,
            ...req.body 
        }
        });
        if (error) return res.status(400).json({ message: "Error al actualizar el foro", error });
        res.status(201).json({ message: "Foro actualizado correctamente", data });
    } catch (error) {
        res.status(500).json(error.message);
    }
};

export const deleteForo = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await foroService.eliminarForo(id);
        if (error) return res.status(400).json({ message: "Error al eliminar el foro", error });
        await broadcastForo({
        tipo: "foro-eliminado",
        foro: { idforo: id }
        });
        res.status(200).json({ message: "Foro eliminado correctamente", data });
    } catch (error) {
        res.status(500).json(error.message);
    }
};

export const responderForo = async (req, res) => {
  try {
    const idForo = req.params.idforo;
    const idUsuario = req.body.idcuenta;
    const info = req.body;

    const { data, error } = await foroService.responderForo(idForo, idUsuario, info);

    if (error || !data || !data[0]) {
      return res.status(400).json({ message: "Error al responder el foro", error: error?.message || "Sin datos" });
    }

    const respuesta = data[0];

    if (!respuesta.fecha) {
    respuesta.fecha = new Date().toISOString();
    }

    await broadcastRespuesta({
    tipo: "nueva-respuesta",
    respuesta
    });

    res.status(201).json({ message: "Respuesta creada con éxito", data });
  } catch (error) {
    res.status(500).json({ message: "Error interno al responder el foro", error: error.message });
  }
};

export const getRespuestasForo = async (req, res) => {
    try {
        const idForo = req.params.idforo;
        const { data, error } = await foroService.listarRespuestasForo(idForo);
        if (error) return res.status(400).json({ message: "Error al obtener respuestas", error: error.message });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json(error.message);
    }
};

export const deleteRespuesta = async (req, res) => {
    try {
        const idRespuesta = req.params.idrespuesta;
        const idUsuario = req.body.idcuenta;
        const { data, error } = await foroService.eliminarRespuesta(idRespuesta, idUsuario);
        if (error) return res.status(400).json({ message: "Error al eliminar la respuesta", error: error.message });
        await broadcastRespuesta({
        tipo: "respuesta-eliminada",
        respuesta: { idrespuesta: idRespuesta }
        });
        res.status(200).json({ message: "Respuesta eliminada correctamente", data });
    } catch (error) {
        res.status(500).json(error.message);
    }
};

export const updateRespuesta = async (req, res) => {
    try {
        const idRespuesta = req.params.idrespuesta;
        const idUsuario = req.body.idcuenta;
        const { mensaje } = req.body;
        const { data, error } = await foroService.editarRespuesta(idRespuesta, idUsuario, mensaje);
        if (error) return res.status(400).json({ message: "Error al editar la respuesta", error: error.message });
        await broadcastRespuesta({
        tipo: "respuesta-editada",
        respuesta: data[0] 
        });
        res.status(200).json({ message: "Respuesta editada correctamente", data });
    } catch (error) {
        res.status(500).json(error.message);
    }
};

export const cantRespuestas = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await foroService.cantidadRespuestasForo(id);
        if (error) return res.status(400).json({ message: "Error al obtener la cantidad de respuestas", error: error.message });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json(error.message);
    }
};
