import { Nodo } from "./tree.js";

export function construirArbolRespuestas(respuestas) {
  const mapa = new Map();
  let raiz = [];

  respuestas.forEach(r => {
    mapa.set(r.idrespuesta, new Nodo(r));
  });

  respuestas.forEach(r => {
    const nodo = mapa.get(r.idrespuesta);
    if (r.idrespuesta_padre) {
      const padre = mapa.get(r.idrespuesta_padre);
      if (padre) {
        padre.agregarHijo(nodo);
      }
    } else {
      raiz.push(nodo); 
    }
  });

  return raiz;
}
