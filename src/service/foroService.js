import { supabase } from "../db/supaClient.js";

export const crearForo = async (info) => {
  const { titulo, descripcion, idcuenta } = info;

  
  const { data: forosInsertados, error: errorInsert } = await supabase
    .from('foros')
    .insert({ titulo, descripcion, idcuenta })
    .select('idforo, titulo, descripcion, idcuenta, fecha');

  if (errorInsert || !forosInsertados || !forosInsertados[0]) {
    return { data: null, error: errorInsert || new Error("No se insertó el foro") };
  }

  const foro = forosInsertados[0];

  const { data: usuario, error: errorUsuario } = await supabase
    .from('cuentas') 
    .select('nombre')
    .eq('idcuenta', foro.idcuenta)
    .maybeSingle();

  if (usuario?.nombre) {
    foro.nombreUsuario = usuario.nombre;
  }

  return { data: [foro], error: null };
};


export const listarForos = async() => {
    return await supabase.from('foros').select('*');
}

export const listarForoId = async(idForo) => {
    return await supabase.from('foros').select('*').eq('idforo', idForo).maybeSingle();;
}

export const listarForoIdCuenta = async(idCuenta) => {
    return await supabase.from('foros').select('*').eq('idcuenta', idCuenta);
}

export const actualizarForo = async(idForo, info) => {
    const camposAActualizar = {};
    if(info.titulo) camposAActualizar.titulo = info.titulo;
    if(info.descripcion) camposAActualizar.descripcion = info.descripcion;
    if (Object.keys(camposAActualizar).length === 0) {
        throw new Error("No se enviaron datos para actualizar.");
    }
    return await supabase.from('foros').update(camposAActualizar).eq('idforo', idForo).select('*');
}

export const eliminarForo = async(idForo) => {
    return await supabase.from('foros').delete('*').eq('idforo', idForo);
}

export const responderForo = async (idForo, idUsuario, info) => {
  const mensaje = info.mensaje;

  if (!mensaje) {
    throw new Error("El mensaje de la respuesta no puede estar vacío.");
  }

  
  const { data: insertadas, error: errorInsert } = await supabase
    .from('respuestas_foro')
    .insert({ idforo: idForo, idcuenta: idUsuario, mensaje })
    .select('idrespuesta, idforo, idcuenta, mensaje, fecha');

  if (errorInsert || !insertadas || !insertadas[0]) {
    return { data: null, error: errorInsert || new Error("No se insertó respuesta") };
  }

  const respuesta = insertadas[0];

  
  const { data: usuario, error: errorUsuario } = await supabase
    .from('cuentas') 
    .select('nombre')
    .eq('idcuenta', idUsuario)
    .maybeSingle();

  
  if (usuario?.nombre) {
    respuesta.nombreUsuario = usuario.nombre;
  }

  return { data: [respuesta], error: null };
};


export const listarRespuestasForo = async(idForo) => {
    return await supabase
        .from('respuestas_foro')
        .select('*')
        .eq('idforo', idForo)
        .order('fecha', { ascending: true });
};

export const eliminarRespuesta = async(idRespuesta, idUsuario) => {
    return await supabase
        .from('respuestas_foro')
        .delete()
        .eq('idrespuesta', idRespuesta)
        .eq('idcuenta', idUsuario)
        .select('*');
};

export const editarRespuesta = async(idRespuesta, idUsuario, mensaje) => {
    if (!mensaje) {
        throw new Error("El mensaje no puede estar vacío.");
    }

    return await supabase
        .from('respuestas_foro')
        .update({ mensaje })
        .eq('idrespuesta', idRespuesta)
        .eq('idcuenta', idUsuario)
        .select('*');
};

export const cantidadRespuestasForo = async(idForo) => {
    return await supabase
        .from('respuestas_foro')
        .select('*', { count: 'exact', head: true })
        .eq('idforo', idForo);
};
