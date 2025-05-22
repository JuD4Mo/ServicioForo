import { supabase } from "../db/supaClient.js";

const broadcastForo = async (evento) => {
  console.log('🛰️ Enviando evento foro realtime:', evento);
  await supabase.channel('foros-realtime').send({
    type: 'broadcast',
    event: 'evento-foro',
    payload: evento
  });
};

export { broadcastForo, broadcastRespuesta }; 
