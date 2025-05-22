import { supabase } from "../db/supaClient.js";

const broadcastForo = async (evento) => {
  console.log('🛰️ Enviando evento foro realtime:', evento);
  await supabase.channel('foros-realtime').send({
    type: 'broadcast',
    event: 'evento-foro',
    payload: evento
  });
};

const broadcastRespuesta = async (evento) => {
  await supabase.channel('respuestas-realtime').send({
    type: 'broadcast',
    event: 'evento-respuesta',
    payload: evento
  });
};


export { broadcastForo, broadcastRespuesta }; 
