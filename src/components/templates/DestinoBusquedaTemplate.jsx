import React, { useState, useEffect, useRef, useMemo } from 'react';
import styled, { css } from "styled-components";
import { useQuery, useQueries } from '@tanstack/react-query';
import { v, InputText, Selector, ContainerSelector, FooterInformativa, PublicHeader } from "../../index";
import { useDestinosPublicoStore } from "../../store/DestinosPublicoStore";
import { obtenerOperadorasPublico } from '../../supabase/crudOperadora';
import { VideoModal } from '../modals/VideoModal';
import { supabase } from '../../supabase/supabase.config';
import toast from 'react-hot-toast';

export function DestinoBusquedaTemplate() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [state, setState] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSugerencias, setShowSugerencias] = useState(false);
  const [horariosSeleccionados, setHorariosSeleccionados] = useState([]);
  const [destinoSeleccionado, setDestinoSeleccionado] = useState(null);
  const [operadoraSeleccionada, setOperadoraSeleccionada] = useState(null);
  const [shouldSearchOperadoras, setShouldSearchOperadoras] = useState(false);
  const [shouldSearchDestinosOperadora, setShouldSearchDestinosOperadora] = useState(false);
  const [searchParams, setSearchParams] = useState(null);
  const { buscarDestinosAutocomplete, buscarDestinosYOperadoras, buscarDestinosPorOperadora, buscarHorariosPorDestino } = useDestinosPublicoStore();
  const inputRef = useRef(null);
  const sugerenciasRef = useRef(null);
  const [modalCompra, setModalCompra] = useState({ abierto: false, destino: null, horarios: [], idOperadora: null });
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);
  const [comprando, setComprando] = useState(false);
  const [modalVideo, setModalVideo] = useState({ abierto: false, destino: null, operadora: null });
  // Estado para controlar el colapso de rutas por destino
  const [rutasExpandida, setRutasExpandida] = useState({});

  // 🚀 TanStack Query: Operadoras públicas (cache compartido con otras páginas)
  const { 
    data: operadorasData = [], 
    isLoading: operadorasLoading, 
    error: operadorasError 
  } = useQuery({
    queryKey: ['operadoras-publico'],
    queryFn: obtenerOperadorasPublico,
    staleTime: 15 * 60 * 1000, // 15 min - datos relativamente estáticos
    cacheTime: 30 * 60 * 1000, // 30 min - cache agresivo (compartido)
    refetchOnMount: false,
    // Cache compartido con página Cooperativas para máxima eficiencia
  });

  // 🚀 TanStack Query: Búsqueda de destinos con debounce optimizado
  const shouldSearchDestinos = searchTerm.length > 2 && showSugerencias;

  const { 
    data: destinosSugeridos = [], 
    isLoading, 
    error,
    isFetching: isSearching
  } = useQuery({
    queryKey: ['destinos-autocomplete', searchTerm],
    queryFn: () => buscarDestinosAutocomplete(searchTerm),
    enabled: shouldSearchDestinos,
    staleTime: 2 * 60 * 1000, // 2 minutos - búsquedas frecuentes
    cacheTime: 5 * 60 * 1000, // 5 minutos en memoria
    retry: 1,
    refetchOnMount: false,
    // Estrategia de cache: mantener resultados populares más tiempo
    structuralSharing: true, // Optimización de re-renders
  });

  // 🚀 TanStack Query: Buscar operadoras por destino seleccionado
  const { 
    data: operadorasEncontradas = [], 
    isLoading: isLoadingOperadoras, 
    error: errorOperadoras 
  } = useQuery({
    queryKey: ['operadoras-por-destino', destinoSeleccionado?.descripcion],
    queryFn: () => buscarDestinosYOperadoras(destinoSeleccionado.descripcion),
    enabled: shouldSearchOperadoras && !!destinoSeleccionado,
    staleTime: 3 * 60 * 1000, // 3 min - combinaciones destino-operadora
    cacheTime: 10 * 60 * 1000, // 10 min - cache medio para búsquedas
    retry: 1,
    refetchOnMount: false,
    // Cache por destino específico - optimizado para re-búsquedas
  });

  // 🚀 TanStack Query: Buscar destinos de operadora seleccionada
  const { 
    data: destinosEncontrados = [], 
    isLoading: isLoadingDestinos, 
    error: errorDestinos 
  } = useQuery({
    queryKey: ['destinos-operadora', searchParams?.operadoraId, searchParams?.destinoDescripcion, searchParams?.tipoBusqueda],
    queryFn: () => buscarDestinosPorOperadora(
      searchParams.operadoraId, 
      searchParams.destinoDescripcion, 
      searchParams.tipoBusqueda
    ),
    enabled: shouldSearchDestinosOperadora && !!searchParams,
    staleTime: 5 * 60 * 1000, // 5 min - destinos por operadora (medio-dinámico)
    cacheTime: 15 * 60 * 1000, // 15 min - cache extendido para navegación
    retry: 1,
    refetchOnMount: false,
    // Cache específico por operadora+destino+tipo para optimizar repeticiones
  });

  // 🚀 TanStack Query: Buscar horarios para cada destino (múltiples queries paralelas)
  const horariosQueries = useQueries({
    queries: destinosEncontrados.map((destino) => ({
      queryKey: ['horarios-destino', destino.id_destino, searchParams?.operadoraId],
      queryFn: () => buscarHorariosPorDestino(destino.id_destino, searchParams.operadoraId),
      enabled: !!destino.id_destino && !!searchParams?.operadoraId,
      staleTime: 3 * 60 * 1000, // 3 min - horarios (datos dinámicos)
      cacheTime: 10 * 60 * 1000, // 10 min - cache medio para horarios
      retry: 1,
      refetchOnMount: false,
      // Queries paralelas optimizadas - una por destino para máximo rendimiento
    })),
  });

  // Procesar resultados de horarios y crear el mapa
  const horariosPorDestino = useMemo(() => {
    const horariosMap = {};
    destinosEncontrados.forEach((destino, index) => {
      const queryResult = horariosQueries[index];
      if (queryResult?.data) {
        horariosMap[destino.id_destino] = queryResult.data;
      }
    });
    return horariosMap;
  }, [destinosEncontrados, horariosQueries]);

  // Estados combinados para mostrar loading/error de horarios
  const isLoadingHorarios = horariosQueries.some(query => query.isLoading);
  const errorHorarios = horariosQueries.find(query => query.error)?.error;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sugerenciasRef.current && !sugerenciasRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSugerencias(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ✅ useEffect eliminado - ahora manejado por TanStack Query

  const handleSelectDestino = (destino) => {
    setSearchTerm(destino.descripcion);
    setShowSugerencias(false);
    setDestinoSeleccionado(destino);
    setHorariosSeleccionados([]);
    setOperadoraSeleccionada(null);
    // 🚀 Activar búsqueda de operadoras con TanStack Query
    setShouldSearchOperadoras(true);
    console.log("Destino seleccionado:", destino.descripcion);
  };

  const handleSelectOperadora = (operadora) => {
    console.log("Operadora seleccionada (datos completos):", operadora);

    if (!destinoSeleccionado) {
      console.error("No hay destino seleccionado");
      return;
    }

    if (!operadora?.id_operadora) {
      console.error("ID de operadora no válido:", operadora);
      return;
    }

    const operadoraId = Number(operadora.id_operadora);

    if (isNaN(operadoraId)) {
      console.error("ID de operadora inválido después de conversión:", operadoraId);
      return;
    }

    console.log("Datos para búsqueda de destinos:", {
      operadoraId,
      operadoraNombre: operadora.operadora_nombre,
      destinoDescripcion: destinoSeleccionado.descripcion,
      tipoBusqueda: operadora.tipo_busqueda
    });

    // 🚀 Configurar parámetros para TanStack Query
    setSearchParams({
      operadoraId,
      destinoDescripcion: destinoSeleccionado.descripcion,
      tipoBusqueda: operadora.tipo_busqueda
    });
    setOperadoraSeleccionada(operadora);
    // Activar búsqueda de destinos con TanStack Query
    setShouldSearchDestinosOperadora(true);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Limpiar estados cuando el término de búsqueda esté vacío
    if (value.length === 0) {
        // Limpiar todos los estados relacionados con la búsqueda
        setOperadoraSeleccionada(null);
        setShowSugerencias(false);
        setShouldSearchOperadoras(false);
        setShouldSearchDestinosOperadora(false);
        setSearchParams(null);
        return;
    }

    // 🚀 TanStack Query maneja automáticamente la búsqueda
    if (value.length >= 2) {
        setShowSugerencias(true);
    } else {
        setShowSugerencias(false);
    }
  };

  const handleInputFocus = () => {
    if (searchTerm.length > 2) {
      setShowSugerencias(true);
    }
  };

  const formatTime = (time) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDiasOperacion = (dias) => {
    if (!dias) return 'No disponible';
    const diasMap = {
      'LUNES': 'Lun',
      'MARTES': 'Mar',
      'MIERCOLES': 'Mié',
      'JUEVES': 'Jue',
      'VIERNES': 'Vie',
      'SABADO': 'Sáb',
      'DOMINGO': 'Dom'
    };
    return Array.isArray(dias) ? dias.map(dia => diasMap[dia] || dia).join(', ') : dias;
  };

  function formatTime12h(time) {
    if (!time) return '';
    const [hour, minute] = time.split(":");
    const date = new Date();
    date.setHours(parseInt(hour, 10));
    date.setMinutes(parseInt(minute, 10));
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // la hora '0' debe ser '12'
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes} ${ampm}`;
  }

  // Función para formatear horario en formato 24h con AM/PM
  function formatHoraAMPM(horaStr) {
    if (!horaStr) return '';
    // Acepta formatos como '22:15', '08:00', etc.
    const [h, m] = horaStr.split(":");
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    // Mantener formato 24h pero agregar AM/PM
    return `${horaStr} ${ampm}`;
  }

  const handleAbrirModalCompra = (destino, horarios, idOperadora) => {
    // Normalizar los horarios para el modal
    const horariosNormalizados = (horarios || []).map((h, idx) => {
      if (h.hora_salida && h.id_horario) return h;
      // Si solo tiene descripcion, intentar extraer la hora
      return {
        hora_salida: h.hora_salida || h.descripcion || '',
        id_horario: h.id_horario || h.id || idx,
      };
    });
    setModalCompra({ abierto: true, destino, horarios: horariosNormalizados, idOperadora });
    setHorarioSeleccionado(null);
  };

  const handleCerrarModalCompra = () => {
    setModalCompra({ abierto: false, destino: null, horarios: [], idOperadora: null });
    setHorarioSeleccionado(null);
  };

  const handleConfirmarCompra = async () => {
    if (!horarioSeleccionado || !modalCompra.destino || !modalCompra.idOperadora) return;
    setComprando(true);
    try {
      // 🚀 Usar datos cached de TanStack Query en lugar de fetch manual
      const operadora = operadorasData.find(op => op.id === modalCompra.idOperadora || op.id_operadora === modalCompra.idOperadora);
      const telefono = operadora?.telefono;
      if (!telefono) {
        alert('No se encontró el número de la operadora.');
        setComprando(false);
        return;
      }
      const mensaje = encodeURIComponent(`Hola, deseo comprar un boleto para el destino ${modalCompra.destino.descripcion_destino} (Ruta: ${modalCompra.destino.ruta_descripcion}) en el horario ${formatHoraAMPM(horarioSeleccionado)}.`);
      const url = `https://wa.me/${telefono}?text=${mensaje}`;
      window.open(url, '_blank');
      handleCerrarModalCompra();
    } catch (e) {
      alert('Error al obtener el número de la operadora.');
    }
    setComprando(false);
  };

  // Nuevo: detectar si los resultados son por ruta
  const resultadosPorRuta = destinosSugeridos.length > 0 && destinosSugeridos.every(d => d.por_ruta === true);

  // Función para mostrar primer y último bloque de palabras de la ruta
  function getRutaColapsada(ruta, minWords = 3) {
    if (!ruta) return '';
    const palabras = ruta.split(/\s+/);
    if (palabras.length <= minWords * 2 + 1) return ruta;
    const inicio = palabras.slice(0, minWords).join(' ');
    const fin = palabras.slice(-minWords).join(' ');
    return `${inicio} - ${fin}`;
  }

  // Función para verificar y abrir modal de video
  const handleOpenVideoModal = async (destino, operadora) => {
    try {
      // Verificar si existe video para este destino
      const idDestino = destino.id_destino || destino.id;
      const { data: multimedia, error } = await supabase
        .from('multimedia')
        .select('video')
        .eq('id_destino', idDestino)
        .maybeSingle();

      // Verificar si hay video válido
      const tieneVideo = multimedia?.video && 
        multimedia.video !== 'link' && 
        multimedia.video !== '' && 
        multimedia.video !== null;

      if (!tieneVideo) {
        toast('No hay video disponible para este destino', {
          icon: '🎬',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
        return;
      }

      // Si hay video, abrir el modal
      setModalVideo({ abierto: true, destino: destino, operadora: operadora });
    } catch (error) {
      console.error('Error al verificar video:', error);
      toast.error('Error al verificar la disponibilidad del video');
    }
  };

  return (
    <Container>
      <PublicHeader stateConfig={{ state: state, setState: () => setState(!state) }} isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
      <ContentContainer>
        <Title>¿A dónde quieres viajar?</Title>
        <Form>
          <InputGroup>
            <InputText icono={<v.icononombre />}>
              <input
                ref={inputRef}
                className="form__field"
                type="text"
                placeholder=""
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={handleInputFocus}
                autoComplete="off"
              />
              <label className="form__label">Ingrese su destino</label>
            </InputText>
            {error && <ErrorMessage>Error al buscar destinos. Por favor, intente nuevamente.</ErrorMessage>}
            {(isLoading || isSearching) && <LoadingMessage>Buscando destinos...</LoadingMessage>}
            {showSugerencias && destinosSugeridos.length > 0 && (
              <SugerenciasContainer ref={sugerenciasRef}>
                {destinosSugeridos.map((destino, index) => (
                  <SugerenciaItem 
                    key={index}
                    onClick={() => handleSelectDestino(destino)}
                  >
                    <div className="destino-info">
                      <span className="destino-nombre">
                        <span style={{ marginRight: '8px' }}>📍</span>
                        {destino.descripcion}
                      </span>
                    </div>
                  </SugerenciaItem>
                ))}
              </SugerenciasContainer>
            )}
            {showSugerencias && resultadosPorRuta && !isLoading && (
              <div style={{
                color: '#1bc47d',
                background: 'rgba(27,196,125,0.10)',
                border: '1.5px solid #1bc47d',
                borderRadius: '8px',
                fontSize: '0.93rem',
                marginTop: 10,
                fontWeight: 600,
                padding: '7px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 12px #1bc47d22',
                animation: 'fadeInRutaMsg 0.7s',
              }}>
                <span style={{fontSize:'1.1em',fontWeight:700,marginRight:3,display:'flex',alignItems:'center'}}>🛣️</span>
                No existe un destino directo pero sí el siguiente destino que cubre esa ruta
                <style>{`@keyframes fadeInRutaMsg { from { opacity: 0; transform: translateY(10px);} to { opacity: 1; transform: none;} }`}</style>
              </div>
            )}
            {showSugerencias && !isLoading && destinosSugeridos.length === 0 && searchTerm.length > 2 && (
              <NoResultsMessage>No se encontraron destinos</NoResultsMessage>
            )}
          </InputGroup>

          {!searchTerm && !operadorasEncontradas.length && (
            <GifContainer>
              <img 
                src="https://i.ibb.co/BV7GgTpn/personal-de-la-aerol-nea.gif" 
                alt="Personal de la aerolínea"
              />
            </GifContainer>
          )}

          {operadorasEncontradas.length > 0 && (
            <ResultsContainer>
              <OperadorasSection>
                <SectionTitle>Seleccione una operadora</SectionTitle>
                {isLoadingOperadoras && (
                  <LoadingMessage>Buscando operadoras...</LoadingMessage>
                )}
                {errorOperadoras && (
                  <ErrorMessage>Error al buscar operadoras. Por favor, intente nuevamente.</ErrorMessage>
                )}
                <OperadorasList>
                  {operadorasEncontradas.map((operadora) => (
                    <OperadoraButton
                      key={`operadora-${operadora.id_operadora}`}
                      onClick={() => handleSelectOperadora(operadora)}
                      selected={operadoraSeleccionada?.id_operadora === operadora.id_operadora}
                    >
                      <span className="bus-icon">🚌</span>
                      <span className="operadora-nombre">
                        {operadora.operadora_nombre}
                      </span>
                    </OperadoraButton>
                  ))}
                </OperadorasList>
              </OperadorasSection>

              {operadoraSeleccionada && (
                <HorariosSection>
                  <SectionTitle>
                    Destinos y Horarios - {operadoraSeleccionada.operadora_nombre}
                  </SectionTitle>
                  {(isLoadingDestinos || isLoadingHorarios) && (
                    <LoadingMessage>
                      {isLoadingDestinos ? 'Buscando destinos...' : 'Cargando horarios...'}
                    </LoadingMessage>
                  )}
                  {errorDestinos && (
                    <ErrorMessage>Error al cargar destinos. Por favor, intente nuevamente.</ErrorMessage>
                  )}
                  {errorHorarios && (
                    <ErrorMessage>Error al cargar horarios. Por favor, intente nuevamente.</ErrorMessage>
                  )}
                  {destinosEncontrados.length > 0 ? (
                    <DestinosGrid>
                      {destinosEncontrados.map((destino) => {
                        // Agrupar rutas y horarios para este destino
                        const rutasAgrupadas = [];
                        // Buscar todas las rutas únicas para este destino
                        const rutasUnicas = destinosEncontrados.filter(d => d.id_destino === destino.id_destino)
                          .reduce((acc, d) => {
                            if (!acc.some(r => r.ruta_descripcion === d.ruta_descripcion)) {
                              acc.push({
                                idruta: d.idruta,
                                ruta_descripcion: d.ruta_descripcion,
                                precio: d.precio,
                                precioespecial: d.precioespecial,
                              });
                            }
                            return acc;
                          }, []);
                        // Para cada ruta, asociar los horarios
                        rutasUnicas.forEach(ruta => {
                          // Tomar todos los horarios del destino (no filtrar por idruta)
                          const horarios = horariosPorDestino[destino.id_destino] || [];
                          console.log('Horarios originales para destino', destino.id_destino, horarios);
                          ruta.horarios = horarios.map(h => ({
                            descripcion: h.descripcion || ''
                          }));
                          rutasAgrupadas.push(ruta);
                        });
                        // Preparar el objeto destino enriquecido
                        const destinoEnriquecido = {
                          id: destino.id_destino,
                          descripcion: destino.descripcion_destino,
                          provinciadestino: destino.provinciadestino,
                          ciudaddestino: destino.ciudaddestino,
                          rutas: rutasAgrupadas
                        };
                        // Controlar colapso de ruta
                        const isRutaExpandida = rutasExpandida[destino.id_destino];
                        const toggleRutaExpandida = () => setRutasExpandida(prev => ({ ...prev, [destino.id_destino]: !prev[destino.id_destino] }));
                        return (
                          <DestinoCard key={`destino-${destino.id_destino}-${destino.ruta_descripcion}`}>
                            <DestinoHeader>
                              <DestinoTitulo>
                                <span className="icon">📍</span>
                                {destino.descripcion_destino}
                              </DestinoTitulo>
                              <DestinoRuta>
                                <span className="label">Ruta:</span>
                                <span className={`value ruta-colapsable${isRutaExpandida ? ' expanded' : ''}`}>
                                  {isRutaExpandida ? destino.ruta_descripcion : getRutaColapsada(destino.ruta_descripcion)}
                                </span>
                                {destino.ruta_descripcion && destino.ruta_descripcion.length > 60 && (
                                  <button
                                    className="btn-ver-mas"
                                    onClick={toggleRutaExpandida}
                                    type="button"
                                    style={{marginLeft:8, background:'none', border:'none', color:'#3a4b86', cursor:'pointer', fontWeight:600, fontSize:'0.95em'}}>
                                    {isRutaExpandida ? 'Ver menos' : 'Ver más'}
                                  </button>
                                )}
                              </DestinoRuta>
                              <DestinoPrecio>
                                <span className="label">Precio:</span>
                                <span className="value">${destino.precio?.toFixed(2)}</span>
                              </DestinoPrecio>
                              <button
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, background: '#3a4b86', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontWeight: 500, fontSize: '0.95rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                }}
                                onClick={() => handleOpenVideoModal(destinoEnriquecido, operadoraSeleccionada)}
                              >
                                <svg width="20" height="20" fill="currentColor" style={{ marginRight: 6 }} viewBox="0 0 24 24"><path d="M17 10.5V7c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-3.5l4 4v-11l-4 4z"></path></svg>
                                Conocer
                              </button>
                            </DestinoHeader>
                            <HorariosList>
                              <HorariosTitle>Horarios de salida:</HorariosTitle>
                              {horariosPorDestino[destino.id_destino]?.length > 0 ? (
                                <HorariosItemsRow className="horarios-scrollable">
                                  {horariosPorDestino[destino.id_destino].map((horario) => (
                                    <HorarioItem key={`horario-${horario.id_horario}`}>
                                      <span className="icon">🕒</span>
                                      {formatHoraAMPM(horario.descripcion)}
                                    </HorarioItem>
                                  ))}
                                </HorariosItemsRow>
                              ) : (
                                <NoHorariosMessage>
                                  No hay horarios disponibles para este destino
                                </NoHorariosMessage>
                              )}
                            </HorariosList>
                            <Divider />
                            <WhatsappButton
                              onClick={() => handleAbrirModalCompra(destino, horariosPorDestino[destino.id_destino], operadoraSeleccionada?.id_operadora || operadoraSeleccionada?.id)}
                              disabled={!horariosPorDestino[destino.id_destino]?.length}
                            >
                              <WhatsappIcon viewBox="0 0 32 32">
                                <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.393L4 29l7.824-2.05C13.41 27.633 14.678 28 16 28c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.18 0-2.33-.205-3.41-.607l-.243-.09-4.646 1.217 1.24-4.53-.158-.234C6.82 18.07 6 16.573 6 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.29-7.71c-.29-.145-1.71-.844-1.974-.94-.264-.097-.456-.145-.648.145-.193.29-.744.94-.912 1.133-.168.193-.336.217-.626.072-.29-.145-1.225-.452-2.334-1.44-.863-.77-1.445-1.72-1.616-2.01-.168-.29-.018-.447.127-.592.13-.13.29-.336.435-.504.145-.168.193-.29.29-.483.097-.193.048-.362-.024-.507-.072-.145-.648-1.566-.888-2.15-.234-.563-.474-.487-.648-.496-.168-.007-.362-.009-.555-.009-.193 0-.507.072-.773.362-.266.29-1.016.994-1.016 2.423 0 1.429 1.04 2.809 1.186 3.004.145.193 2.05 3.13 5.07 4.267.71.244 1.263.39 1.695.499.712.181 1.36.156 1.872.095.571-.067 1.71-.698 1.953-1.372.24-.674.24-1.252.168-1.372-.072-.12-.264-.193-.555-.338z" />
                              </WhatsappIcon>
                              Comprar
                            </WhatsappButton>
                          </DestinoCard>
                        );
                      })}
                    </DestinosGrid>
                  ) : !isLoadingHorarios && !errorHorarios && (
                    <NoHorariosMessage>
                      No hay destinos disponibles para esta operadora
                    </NoHorariosMessage>
                  )}
                </HorariosSection>
              )}
            </ResultsContainer>
          )}
        </Form>
      </ContentContainer>
      <FooterWrapper>
        <FooterInformativa />
      </FooterWrapper>
      {modalCompra.abierto && (
        <ModalOverlay>
          <ModalContent>
            <h3>Selecciona un horario de salida</h3>
            <HorariosModalList>
              {modalCompra.horarios.map((horario) => (
                <HorarioModalItem
                  key={horario.id_horario}
                  selected={horarioSeleccionado === horario.hora_salida}
                  onClick={() => setHorarioSeleccionado(horario.hora_salida)}
                >
                  {formatHoraAMPM(horario.hora_salida)}
                </HorarioModalItem>
              ))}
            </HorariosModalList>
            <ModalActions>
              <button onClick={handleCerrarModalCompra} disabled={comprando}>Cancelar</button>
              <button onClick={handleConfirmarCompra} disabled={!horarioSeleccionado || comprando} style={{background:'#25D366', color:'#fff'}}>Confirmar</button>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
      <VideoModal
        isOpen={modalVideo.abierto}
        onClose={() => setModalVideo({ abierto: false, destino: null, operadora: null })}
        destination={modalVideo.destino}
        operator={modalVideo.operadora}
      />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f0f2f5;
  align-items: center;
  justify-content: flex-start;
  padding: 20px;
  box-sizing: border-box;
`;

const ContentContainer = styled.div`
  background-color: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 800px;
  width: 100%;
  margin-top: 100px;
  margin-bottom: 40px;
  box-sizing: border-box;
`;

const Title = styled.h2`
  font-size: 2.2rem;
  color: #3a4b86;
  margin-bottom: 30px;
  font-weight: 600;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
  width: 100%;
`;

const InputGroup = styled.div`
  width: 50%;
  position: relative;
  margin: 0 auto;
`;

const GifContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 20px;
  
  img {
    max-width: 250px;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const SelectorContainer = styled.div`
  flex-grow: 1;
  .ContainerSelector {
    width: 100%;
  }
`;

const SearchButton = styled.button`
  background-color: #f8bf5b;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 15px 40px;
  font-size: 1.3rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  margin-top: 20px;
  width: auto;
  min-width: 200px;
  align-self: center;

  &:hover {
    background-color: #e0a84d;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const FooterWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
  margin-bottom: 20px;
  width: 100%;
`;

const OperadorasSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
`;

const HorariosSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  margin-top: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  color: #3a4b86;
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
  font-weight: 600;
`;

const OperadorasList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 0;
`;

const OperadoraButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: ${props => props.selected ? '#3a4b86' : 'white'};
  color: ${props => props.selected ? 'white' : '#333'};
  border: 2px solid ${props => props.selected ? '#3a4b86' : '#e0e0e0'};
  border-radius: 8px;
  font-size: 1rem;
  font-weight: ${props => props.selected ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 200px;

  &:hover {
    background: ${props => props.selected ? '#3a4b86' : '#f8f9fa'};
    border-color: ${props => props.selected ? '#3a4b86' : '#3a4b86'};
    transform: translateY(-1px);
  }

  .bus-icon {
    font-size: 1.2rem;
  }

  .operadora-nombre {
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const DestinosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 10px 0;
`;

const DestinoCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const DestinoHeader = styled.div`
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
`;

const DestinoTitulo = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: #3a4b86;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;

  .icon {
    font-size: 1.2rem;
  }
`;

const DestinoRuta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  .value.ruta-colapsable {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 320px;
    white-space: normal;
    word-break: break-word;
    transition: max-height 0.2s;
  }
  .value.ruta-colapsable.expanded {
    -webkit-line-clamp: unset;
    max-height: none;
    overflow: visible;
  }
`;

const DestinoPrecio = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;

  .label {
    color: #666;
    font-weight: 500;
  }

  .value {
    color: #28a745;
    font-weight: 600;
  }
`;

const HorariosList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
`;

const HorarioItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #e9ecef;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #495057;

  .icon {
    font-size: 0.9rem;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  text-align: left;
`;

const LoadingMessage = styled.div`
  color: #6c757d;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  text-align: left;
`;

const NoResultsMessage = styled.div`
  color: #6c757d;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  text-align: left;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 4px;
`;

const SugerenciasContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-top: 5px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 9999;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 100%;
  width: max-content;
  min-width: 100%;
  max-width: 800px;
`;

const SugerenciaItem = styled.div`
  padding: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f5f5f5;
  }

  .destino-info {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .destino-nombre {
    font-weight: 500;
    color: #333;
    font-size: 1rem;
    line-height: 1.4;
    word-wrap: break-word;
    white-space: normal;
    display: block;
  }
`;

const NoHorariosMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  font-size: 1.1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 1rem 0;
  border: 1px dashed #dee2e6;
`;

const FooterContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-around;
    align-items: flex-start;
  }
`;

const FooterColumn = styled.div`
  flex: 1;
  min-width: 200px;
  max-width: 350px;
  display: flex;
  flex-direction: column;
  // ...
`;

const Divider = styled.div`
  border-top: 1px solid #e9ecef;
  margin: 18px 0 10px 0;
`;

const WhatsappButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  background-color: #25D366 !important;
  color: white;
  font-weight: 500;
  border: none;
  border-radius: 5px;
  padding: 6px 12px;
  font-size: 0.95rem;
  text-decoration: none;
  margin-top: 0px;
  margin-left: 0;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  width: fit-content;
  min-width: 0;
  &:hover {
    background-color: #128C7E !important;
    color: white;
  }
  &:disabled, &[disabled] {
    background: #bdbdbd;
    color: #f5f5f5;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

const WhatsappIcon = styled.svg`
  width: 22px;
  height: 22px;
  fill: white;
`;

const HorariosTitle = styled.div`
  font-weight: 600;
  color: #3a4b86;
  margin-bottom: 6px;
  font-size: 1rem;
`;

const HorariosItemsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 6px;
  max-height: 4.5em;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #bdbdbd #f5f5f5;
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #bdbdbd;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background: #f5f5f5;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 30px 24px 18px 24px;
  min-width: 320px;
  max-width: 90vw;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const HorariosModalList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 18px 0 10px 0;
`;

const HorarioModalItem = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  border: 2px solid #e9ecef;
  background: ${({selected}) => selected ? '#25D366' : '#f8f9fa'};
  color: ${({selected}) => selected ? '#fff' : '#333'};
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  &:hover {
    background: #25D366;
    color: #fff;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 18px;
  button {
    padding: 8px 18px;
    border-radius: 6px;
    border: none;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    background: #e9ecef;
    color: #333;
    transition: all 0.2s;
    &:hover:enabled {
      background: #25D366;
      color: #fff;
    }
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;

const MobileHamburgerMenuContainer = styled.div`
  display: none;
  @media (max-width: 900px) {
    display: block;
  }
`; 