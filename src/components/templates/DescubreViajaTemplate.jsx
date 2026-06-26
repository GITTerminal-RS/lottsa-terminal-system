import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaHeart, FaTimes, FaChevronLeft, FaChevronRight, FaClock, FaPlay, FaMapMarkerAlt, FaBus, FaMoneyBillWave, FaBuilding, FaEllipsisH, FaPhone } from 'react-icons/fa';
import { supabase } from '../../index';
import toast from 'react-hot-toast';
import { useSwipeable } from 'react-swipeable';

const Fondo = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  width: 100vw; height: 100vh;
  background: #181828;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;
const Contenido = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 100vw;
  height: 100vh;
  justify-content: center;
  @media (max-width: 900px) {
    flex-direction: column;
    align-items: center;
    height: auto;
    min-height: 100vh;
  }
`;
const CerrarBtn = styled.button`
  position: absolute;
  top: 24px;
  left: 24px;
  background: rgba(0,0,0,0.5);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  font-size: 1.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10001;
`;
const VideoBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  width: 100%;
  height: 100vh;
  max-width: 700px;
  max-height: 100vh;
  border-radius: 18px 0 0 18px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  @media (max-width: 900px) {
    border-radius: 0;
    width: 100vw;
    max-width: 100vw;
    height: 100vh;
    min-height: 100vh;
    position: relative;
  }
`;
const Video = styled.video`
  max-width: 100%;
  max-height: 100vh;
  width: auto;
  height: auto;
  object-fit: contain;
  background: #000;
  display: block;
  @media (max-width: 900px) {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;
const Info = styled.div`
  margin-top: 0;
  background: rgba(255,255,255,0.97);
  border-radius: 0 18px 18px 0;
  padding: 32px 28px 32px 28px;
  min-width: 320px;
  max-width: 500px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
  @media (max-width: 900px) {
    border-radius: 0 0 18px 18px;
    max-width: 100vw;
    min-width: 0;
    padding: 20px 10px;
    max-height: none;
  }
`;
const Titulo = styled.h2`
  font-size: 1.5rem;
  color: #3a4b86;
  margin: 0 0 8px 0;
`;
const Sub = styled.div`
  font-size: 1.1rem;
  color: #222;
  margin-bottom: 4px;
`;
const Ruta = styled.div`
  font-size: 1.1rem;
  color: #444;
  margin-bottom: 4px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  
  .ruta-colapsable {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    white-space: normal;
    word-break: break-word;
    transition: max-height 0.2s;
    flex: 1;
    
    @media (max-width: 900px) {
      font-size: 1rem;
    }
  }
  
  .ruta-colapsable.expanded {
    -webkit-line-clamp: unset;
    max-height: none;
    overflow: visible;
  }
`;
const Precio = styled.div`
  font-size: 1.1rem;
  color: #fc6027;
  margin-bottom: 4px;
`;
const Horarios = styled.div`
  font-size: 1rem;
  color: #3a4b86;
  margin-bottom: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;
const LikeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
`;
const LikeBtn = styled.button`
  background: none;
  border: none;
  color: #fc6027;
  font-size: 1.7rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.2s;
  &:hover { color: #e74c3c; }
  .heart-anim {
    animation: pop 0.3s;
  }
  @keyframes pop {
    0% { transform: scale(1); }
    50% { transform: scale(1.4); }
    100% { transform: scale(1); }
  }
`;
const NavBtn = styled.button`
  background: #3a4b86;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
`;
const HorariosList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 12px 0;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
  
  &.horarios-scrollable {
    /* Altura para mostrar exactamente 3 horarios */
    /* Cada horario: 1rem font + gap = ~24px */
    /* 3 horarios * 24px + 2 gaps de 12px = 96px */
    max-height: 96px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #bdbdbd #f5f5f5;
    flex-direction: column;
    gap: 6px;
    
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
    
    @media (max-width: 900px) {
      /* En móvil: altura reducida */
      max-height: 72px;
      gap: 4px;
    }
  }
`;
const HorarioItem = styled.li`
  font-size: 1rem;
  color: #444;
  display: flex;
  align-items: center;
  gap: 8px;
`;
const RutaCard = styled.div`
  background: #f8f9fa;
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 18px;
  box-shadow: 0 2px 8px rgba(58,75,134,0.07);
`;
const MobileControls = styled.div`
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 1002;
  @media (min-width: 901px) { display: none; }
`;
const VerMasBtn = styled.button`
  background: #fff;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(58,75,134,0.13);
  font-size: 1.7rem;
  color: #3a4b86;
  cursor: pointer;
`;
const LikeBtnMobile = styled(LikeBtn)`
  background: #fff;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(58,75,134,0.13);
  padding: 0;
  margin: 0;
  .count {
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255,255,255,0.9);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.9rem;
  }
`;
const SwipeHint = styled.div`
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255,255,255,0.9);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #3a4b86;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1002;
  animation: fadeOut 3s forwards;
  @keyframes fadeOut {
    0% { opacity: 1; }
    70% { opacity: 1; }
    100% { opacity: 0; }
  }
  @media (min-width: 901px) { display: none; }
`;
const DestinoMobile = styled.div`
  position: absolute;
  top: 18px;
  left: 18px;
  background: rgba(255,255,255,0.92);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 1.1rem;
  color: #fc6027;
  font-weight: bold;
  z-index: 1002;
  @media (min-width: 901px) { display: none; }
`;
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  z-index: 20000;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const ModalContent = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 28px 18px 18px 18px;
  min-width: 80vw;
  max-width: 95vw;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;
const CloseModalBtn = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #3a4b86;
  cursor: pointer;
`;

// 🚀 Styled components para TanStack Query
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 200px;
`;

const LoadingText = styled.h2`
  font-size: 1.5rem;
  color: #fff;
  margin: 0;
  text-align: center;
`;

const LoadingSubtext = styled.p`
  font-size: 1rem;
  color: #bbb;
  margin: 0;
  text-align: center;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  min-height: 200px;
  padding: 20px;
`;

const ErrorText = styled.h2`
  font-size: 1.3rem;
  color: #fff;
  margin: 0;
  text-align: center;
`;

const RetryButton = styled.button`
  background: #fc6027;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #e74c3c;
  }
`;

export default function DescubreViajaTemplate({ onClose }) {
  const [current, setCurrent] = useState(0);
  const queryClient = useQueryClient();
  const [like, setLike] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeAnim, setLikeAnim] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  // Estado para controlar el colapso de rutas por destino
  const [rutasExpandida, setRutasExpandida] = useState({});

  // 🚀 TanStack Query: Cargar multimedia/videos de destinos
  const { 
    data: multimediaData = [], 
    isLoading: loadingDestinos, 
    error: multimediaError 
  } = useQuery({
    queryKey: ['multimedia-videos'],
    queryFn: async () => {
      const { data, error } = await supabase.from('multimedia').select('*');
      if (error) throw error;
      const proyectoActual = import.meta.env.VITE_APP_SUPABASE_URL?.replace('https://', '').replace('.supabase.co', '') || '';
      // Filtrar solo videos válidos del proyecto actual
      return (data || []).filter((m) => {
        if (!m.video || m.video === 'link') return false;
        if (m.video.includes('rgnpwminvztocawdbvus')) return false;
        if (proyectoActual && m.video.includes('.supabase.co') && !m.video.includes(proyectoActual)) return false;
        return true;
      });
    },
    staleTime: 10 * 60 * 1000, // 10 min - videos son relativamente estáticos
    cacheTime: 20 * 60 * 1000, // 20 min - cache extendido para videos
    retry: 2,
    refetchOnMount: false,
    // 🚀 Sincronización en background
    refetchOnWindowFocus: true, // Refresh cuando el usuario vuelve
    refetchInterval: 15 * 60 * 1000, // Background refresh cada 15 minutos
    refetchIntervalInBackground: false, // Solo si la ventana está activa
  });

  // 🚀 TanStack Query: Cargar videos de publicidad
  const { 
    data: publicidadData = [], 
    isLoading: loadingPublicidad, 
    error: publicidadError 
  } = useQuery({
    queryKey: ['publicidad-videos'],
    queryFn: async () => {
      const { data, error } = await supabase.from('publicidad').select('*');
      if (error) {
        // Tabla publicidad puede no existir en proyectos restaurados antiguos
        if (error.code === 'PGRST205' || error.code === '42P01') return [];
        throw error;
      }
      const proyectoActual = import.meta.env.VITE_APP_SUPABASE_URL?.replace('https://', '').replace('.supabase.co', '') || '';
      return (data || []).filter((p) => {
        if (!p.video || p.video.trim() === '') return false;
        if (p.video.includes('rgnpwminvztocawdbvus')) return false;
        if (proyectoActual && p.video.includes('.supabase.co') && !p.video.includes(proyectoActual)) return false;
        return true;
      });
    },
    staleTime: 10 * 60 * 1000, // 10 min - videos son relativamente estáticos
    cacheTime: 20 * 60 * 1000, // 20 min - cache extendido para videos
    retry: 2,
    refetchOnMount: false,
    // 🚀 Sincronización en background
    refetchOnWindowFocus: true, // Refresh cuando el usuario vuelve
    refetchInterval: 15 * 60 * 1000, // Background refresh cada 15 minutos
    refetchIntervalInBackground: false, // Solo si la ventana está activa
  });

  // 🚀 Función para mezclar aleatoriamente videos de destinos y publicidad
  const mezclarVideosAleatoriamente = useMemo(() => {
    const videosDestinos = multimediaData.map(video => ({
      ...video,
      tipo: 'destino',
      id_unico: `destino_${video.id}`
    }));

    const videosPublicidad = publicidadData.map(video => ({
      ...video,
      tipo: 'publicidad',
      id_unico: `publicidad_${video.id}`,
      // Para publicidad, usar el campo 'video' directamente
      video: video.video,
      destino: {
        descripcion: video.descripcion
      },
      operadora: {
        nombre: video.referencia || 'Publicidad'
      },
      rutas: [],
      horarios: [],
      likes: video.likes || 0 // Inicializar likes para publicidad
    }));

    // Combinar y mezclar aleatoriamente
    const todosLosVideos = [...videosDestinos, ...videosPublicidad];
    
    // Algoritmo de mezcla aleatoria (Fisher-Yates)
    for (let i = todosLosVideos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [todosLosVideos[i], todosLosVideos[j]] = [todosLosVideos[j], todosLosVideos[i]];
    }

    return todosLosVideos;
  }, [multimediaData, publicidadData]);

  // Lista de multimedia válida (mezclada con publicidad)
  const multimediaList = mezclarVideosAleatoriamente;

  // 🚀 TanStack Query: Información detallada solo para videos de destinos
  const infoQueries = useQueries({
    queries: multimediaList
      .filter(m => m.tipo === 'destino') // Solo procesar videos de destinos
      .map((m) => ({
        queryKey: ['multimedia-info', m.id_unico],
        queryFn: async () => {
          // Para videos de destinos, buscar información adicional
          const [destinoRes, operadoraRes] = await Promise.all([
            supabase.from('destinos').select('*').eq('id', m.id_destino).single(),
            supabase.from('operadora').select('*').eq('id', m.id_operadora).single()
          ]);

          if (destinoRes.error || operadoraRes.error) {
            throw new Error('Error fetching basic info');
          }

          // Buscar rutas y horarios basados en el destino
          const [rutasRes, horariosRes] = await Promise.all([
            supabase.from('ruta').select('*').eq('id', destinoRes.data?.idruta),
            supabase.from('horarios').select('*').eq('id_destino', m.id_destino)
          ]);

        // Agrupar horarios por ruta
        const rutas = rutasRes.data?.map(ruta => ({
          ...ruta,
          horarios: horariosRes.data || []
        })) || [];

        return {
          ...m, // Incluir todos los datos originales (tipo, id_unico, etc.)
          destino: destinoRes.data,
          operadora: operadoraRes.data,
          rutas,
          video: m.video,
          likes: m.likes,
          multimediaId: m.id
        };
      },
      enabled: !!m.id_destino && !!m.id_operadora,
      staleTime: 8 * 60 * 1000, // 8 min - info de destinos/operadoras
      cacheTime: 15 * 60 * 1000, // 15 min - cache extendido
      retry: 1,
      refetchOnMount: false,
    })),
  });

  // Procesar resultados de info - manejar destinos y publicidad por separado
  const info = useMemo(() => {
    // Obtener datos de destinos de las queries
    const destinosData = infoQueries
      .filter(query => query.data)
      .map(query => query.data);

    // Obtener datos de publicidad directamente de multimediaList
    const publicidadData = multimediaList.filter(m => m.tipo === 'publicidad');

    // Combinar ambos tipos
    const allData = [...destinosData, ...publicidadData];
    
    // Ordenar según el orden original de multimediaList para mantener la mezcla aleatoria
    return multimediaList.map(originalItem => {
      const foundData = allData.find(item => item.id_unico === originalItem.id_unico);
      return foundData || originalItem;
    }).filter(item => item.video); // Solo videos válidos
  }, [infoQueries, multimediaList]);

  // Estados de loading combinados
  const infoLoading = infoQueries.some(query => query.isLoading);
  const combinedLoading = loadingDestinos || loadingPublicidad || infoLoading;

  // 🚀 TanStack Query: Mutación optimista para likes
  const likeMutation = useMutation({
    mutationFn: async ({ videoId, newLikesCount, videoType }) => {
      // Determinar qué tabla actualizar según el tipo de video
      const tableName = videoType === 'publicidad' ? 'publicidad' : 'multimedia';
      
      const { error } = await supabase
        .from(tableName)
        .update({ likes: newLikesCount })
        .eq('id', videoId);
      if (error) throw error;
      return { videoId, newLikesCount, videoType };
    },
    onMutate: async ({ videoId, newLike, newLikesCount }) => {
      // Update optimístico (UI instantáneo)
      setLikesCount(newLikesCount);
      setLike(newLike);
      setLikeAnim(true);
      
      // LocalStorage update
      if (newLike) {
        localStorage.setItem(`like_video_${videoId}`, '1');
      } else {
        localStorage.removeItem(`like_video_${videoId}`);
      }
      
      return { videoId, previousLikesCount: likesCount, previousLike: like };
    },
    onSuccess: (data, variables) => {
      // 🔧 NO invalidar cache para evitar refetches que cambien el video
      // Solo actualizar el cache directamente para mantener consistencia
      
      // Actualizar cache según el tipo de video
      if (variables.videoType === 'publicidad') {
        // Para videos de publicidad, NO actualizar el cache para evitar loops
        // El estado local ya se actualizó en onMutate
        console.log('🔧 DEBUG: Like de publicidad exitoso, no actualizando cache para evitar loops');
      } else {
        // Para videos de destinos, actualizar el cache de multimedia-info
        queryClient.setQueryData(['multimedia-info', variables.videoId], (oldData) => {
          if (oldData) {
            return {
              ...oldData,
              likes: variables.newLikesCount
            };
          }
          return oldData;
        });
      }
      
      toast.success(variables.newLike ? '¡Te gustó este video!' : 'Like removido');
      setTimeout(() => setLikeAnim(false), 350);
    },
    onError: (error, variables, context) => {
      // Rollback en caso de error
      if (context) {
        setLikesCount(context.previousLikesCount);
        setLike(context.previousLike);
        
        if (context.previousLike) {
          localStorage.setItem(`like_video_${variables.videoId}`, '1');
        } else {
          localStorage.removeItem(`like_video_${variables.videoId}`);
        }
      }
      toast.error('Error al actualizar el like');
      setTimeout(() => setLikeAnim(false), 350);
         }
   });

  // 🚀 Función para prefetch de videos adyacentes
  const prefetchAdjacentVideos = (currentIndex) => {
    if (!multimediaList.length) return;
    
    console.log('🔧 DEBUG: Prefetching para index', currentIndex); // Debug temporal
    
    const totalVideos = multimediaList.length;
    const nextIndex = (currentIndex + 1) % totalVideos;
    const prevIndex = (currentIndex - 1 + totalVideos) % totalVideos;
    
    // Prefetch info del próximo video
    const nextVideo = multimediaList[nextIndex];
    const prevVideo = multimediaList[prevIndex];
    
    if (nextVideo) {
      // 🔧 Prefetch solo si no está ya en cache para evitar refetches innecesarios
      const existingData = queryClient.getQueryData(['multimedia-info', nextVideo.id]);
      if (!existingData) {
        console.log('🔧 DEBUG: Prefetching video', nextVideo.id); // Debug temporal
        queryClient.prefetchQuery({
          queryKey: ['multimedia-info', nextVideo.id],
          queryFn: async () => {
            const [destinoRes, operadoraRes] = await Promise.all([
              supabase.from('destinos').select('*').eq('id', nextVideo.id_destino).single(),
              supabase.from('operadora').select('*').eq('id', nextVideo.id_operadora).single()
            ]);
            
            if (destinoRes.error || operadoraRes.error) return null;
            
            const [rutasRes, horariosRes] = await Promise.all([
              supabase.from('ruta').select('*').eq('id', destinoRes.data?.idruta),
              supabase.from('horarios').select('*').eq('id_destino', nextVideo.id_destino)
            ]);
            
            const rutas = rutasRes.data?.map(ruta => ({
              ...ruta,
              horarios: horariosRes.data || []
            })) || [];
            
            return {
              destino: destinoRes.data,
              operadora: operadoraRes.data,
              rutas,
              video: nextVideo.video,
              likes: nextVideo.likes,
              multimediaId: nextVideo.id
            };
          },
          staleTime: 8 * 60 * 1000,
          cacheTime: 15 * 60 * 1000,
        });
      }
    }
  };

  // Configuración del swipe
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNext(),
    onSwipedRight: () => handlePrev(),
    onSwipedUp: () => handleNext(),
    onSwipedDown: () => handlePrev(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: false
  });

  // Función para mostrar primer y último bloque de palabras de la ruta
  function getRutaColapsada(ruta, minWords = 3) {
    if (!ruta) return '';
    const palabras = ruta.split(/\s+/);
    if (palabras.length <= minWords * 2 + 1) return ruta;
    const inicio = palabras.slice(0, minWords).join(' ');
    const fin = palabras.slice(-minWords).join(' ');
    return `${inicio} - ${fin}`;
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

  // ✅ useEffect de multimedia eliminado - ahora manejado por TanStack Query

  // ✅ useEffect de info eliminado - ahora manejado por useQueries paralelas

  useEffect(() => {
    if (info.length > 0 && multimediaList.length > 0) {
      const m = multimediaList[current];
      const currentInfo = info[current];
      
      // 🔧 Solo actualizar likes cuando cambia el video (current), NO cuando cambia cache
      // Revisar localStorage para este video
      const liked = m?.id ? localStorage.getItem(`like_video_${m.id}`) === '1' : false;
      setLike(liked);
      
      // Usar likes del info inicial, NO del cache (para evitar loops)
      setLikesCount(currentInfo?.likes ?? 0);
    }
  }, [current, multimediaList]); // 🔧 Removido 'info' de dependencies para evitar loops

  useEffect(() => {
    // Ocultar el hint de swipe después de 3 segundos
    if (showSwipeHint) {
      const timer = setTimeout(() => setShowSwipeHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSwipeHint]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLike = () => {
    if (!info.length || likeMutation.isLoading) return;
    
    const m = multimediaList[current];
    if (!m?.id) return; // 🔧 Verificación adicional
    
    const videoId = m.id;
    const videoType = m.tipo || 'destino'; // Determinar tipo de video
    const newLike = !like;
    const newLikesCount = newLike ? likesCount + 1 : Math.max(0, likesCount - 1);

    console.log('🔧 DEBUG: Ejecutando like', { videoId, videoType, current, newLike, newLikesCount }); // Debug temporal

    // 🚀 Ejecutar mutación optimista
    likeMutation.mutate({
      videoId,
      videoType,
      newLike,
      newLikesCount
    });
  };

  const handlePrev = () => {
    console.log('🔧 DEBUG: handlePrev ejecutado'); // Debug temporal
    setCurrent((prev) => {
      const newIndex = prev === 0 ? info.length - 1 : prev - 1;
      console.log('🔧 DEBUG: Cambiando a video anterior', prev, '->', newIndex); // Debug temporal
      // 🚀 Prefetch del video anterior
      prefetchAdjacentVideos(newIndex);
      return newIndex;
    });
  };
  const handleNext = () => {
    console.log('🔧 DEBUG: handleNext ejecutado'); // Debug temporal
    setCurrent((prev) => {
      const newIndex = prev === info.length - 1 ? 0 : prev + 1;
      console.log('🔧 DEBUG: Cambiando a video siguiente', prev, '->', newIndex); // Debug temporal
      // 🚀 Prefetch del siguiente video
      prefetchAdjacentVideos(newIndex);
      return newIndex;
    });
  };

  // 🚀 Loading state optimizado
  if (combinedLoading && !info.length) {
    return (
      <Fondo>
        <Contenido>
          <LoadingContainer>
            <LoadingText>Cargando videos...</LoadingText>
            <LoadingSubtext>Preparando experiencia multimedia</LoadingSubtext>
          </LoadingContainer>
        </Contenido>
      </Fondo>
    );
  }

  // Error state
  if (multimediaError) {
    return (
      <Fondo>
        <Contenido>
          <ErrorContainer>
            <ErrorText>❌ Error al cargar videos</ErrorText>
            <RetryButton onClick={() => queryClient.invalidateQueries(['multimedia-videos'])}>
              Reintentar
            </RetryButton>
          </ErrorContainer>
        </Contenido>
      </Fondo>
    );
  }
  if (!info.length) return <Fondo><Contenido>No hay videos disponibles.</Contenido></Fondo>;

  const data = info[current];

  return (
    <Fondo>
      <CerrarBtn onClick={onClose}><FaTimes /></CerrarBtn>
      <Contenido style={isMobile ? {flexDirection:'column', alignItems:'center', height:'100vh', overflow:'hidden'} : {}}>
        <VideoBox {...swipeHandlers}>
          {data.video ? (
            <>
              {isMobile && (
                <>
                  <DestinoMobile>
                    {data.tipo === 'publicidad' ? (
                      <>
                        <span style={{color:'#3a4b86'}}>Publicidad:</span> {data.destino?.descripcion}
                      </>
                    ) : (
                      <>
                        <span style={{color:'#3a4b86'}}>Destino:</span> {data.destino?.descripcion}
                      </>
                    )}
                  </DestinoMobile>
                  <MobileControls>
                    <VerMasBtn onClick={()=>setShowInfoModal(true)} aria-label="Ver más información">
                      <FaEllipsisH />
                    </VerMasBtn>
                    <LikeBtnMobile onClick={handleLike} disabled={likeMutation.isLoading} aria-label={like ? 'Quitar like' : 'Dar like'}>
                      <FaHeart className={likeAnim ? 'heart-anim' : ''} color={like ? '#e74c3c' : '#fc6027'} />
                      <span className="count">{likesCount}</span>
                    </LikeBtnMobile>
                  </MobileControls>
                  {showSwipeHint && (
                    <SwipeHint>
                      <FaChevronLeft /> Desliza horizontal o vertical para cambiar <FaChevronRight />
                    </SwipeHint>
                  )}
                </>
              )}
              <Video 
                src={data.video} 
                controls 
                autoPlay 
                playsInline 
                onEnded={handleNext}
              />
            </>
          ) : (
            <div className="video-placeholder">
              <FaPlay className="play-icon" />
              <span>No hay video disponible para este destino</span>
            </div>
          )}
        </VideoBox>
        {/* Modal de info en móvil */}
          {isMobile && showInfoModal && (
            <ModalOverlay>
              <ModalContent>
                <CloseModalBtn onClick={()=>setShowInfoModal(false)}><FaTimes /></CloseModalBtn>
                <Titulo>
                  {data.tipo === 'publicidad' ? (
                    <>
                      <span style={{color:'#fc6027'}}></span> {data.destino?.descripcion}
                    </>
                  ) : (
                    <>
                      <span style={{color:'#fc6027'}}>Destino:</span> {data.destino?.descripcion}
                    </>
                  )}
                </Titulo>
                {data.tipo === 'publicidad' ? (
                  <>
                    <Sub><FaBuilding style={{marginRight:6, color:'#3a4b86'}}/><span style={{color:'#3a4b86', fontWeight:'bold'}}>Referencia:</span> {data.referencia}</Sub>
                    <Sub><FaMapMarkerAlt style={{marginRight:6, color:'#3a4b86'}}/><span style={{color:'#3a4b86', fontWeight:'bold'}}>Dirección:</span> {data.direccion}</Sub>
                  </>
                ) : (
                  <>
                    <Sub><FaMapMarkerAlt style={{marginRight:6, color:'#3a4b86'}}/><span style={{color:'#3a4b86', fontWeight:'bold'}}>Provincia:</span> {data.destino?.provinciadestino}</Sub>
                    <Sub><FaBuilding style={{marginRight:6, color:'#3a4b86'}}/><span style={{color:'#3a4b86', fontWeight:'bold'}}>Ciudad:</span> {data.destino?.ciudaddestino}</Sub>
                    <Sub><FaBus style={{marginRight:6, color:'#3a4b86'}}/><span style={{color:'#3a4b86', fontWeight:'bold'}}>Operadora:</span> {data.operadora?.nombre}</Sub>
                  </>
                )}
                
                {/* Enlaces para videos de publicidad en móvil */}
                {data.tipo === 'publicidad' && (
                  <>
                    {data.mapa && (
                      <Sub>
                        <FaMapMarkerAlt style={{marginRight:6, color:'#3a4b86'}}/>
                        <span style={{color:'#3a4b86', fontWeight:'bold'}}>Ubicación:</span>
                        <a 
                          href={data.mapa} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{color:'#fc6027', textDecoration:'none', marginLeft:'8px'}}
                        >
                          Ver en Google Maps
                        </a>
                      </Sub>
                    )}
                    {data.numerocelular && (
                      <Sub>
                        <FaPhone style={{marginRight:6, color:'#3a4b86'}}/>
                        <span style={{color:'#3a4b86', fontWeight:'bold'}}>Contacto:</span>
                        <a 
                          href={`https://wa.me/${data.numerocelular.replace(/[^\d]/g, '')}?text=${encodeURIComponent(`Hola! Me interesa saber más sobre: ${data.descripcion}`)}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{color:'#25D366', textDecoration:'none', marginLeft:'8px'}}
                        >
                          Contactar por WhatsApp
                        </a>
                      </Sub>
                    )}
                  </>
                )}
                {data.tipo !== 'publicidad' && Array.isArray(data.rutas) && data.rutas.length > 0 ? (
                data.rutas.map((ruta, idx) => (
                  <RutaCard key={ruta.id || idx}>
                    <Ruta>
                      <FaBus style={{marginRight:6, color:'#3a4b86'}}/>
                      <span style={{color:'#3a4b86', fontWeight:'bold'}}>Ruta:</span> 
                      <span 
                        className={`ruta-colapsable ${rutasExpandida[`${data.destino?.id}-${idx}`] ? 'expanded' : ''}`}
                        onClick={() => setRutasExpandida(prev => ({ ...prev, [`${data.destino?.id}-${idx}`]: !prev[`${data.destino?.id}-${idx}`] }))}
                        style={{ cursor: 'pointer' }}
                      >
                        {rutasExpandida[`${data.destino?.id}-${idx}`] 
                          ? ruta.descripcion 
                          : getRutaColapsada(ruta.descripcion)
                        }
                      </span>
                      {ruta.descripcion && ruta.descripcion.split(/\s+/).length > 7 && (
                        <span style={{ color: '#3a4b86', fontSize: '0.9rem', marginLeft: '8px' }}>
                          {rutasExpandida[`${data.destino?.id}-${idx}`] ? '▼' : '▶'}
                        </span>
                      )}
                    </Ruta>
                    {Number(ruta.precio) > 0 && (
                      <Precio><FaMoneyBillWave style={{marginRight:6, color:'#3a4b86'}}/><span style={{color:'#3a4b86', fontWeight:'bold'}}>Precio:</span> <span style={{color:'#222'}}>${Number(ruta.precio).toFixed(2)}</span></Precio>
                    )}
                    {Number(ruta.precioespecial) > 0 && (
                      <Precio><span style={{color:'#3a4b86', fontWeight:'bold'}}>Especial: </span><span style={{color:'#222'}}>${Number(ruta.precioespecial).toFixed(2)}</span></Precio>
                    )}
                    <div style={{marginBottom: 6}}>
                      <b><FaClock style={{marginRight:6, color:'#3a4b86'}}/><span style={{color:'#3a4b86', fontWeight:'bold'}}>Horarios:</span></b>
                      <HorariosList className="horarios-scrollable">
                        {Array.isArray(ruta.horarios) && ruta.horarios.length > 0 ? (
                          ruta.horarios.map((h, hidx) => (
                            <HorarioItem key={h.id || hidx}>
                              <FaClock style={{fontSize: '1.1em', marginRight:4, color:'#3a4b86'}} /> {formatHoraAMPM(h.descripcion) || '[Sin dato]'}
                            </HorarioItem>
                          ))
                        ) : (
                          <HorarioItem style={{color:'#e74c3c'}}><FaClock style={{marginRight:4, color:'#e74c3c'}}/>No hay horarios disponibles</HorarioItem>
                        )}
                      </HorariosList>
                    </div>
                  </RutaCard>
                ))
              ) : data.tipo !== 'publicidad' ? (
                <RutaCard>
                  <Ruta><FaBus style={{marginRight:6, color:'#3a4b86'}}/>No hay rutas disponibles</Ruta>
                </RutaCard>
              ) : null}
            </ModalContent>
          </ModalOverlay>
        )}
        {/* Desktop info */}
          {!isMobile && (
            <Info>
              <Titulo>
                {data.tipo === 'publicidad' ? (
                  <>
                    <span style={{color:'#fc6027'}}></span> {data.destino?.descripcion}
                  </>
                ) : (
                  <>
                    <span style={{color:'#fc6027'}}>Destino:</span> {data.destino?.descripcion}
                  </>
                )}
              </Titulo>
              {data.tipo === 'publicidad' ? (
                <>
                  <Sub><FaBuilding style={{marginRight:6, color:'#3a4b86'}}/><span style={{color:'#3a4b86', fontWeight:'bold'}}>Referencia:</span> {data.referencia}</Sub>
                  <Sub><FaMapMarkerAlt style={{marginRight:6, color:'#3a4b86'}}/><span style={{color:'#3a4b86', fontWeight:'bold'}}>Dirección:</span> {data.direccion}</Sub>
                </>
              ) : (
                <>
                  <Sub><FaMapMarkerAlt style={{marginRight:6, color:'#3a4b86'}}/><span style={{color:'#3a4b86', fontWeight:'bold'}}>Provincia:</span> {data.destino?.provinciadestino}</Sub>
                  <Sub><FaBuilding style={{marginRight:6, color:'#3a4b86'}}/><span style={{color:'#3a4b86', fontWeight:'bold'}}>Ciudad:</span> {data.destino?.ciudaddestino}</Sub>
                  <Sub><FaBus style={{marginRight:6, color:'#3a4b86'}}/><span style={{color:'#3a4b86', fontWeight:'bold'}}>Operadora:</span> {data.operadora?.nombre}</Sub>
                </>
              )}
              
              {/* Enlaces para videos de publicidad */}
              {data.tipo === 'publicidad' && (
                <>
                  {data.mapa && (
                    <Sub>
                      <FaMapMarkerAlt style={{marginRight:6, color:'#3a4b86'}}/>
                      <span style={{color:'#3a4b86', fontWeight:'bold'}}>Ubicación:</span>
                      <a 
                        href={data.mapa} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{color:'#fc6027', textDecoration:'none', marginLeft:'8px'}}
                      >
                        Ver en Google Maps
                      </a>
                    </Sub>
                  )}
                  {data.numerocelular && (
                    <Sub>
                      <FaPhone style={{marginRight:6, color:'#3a4b86'}}/>
                      <span style={{color:'#3a4b86', fontWeight:'bold'}}>Contacto:</span>
                      <a 
                        href={`https://wa.me/${data.numerocelular.replace(/[^\d]/g, '')}?text=${encodeURIComponent(`Hola! Me interesa saber más sobre: ${data.descripcion}`)}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{color:'#25D366', textDecoration:'none', marginLeft:'8px'}}
                      >
                        Contactar por WhatsApp
                      </a>
                    </Sub>
                  )}
                </>
              )}
              {data.tipo !== 'publicidad' && Array.isArray(data.rutas) && data.rutas.length > 0 ? (
              data.rutas.map((ruta, idx) => (
                <RutaCard key={ruta.id || idx}>
                  <Ruta>
                    <FaBus style={{marginRight:6, color:'#3a4b86'}}/>
                    <span style={{color:'#3a4b86', fontWeight:'bold'}}>Ruta:</span> 
                    <span 
                      className={`ruta-colapsable ${rutasExpandida[`${data.destino?.id}-${idx}`] ? 'expanded' : ''}`}
                      onClick={() => setRutasExpandida(prev => ({ ...prev, [`${data.destino?.id}-${idx}`]: !prev[`${data.destino?.id}-${idx}`] }))}
                      style={{ cursor: 'pointer' }}
                    >
                      {rutasExpandida[`${data.destino?.id}-${idx}`] 
                        ? ruta.descripcion 
                        : getRutaColapsada(ruta.descripcion)
                      }
                    </span>
                    {ruta.descripcion && ruta.descripcion.split(/\s+/).length > 7 && (
                      <span style={{ color: '#3a4b86', fontSize: '0.9rem', marginLeft: '8px' }}>
                        {rutasExpandida[`${data.destino?.id}-${idx}`] ? '▼' : '▶'}
                      </span>
                    )}
                  </Ruta>
                  {Number(ruta.precio) > 0 && (
                    <Precio><FaMoneyBillWave style={{marginRight:6, color:'#3a4b86'}}/><span style={{color:'#3a4b86', fontWeight:'bold'}}>Precio:</span> <span style={{color:'#222'}}>${Number(ruta.precio).toFixed(2)}</span></Precio>
                  )}
                  {Number(ruta.precioespecial) > 0 && (
                    <Precio><span style={{color:'#3a4b86', fontWeight:'bold'}}>Especial: </span><span style={{color:'#222'}}>${Number(ruta.precioespecial).toFixed(2)}</span></Precio>
                  )}
                  <div style={{marginBottom: 6}}>
                    <b><FaClock style={{marginRight:6, color:'#3a4b86'}}/><span style={{color:'#3a4b86', fontWeight:'bold'}}>Horarios:</span></b>
                    <HorariosList className="horarios-scrollable">
                      {Array.isArray(ruta.horarios) && ruta.horarios.length > 0 ? (
                        ruta.horarios.map((h, hidx) => (
                          <HorarioItem key={h.id || hidx}>
                            <FaClock style={{fontSize: '1.1em', marginRight:4, color:'#3a4b86'}} /> {formatHoraAMPM(h.descripcion) || '[Sin dato]'}
                          </HorarioItem>
                        ))
                      ) : (
                        <HorarioItem style={{color:'#e74c3c'}}><FaClock style={{marginRight:4, color:'#e74c3c'}}/>No hay horarios disponibles</HorarioItem>
                      )}
                    </HorariosList>
                  </div>
                </RutaCard>
              ))
            ) : data.tipo !== 'publicidad' ? (
              <RutaCard>
                <Ruta><FaBus style={{marginRight:6, color:'#3a4b86'}}/>No hay rutas disponibles</Ruta>
              </RutaCard>
            ) : null}
            <LikeRow>
                              <LikeBtn onClick={handleLike} disabled={likeMutation.isLoading} aria-label={like ? 'Quitar like' : 'Dar like'}>
                <FaHeart style={{marginRight:6}} className={likeAnim ? 'heart-anim' : ''} color={like ? '#e74c3c' : '#fc6027'} />{likesCount}
              </LikeBtn>
              <NavBtn onClick={handlePrev}><FaChevronLeft /> Anterior</NavBtn>
              <NavBtn onClick={handleNext}>Siguiente <FaChevronRight /></NavBtn>
            </LikeRow>
          </Info>
        )}
      </Contenido>
    </Fondo>
  );
} 