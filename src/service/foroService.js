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


export const listarForos = async () => {
  return await supabase
    .from('foros')
    .select(`
      idforo,
      titulo,
      descripcion,
      idcuenta,
      fecha,
      cuentas(nombre),
      respuestas_foro(idrespuesta)
    `)
    .order('idforo', { ascending: false });
};

export const listarForoId = async (idForo) => {
  return await supabase
    .from('foros')
    .select(`
      *,
      cuentas(nombre),
      respuestas_foro(idrespuesta)
    `)
    .eq('idforo', idForo)
    .maybeSingle();
};

export const listarForoIdCuenta = async(idCuenta) => {
  return await supabase
    .from('foros')
    .select('idforo, titulo, descripcion, idcuenta, fecha, cuentas(nombre)', 'respuestas_foro(idrespuesta)')
    .eq('idcuenta', idCuenta).order('idforo', { ascending: false });
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
    .select('idrespuesta, idforo, idcuenta, mensaje, fecha, cuentas(nombre)')
    .eq('idforo', idForo)
    .order('fecha', { ascending: true });
};

export const eliminarRespuestaConHijos = async (idRespuesta) => {
  // 1. Obtener todas las respuestas
  const { data: respuestas, error: errorSelect } = await supabase
    .from('respuestas_foro')
    .select('idrespuesta, idrespuesta_padre');

  if (errorSelect) return { data: null, error: errorSelect };

  // 2. Crear mapa padre → hijos
  const mapa = new Map();
  respuestas.forEach(r => {
    const padreId = r.idrespuesta_padre ?? null;
    const hijos = mapa.get(padreId) || [];
    hijos.push(r.idrespuesta);
    mapa.set(padreId, hijos);
  });

  // 3. Buscar todos los descendientes recursivamente
  const idsAEliminar = [];

  const recolectarDescendientes = (id) => {
    const hijos = mapa.get(Number(id)) || [];
    hijos.forEach(recolectarDescendientes);
    idsAEliminar.push(Number(id)); // importante: asegurar tipo
  };

  recolectarDescendientes(Number(idRespuesta));

  // 4. Eliminar en orden: hijos → padre
  const { data, error } = await supabase
    .from('respuestas_foro')
    .delete()
    .in('idrespuesta', idsAEliminar);

  return { data, error };
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
    .select('idrespuesta, idforo, idcuenta, mensaje, fecha')
};

export const cantidadRespuestasForo = async(idForo) => {
    return await supabase
        .from('respuestas_foro')
        .select('*', { count: 'exact', head: true })
        .eq('idforo', idForo);
};


export const listarRespuestasConPadres = async (idForo) => {
  const { data, error } = await supabase
    .from('respuestas_foro')
    .select('idrespuesta, idforo, idcuenta, mensaje, fecha, idrespuesta_padre, cuentas(nombre)')
    .eq('idforo', idForo)
    .order('fecha', { ascending: true });

  return { data, error };
};


export const replicarRespuesta = async (idForo, idUsuario, info) => {
  const { mensaje, idrespuesta_padre } = info;

  if (!mensaje || !idrespuesta_padre) {
    throw new Error("Mensaje o idrespuesta_padre faltantes.");
  }

  // Paso 1: Verificar profundidad
  let profundidad = 1;
  let actualId = idrespuesta_padre;

  while (actualId) {
    const { data: respuesta, error } = await supabase
      .from('respuestas_foro')
      .select('idrespuesta_padre')
      .eq('idrespuesta', actualId)
      .maybeSingle();

    if (error) throw new Error("Error al verificar profundidad");

    if (!respuesta || !respuesta.idrespuesta_padre) break;

    actualId = respuesta.idrespuesta_padre;
    profundidad++;

    if (profundidad >= 3) {
      throw new Error("Solo se permiten respuestas hasta 3 niveles de profundidad.");
    }
  }

  const { data: insertadas, error: errorInsert } = await supabase
    .from('respuestas_foro')
    .insert({ idforo: idForo, idcuenta: idUsuario, mensaje, idrespuesta_padre })
    .select('idrespuesta, idforo, idcuenta, mensaje, fecha, idrespuesta_padre');

  if (errorInsert || !insertadas?.[0]) {
    throw new Error("Error al insertar réplica");
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
