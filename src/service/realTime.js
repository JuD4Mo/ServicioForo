import { supabase } from "../db/supaClient.js";

const broadcastForo = async (nuevoForo) => {
  console.log('Enviando foro a canal realtime...', nuevoForo);
  await supabase.channel('foros-realtime').send({
    type: 'broadcast',
    event: 'nuevo-foro',
    payload: nuevoForo
  });
};


const broadcastRespuesta = async (nuevaRespuesta) => {
  await supabase.channel('respuestas-realtime').send({
    type: 'broadcast',
    event: 'nueva-respuesta',
    payload: nuevaRespuesta
  });
};

export { broadcastForo, broadcastRespuesta }; 
