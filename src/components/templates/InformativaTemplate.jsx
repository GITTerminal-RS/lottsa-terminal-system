import React from "react";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import { Header, v, PublicHeader, FooterInformativa, BoldText } from "../../index";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaMapMarkerAlt, FaPlane, FaTaxi, FaBus, FaClock, FaRoute, FaChair, FaTicketAlt, FaRestroom, FaUtensils, FaGift, FaStore, FaInfoCircle, FaCreditCard, FaBox, FaShieldAlt, FaEye, FaHandSparkles, FaCog, FaTools } from 'react-icons/fa';
import PortadaPG from "../../assets/PortadaPG.mp4"; // Import the video
import PortadaMovil from "../../assets/portadamovil.mp4"; // Import mobile video
// Removed unused image imports:
// import portada1 from "../../assets/portadatt_1.jpg";
// import portada2 from "../../assets/portadatt_2.jpg";
// import portada3 from "../../assets/portadatt_3.jpg";
// import portada4 from "../../assets/portadatt_4.jpeg";
import trc1 from "../../assets/trc1.jpg";
import trc2 from "../../assets/trc2.jpg";
import trc3 from "../../assets/trc3.jpg";
import trc4 from "../../assets/trc4.jpg";
import trc5 from "../../assets/trc5.jpg";
import trch1 from "../../assets/trch1.jpg";
import cst1 from "../../assets/cst1.jpg";
import cst2 from "../../assets/cst2.jpg";
import cst3 from "../../assets/cst3.jpg";
import cst4 from "../../assets/cst4.jpg";
import cst5 from "../../assets/cst5.jpg";
import cst6 from "../../assets/cst6.jpg";
import cst7 from "../../assets/cst7.jpg";
import cst8 from "../../assets/cst8.jpg";
import cst9 from "../../assets/cst9.jpg";
import cst10 from "../../assets/cst10.jpg";
import cst11 from "../../assets/cst11.jpg";
import cst12 from "../../assets/cst12.jpg";
// Usar trc1 como imagen principal del terminal
const terminalImage = trc1;
import portadaImage from "../../assets/onda.png";
import historyImage from "../../assets/parqueb.png"; // Import the history image
import transportImage from "../../assets/operadora.jpg"; // Import the transport image
// import mapImage from "https://via.placeholder.com/400x300/abcdef/ffffff?text=Mapa+del+Terminal"; // Placeholder map image
// import mapImage from "../../assets/ttsc2.jpg"; // Using terminal image as placeholder for map
import NoticiasModal from '../modals/NoticiasModal';
import Viajaya from '../modals/Viajaya';
import { obtenerNoticias } from '../../supabase/crudNoticias';
import { obtenerViajaYa } from '../../supabase/crudHorarios';
import { obtenerMalla } from '../../supabase/crudMalla';


// Removed keyframes for background image change as it's now a video
// const changeBackground = keyframes`
//   0% { background-image: url(${portada1}); }
//   25% { background-image: url(${portada2}); }
//   50% { background-image: url(${portada3}); }
//   75% { background-image: url(${portada4}); }
//   100% { background-image: url(${portada1}); }
// `;

const slideAnimation = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100vw);
  }
`;

const AnimatedGifContainer = styled.div`
  width: 100%;
  height: 325px;
  position: absolute;
  bottom: 0;
  left: 0;
  overflow: hidden;
  z-index: 2;
  display: flex;
  align-items: center;
  background-color: transparent;

  .animated-gif {
    height: 100%;
    width: auto;
    animation: ${slideAnimation} 15s linear infinite;
    white-space: nowrap;
    position: absolute;
    left: 0;
    top: 0;
  }
`;

const AnimatedText = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: transparent;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  padding: 10px 20px;
  border-radius: 10px;
  white-space: nowrap;
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: auto;
  width: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: none;
`;

const AnimatedTextWord = styled.span`
  color: ${({ color }) => color || '#fff'};
  margin: 0 0.2rem;
`;

const DecorativeLine = styled.div`
  position: absolute;
  width: 40px;
  height: 6px;
  border-radius: 3px;
  background: ${({ color }) => color};
  opacity: 0.85;
  z-index: 4;
  animation: ${slideAnimation} 15s linear infinite;
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const MobileSoundBtn = styled.button`
  position: fixed;
  top: 2rem;
  right: 3.5rem;
  z-index: 101;
  background: #fff;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #222;
  box-shadow: 0 2px 8px rgba(58,75,134,0.13);
  cursor: pointer;
  padding: 0.6rem;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
  @media (min-width: 901px) { display: none; }
  &:hover {
    background: #f3f3f3;
  }
`;

const GlobalAnimatedTextStyle = createGlobalStyle`
@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(60px);
  }
  50% {
    opacity: 1;
    transform: scale(1.1) translateY(-10px);
  }
  70% {
    transform: scale(0.95) translateY(2px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.13) rotate(-2deg);
  }
}
@keyframes colorShift {
  0% {
    filter: brightness(1) drop-shadow(0 0 0px #fff);
  }
  50% {
    filter: brightness(1.2) drop-shadow(0 0 8px #fff7);
  }
  100% {
    filter: brightness(1) drop-shadow(0 0 0px #fff);
  }
}`;

// Componente principal (el QueryClient ahora está en Informativa.jsx)
export function InformativaTemplate() {
  const [state, setState] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef(null);
  const [showFirstGif, setShowFirstGif] = useState(false);
  const [showSecondGif, setShowSecondGif] = useState(false);
  const [showAnimatedText, setShowAnimatedText] = useState(false);
  const [openNoticias, setOpenNoticias] = useState(true);
  const noticiaEjemplo = {
    // Título ahora es estático en el modal
    contenido: 'El terminal operará en horario especial este feriado. Consulta los horarios actualizados en la sección de cooperativas.'
  };
  const [mallaLoaded, setMallaLoaded] = useState(false);
  const [openViajaYa, setOpenViajaYa] = useState(false);

  // Función helper para detectar dispositivos móviles
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
  };

  // Migrar obtenerNoticias a useQuery (usa QueryClient global)
  const { 
    data: noticias = [], 
    isLoading: noticiasLoading, 
    error: noticiasError 
  } = useQuery({
    queryKey: ['noticias-informativa'],
    queryFn: obtenerNoticias,
    staleTime: 10 * 60 * 1000, // 10 minutos
    cacheTime: 20 * 60 * 1000, // 20 minutos
    refetchOnMount: false,
  });

  // Migrar obtenerViajaYa a useQuery (usa QueryClient global)
  const { 
    data: viajaYa = [], 
    isLoading: loadingViajaYa, 
    error: viajaYaError 
  } = useQuery({
    queryKey: ['viaja-ya-informativa'],
    queryFn: obtenerViajaYa,
    staleTime: 5 * 60 * 1000, // 5 minutos (datos más dinámicos)
    cacheTime: 15 * 60 * 1000, // 15 minutos
    refetchOnMount: false,
  });

  // useEffect para detectar cambios de tamaño de ventana (debe estar con los otros hooks)
  useEffect(() => {
    const checkMobile = () => {
      const isMobileResult = isMobileDevice();
      console.log('🔍 Detección móvil:', {
        userAgent: navigator.userAgent,
        windowWidth: window.innerWidth,
        isMobileByUA: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isMobileByWidth: window.innerWidth <= 768,
        finalResult: isMobileResult
      });
      setIsMobile(isMobileResult);
    };

    // Verificar al cargar
    console.log('🚀 Inicializando detección móvil...');
    checkMobile();

    // Agregar listener para cambios de tamaño
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // useEffect para monitorear cambios en isMobile
  useEffect(() => {
    console.log('📱 Estado isMobile cambió a:', isMobile);
  }, [isMobile]);

  useEffect(() => {
    // Primero el texto, luego gif1, luego gif2
    const timerText = setTimeout(() => setShowAnimatedText(true), 1200);
    const timerGif1 = setTimeout(() => setShowFirstGif(true), 4000); // 4 segundos
    const timerGif2 = setTimeout(() => setShowSecondGif(true), 8000); // 8 segundos
    return () => {
      clearTimeout(timerText);
      clearTimeout(timerGif1);
      clearTimeout(timerGif2);
    };
  }, []);

  // Migrar malla a useQuery (ahora usa el QueryClient global)
  const { 
    data: mallaData, 
    isLoading: mallaLoading,
    isFetching: mallaFetching,
    error: mallaError,
    isSuccess: mallaSuccess
  } = useQuery({
    queryKey: ['malla-informativa'],
    queryFn: async () => {
      const data = await obtenerMalla();
      setMallaLoaded(true); // Mantener el estado local para compatibilidad
      return data;
    },
    // Configuración más agresiva de cache para navegación fluida
    staleTime: 15 * 60 * 1000, // 15 minutos
    cacheTime: 30 * 60 * 1000, // 30 minutos
    retry: 1,
    refetchOnMount: false,
    enabled: true,
  });

  // Array de servicios con imágenes para el carrusel
  const servicesCarousel = [
    { 
      image: cst2, 
      icon: FaGift, 
      title: 'Artesanías y dulces', 
      description: 'Encuentre productos artesanales locales, dulces tradicionales y recuerdos únicos de la región.' 
    },
    { 
      image: cst3, 
      icon: FaStore, 
      title: 'Área comercial', 
      description: 'Variedad de locales comerciales para satisfacer sus necesidades de compras antes del viaje.' 
    },
    { 
      image: cst4, 
      icon: FaInfoCircle, 
      title: 'Área de información', 
      description: 'Punto de información turística y asistencia al viajero con personal especializado.' 
    },
    { 
      image: cst5, 
      icon: FaUtensils, 
      title: 'Restaurantes', 
      description: 'Variedad gastronómica y opciones culinarias para satisfacer todos los gustos antes de viajar.' 
    },
    { 
      image: cst6, 
      icon: FaCreditCard, 
      title: 'Cajeros automáticos', 
      description: 'Cajeros automáticos de las principales entidades bancarias para su comodidad financiera.' 
    },
    { 
      image: cst7, 
      icon: FaBox, 
      title: 'Área de encomiendas', 
      description: 'Servicio de envío y recepción de encomiendas a nivel nacional con total seguridad.' 
    },
    { 
      image: cst8, 
      icon: FaShieldAlt, 
      title: 'Controles de acceso', 
      description: 'Sistemas modernos de control de acceso para garantizar la seguridad de todos los usuarios.' 
    },
    { 
      image: cst9, 
      icon: FaHandSparkles, 
      title: 'Higiene', 
      description: 'Instalaciones de higiene personal y estaciones de desinfección distribuidas en todo el terminal.' 
    },
    { 
      image: cst10, 
      icon: FaEye, 
      title: 'Seguridad', 
      description: 'Sistema de videovigilancia y personal de seguridad las 24 horas para su tranquilidad.' 
    },
    { 
      image: cst11, 
      icon: FaCog, 
      title: 'Control de operaciones', 
      description: 'Centro de control operativo que coordina todas las actividades del terminal eficientemente.' 
    },
    { 
      image: cst12, 
      icon: FaTools, 
      title: 'Controles técnicos', 
      description: 'Área técnica especializada en el mantenimiento y supervisión de todos los sistemas del terminal.' 
    },
    { 
      image: cst1, 
      icon: FaChair, 
      title: 'Área de espera', 
      description: 'Disfrute de su estancia en el terminal con áreas cómodas y climatizadas para su comodidad.' 
    }
  ];
  
  // Mantener el array original para retrocompatibilidad
  const services = servicesCarousel;




  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedTransport, setSelectedTransport] = useState(0);
  const [selectedHistoryImage, setSelectedHistoryImage] = useState(0);
  const [selectedServiceIndex, setSelectedServiceIndex] = useState(0);
  const [servicesCarouselIndex, setServicesCarouselIndex] = useState(0);
  
  // Array de imágenes históricas
  const historyImages = [
    {
      image: historyImage,
      title: "Inicios (1994)",
      year: "1994",
      description: "Cuando la terminal fue inaugurada, marcando el inicio de la modernización del transporte en Loja."
    },
    {
      image: trch1,
      title: "Actualidad (2024)",
      year: "2024",
      description: "Después de 30 años de mejoras y actualizaciones, la terminal es ahora un moderno centro de transporte."
    }
  ];
  
  // Array de opciones de transporte
  const transportOptions = [
    {
      icon: FaPlane,
      title: "Desde el Aeropuerto",
      description: "Aeropuerto Ciudad de Catamayo a 30 km de distancia. Tiempo aproximado: 35-40 minutos.",
      time: "35-40 min",
      distance: "30 km"
    },
    {
      icon: FaTaxi,
      title: "En Taxi",
      description: "Servicio de taxi disponible desde cualquier punto de la ciudad de Loja.",
      time: "10-15 min", 
      distance: "Centro ciudad"
    },
    {
      icon: FaBus,
      title: "Transporte Público",
      description: "Líneas de buses urbanos que conectan directamente con la terminal.",
      time: "15-20 min",
      distance: "Varias rutas"
    }
  ];
  
  // Array de imágenes con información específica para cada una
  const terminalImageData = [
    {
      image: trc1,
      title: "Fachada Principal",
      description: "La Terminal Terrestre Reina de el Cisne, ubicada en la ciudad de Loja, Ecuador, es el principal centro de transporte terrestre del sur del país, conectando a Loja con varias provincias e incluso con destinos internacionales."
    },
    {
      image: trc2,
      title: "Instalaciones Modernas",
      description: "Con más de 25 años de funcionamiento, esta terminal ofrece una variedad de servicios pensados para facilitar el viaje de miles de usuarios diarios, incluyendo boleterías, locales comerciales, seguridad y opciones de alimentación."
    },
    {
      image: trc3,
      title: "Servicios y Comodidades",
      description: "En este espacio conocerás sus principales características, los servicios disponibles y cómo planificar tu viaje de manera eficiente desde esta moderna y funcional estación."
    },
    {
      image: trc4,
      title: "Área de Andenes",
      description: "Los andenes están diseñados para brindar comodidad y seguridad a los pasajeros, con señalización clara y espacios amplios para el embarque y desembarque de los usuarios."
    },
    {
      image: trc5,
      title: "Zona de Espera",
      description: "Las salas de espera ofrecen un ambiente cómodo y climatizado donde los pasajeros pueden aguardar la salida de sus buses con todas las comodidades necesarias."
    }
  ];


  
  // Funciones para el carrusel de servicios
  const handleServicesPrev = () => setServicesCarouselIndex((prev) => (prev === 0 ? 0 : prev - 1));
  const handleServicesNext = () => {
    const maxIndex = servicesCarousel.length - 4; // Mostrar 4 tarjetas a la vez
    setServicesCarouselIndex((prev) => (prev >= maxIndex ? maxIndex : prev + 1));
  };

  // Loader optimizado - solo mostrar si realmente no hay datos
  if (mallaLoading && !mallaData) {
    return (
      <Container>
        <Overlay>
          <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',width:'100vw'}}>
            <span style={{fontSize:'1.2rem',color:'#3a4b86'}}>Cargando información...</span>
          </div>
        </Overlay>
      </Container>
    );
  }

  // Si hay error y no hay datos en cache, mostrar mensaje
  if (mallaError && !mallaData) {
    return (
      <Container>
        <Overlay>
          <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',width:'100vw'}}>
            <span style={{fontSize:'1.2rem',color:'#e74c3c'}}>Error al cargar la información</span>
          </div>
        </Overlay>
      </Container>
    );
  }

  // Manejar errores de manera silenciosa en desarrollo
  if (noticiasError) console.warn('Error cargando noticias:', noticiasError);
  if (viajaYaError) console.warn('Error cargando viaja ya:', viajaYaError);
  if (mallaError) console.warn('Error cargando malla:', mallaError);

  // Justo antes del return principal:
  console.log('viajaYa:', viajaYa, 'loadingViajaYa:', loadingViajaYa, 'openViajaYa:', openViajaYa);
  const viajaYaToShow = viajaYa || [];

  console.log('🚀 Llegando a selección de video...', { mallaData, isMobile });

  // Determinar qué video usar como portada
  const videoPortada = (() => {
    // Para dispositivos móviles: usar video móvil de malla si existe, sino fallback
    if (isMobile) {
      // Prioridad 1: Video móvil de malla
      if (mallaData?.videomovil && mallaData.videomovil.trim() !== '' && mallaData.videomovil !== 'link') {
        return mallaData.videomovil;
      }
      // Fallback: Video móvil por defecto
      return PortadaMovil;
    }
    
    // Para web/desktop: usar video de malla si existe, sino PortadaPG
    if (mallaData?.video && mallaData.video.trim() !== '' && mallaData.video !== 'link') {
      return mallaData.video; // Video de malla para web
    }
    
    // Fallback para web: PortadaPG (temporal: usar PortadaMovil porque PortadaPG está en .gitignore)
    return PortadaMovil; // TODO: cambiar a PortadaPG cuando esté disponible
  })();

  console.log('🎬 Selección de video:', {
    isMobile: isMobile,
    mallaData: mallaData,
    mallaVideo: mallaData?.video,
    mallaVideoMovil: mallaData?.videomovil,
    videoPortada: videoPortada,
    PortadaMovil: PortadaMovil,
    PortadaPG: PortadaPG,
    videoPortadaType: typeof videoPortada,
    videoPortadaLength: videoPortada?.length
  });
  
  console.log('📱 Dispositivo móvil detectado:', isMobile);
  console.log('🎥 Video de portada seleccionado:', 
    isMobile 
      ? mallaData?.videomovil && mallaData.videomovil.trim() !== '' && mallaData.videomovil !== 'link'
        ? `📱 Video móvil de malla: ${mallaData.videomovil}`
        : `📱 Video móvil por defecto: ${PortadaMovil}`
      : mallaData?.video && mallaData.video.trim() !== '' && mallaData.video !== 'link'
        ? `💻 Video de malla (web): ${mallaData.video}`
        : `💻 Video web fallback: ${PortadaMovil} (temporal)`
  );

  return (
    <>
      <GlobalAnimatedTextStyle />
      <Container>
        <VideoBackground ref={videoRef} src={videoPortada} autoPlay loop playsInline muted={isMuted} />
        <Overlay>
          {/* Contenedor para ambos modales - organizados verticalmente */}
          <div style={{
            position: 'fixed', 
            top: '80px', 
            right: '0', 
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            alignItems: 'flex-end'
          }}>
            {/* Solo mostrar NoticiasModal si hay noticias reales */}
            {noticias && noticias.length > 0 && (
              <NoticiasModal open={openNoticias} noticias={noticias} />
            )}
            {/* Solo mostrar Viajaya si hay datos o está cargando */}
            {(loadingViajaYa || (viajaYaToShow && viajaYaToShow.length > 0)) && (
              <Viajaya viajaYa={viajaYaToShow} loadingViajaYa={loadingViajaYa} onClose={() => setOpenViajaYa(false)} />
            )}
          </div>
          <PublicHeader stateConfig={{ state: state, setState: () => setState(!state) }} isMuted={isMuted} setIsMuted={setIsMuted} />
          <MobileSoundBtn onClick={() => setIsMuted(!isMuted)} aria-label={isMuted ? 'Activar sonido' : 'Desactivar sonido'}>
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </MobileSoundBtn>
          <AnimatedGifContainer>
            {/* Función para verificar si la malla tiene contenido */}
            {(() => {
              const hasMallaContent = mallaData && (
                (mallaData.texto && mallaData.texto.trim() !== '') ||
                (mallaData.linkimg1 && mallaData.linkimg1.trim() !== '') ||
                (mallaData.linkimg2 && mallaData.linkimg2.trim() !== '')
              );

                             // Si no hay contenido en la malla, mostrar el texto estático
               if (!hasMallaContent) {
                 return (
                   <WelcomeText style={{ 
                     position: 'absolute', 
                     bottom: '15%', 
                     left: '50%', 
                     transform: 'translateX(-50%)',
                     zIndex: 3,
                     textAlign: 'center',
                     fontSize: '2.2rem',
                     fontWeight: 700,
                     color: '#fff',
                     textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
                     maxWidth: '80%'
                   }}>
                     "Conectando Loja con seguridad y excelencia"
                   </WelcomeText>
                 );
               }

              // Si hay contenido en la malla, mostrar la malla publicitaria
              return (
                <>
                  {/* Texto animado de la malla */}
                  {showAnimatedText && mallaData?.texto && mallaData.texto.trim() !== '' && (
              <AnimatedText className="animated-gif" style={{ zIndex: 3 }}>
                {String(mallaData.texto)
                  .split(/\s+/)
                  .map((word, idx) => (
                    <AnimatedTextWord
                      key={idx}
                      color={[
                        '#FFB300',
                        '#E53935',
                        '#009688',
                        '#43A047',
                        '#FF7043',
                        '#3a4b86',
                        '#8e24aa',
                        '#00bcd4',
                        '#fbc02d',
                        '#d84315',
                      ][idx % 10]}
                      style={{
                        animation: `bounceIn 0.7s ${idx * 0.12}s both, pulse 2.5s ${0.7 + idx * 0.2}s infinite, colorShift 2.5s ${0.7 + idx * 0.2}s infinite`,
                        display: 'inline-block',
                        fontWeight: 700,
                        textShadow: '2px 2px 8px rgba(0,0,0,0.18)',
                        fontSize: '2.2rem',
                        letterSpacing: '0.04em',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.18) rotate(-5deg)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
                    >
                      {word}
                    </AnimatedTextWord>
                  ))}
              </AnimatedText>
            )}
                  
                  {/* Imagen 1 de la malla */}
                  {showFirstGif && mallaData?.linkimg1 && mallaData.linkimg1.trim() !== '' && (
              <img
                src={mallaData.linkimg1}
                alt="Animación 1"
                className="animated-gif"
                style={{ zIndex: 1 }}
              />
            )}
                  
                  {/* Imagen 2 de la malla */}
                  {showSecondGif && mallaData?.linkimg2 && mallaData.linkimg2.trim() !== '' && (
              <img
                src={mallaData.linkimg2}
                alt="Animación 2"
                className="animated-gif"
                style={{ zIndex: 2 }}
              />
            )}

                  
                  {/* Rayitas decorativas solo si hay texto */}
                  {showAnimatedText && mallaData?.texto && mallaData.texto.trim() !== '' && (
              <>
                <DecorativeLine color="#FFB300" style={{ top: '10%', left: '10%', transform: 'rotate(-20deg)' }} />
                <DecorativeLine color="#E53935" style={{ top: '80%', left: '20%', transform: 'rotate(15deg)' }} />
                <DecorativeLine color="#43A047" style={{ top: '20%', left: '80%', transform: 'rotate(30deg)' }} />
                <DecorativeLine color="#009688" style={{ top: '70%', left: '70%', transform: 'rotate(-25deg)' }} />
                <DecorativeLine color="#FF7043" style={{ top: '50%', left: '50%', transform: 'rotate(45deg)' }} />
              </>
            )}
                </>
              );
            })()}
          </AnimatedGifContainer>
        </Overlay>

        <LowerContent>
          <EnhancedAboutSection>
            <EnhancedImageContainer>
              <MainImageWrapper>
                <MainImage src={terminalImageData[selectedImageIndex].image} alt={terminalImageData[selectedImageIndex].title} />
                <ImageOverlay>
                  <OverlayTitle>{terminalImageData[selectedImageIndex].title}</OverlayTitle>
                  <OverlaySubtitle>Terminal Terrestre Reina de el Cisne</OverlaySubtitle>
                </ImageOverlay>
              </MainImageWrapper>
              <ThumbnailGallery>
                {terminalImageData.map((item, index) => (
                  <ThumbnailWrapper key={index}>
                    <ThumbnailImage 
                      src={item.image} 
                      alt={item.title}
                      isSelected={selectedImageIndex === index}
                      onClick={() => setSelectedImageIndex(index)}
                    />
                    <ThumbnailLabel isSelected={selectedImageIndex === index}>
                      {item.title}
                    </ThumbnailLabel>
                  </ThumbnailWrapper>
                ))}
              </ThumbnailGallery>
            </EnhancedImageContainer>
            <EnhancedTextContent>
              <HighlightBar />
              <ImageDescriptionCard>
                <DescriptionTitle>{terminalImageData[selectedImageIndex].title}</DescriptionTitle>
                <ImageDescriptionText>
                  {terminalImageData[selectedImageIndex].description}
                </ImageDescriptionText>
                <ImageCounter>
                  Imagen {selectedImageIndex + 1} de {terminalImageData.length}
                </ImageCounter>
              </ImageDescriptionCard>
              <NavigationButtons>
                <NavButton 
                  onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : terminalImageData.length - 1)}
                  disabled={false}
                >
                  ←
                </NavButton>
                <NavButton 
                  onClick={() => setSelectedImageIndex(prev => prev < terminalImageData.length - 1 ? prev + 1 : 0)}
                  disabled={false}
                >
                  →
                </NavButton>
              </NavigationButtons>
            </EnhancedTextContent>
          </EnhancedAboutSection>

          <WaveSeparator />

          <EnhancedLocationSection>
            <LocationHeader>
              <LocationTitle>
                <FaMapMarkerAlt /> Cómo llegar al Terminal
              </LocationTitle>
              <LocationSubtitle>
                Encuentra la mejor ruta para llegar hasta nosotros
              </LocationSubtitle>
            </LocationHeader>

            <LocationContent>
              <MapSection>
                <MapWrapper>
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3980.2079604409155!2d-79.2076730254952!3d-3.97757254448946!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91cb49b6bced8129%3A0xb25522c88088e50f!2sTerminal%20Terrestre%20Reina%20de%20El%20Cisne!5e0!3m2!1ses-419!2sec!4v1749046196262!5m2!1ses-419!2sec" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowfullscreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <MapOverlay>
                    <AddressInfo>
                      <FaMapMarkerAlt />
                      <div>
                        <strong>Av. 8 de Diciembre</strong>
                        <p>Loja, Ecuador</p>
                      </div>
                    </AddressInfo>
                  </MapOverlay>
                </MapWrapper>
                <MapActions>
                  <EnhancedMapButton href="https://maps.app.goo.gl/tuycHx4dq7Dz3rVV6" target="_blank" rel="noopener noreferrer">
                    <FaRoute /> Navegar con Google Maps
                  </EnhancedMapButton>
                </MapActions>
              </MapSection>

              <TransportOptionsSection>
                <TransportSelectorContainer>
                  <TransportSelectors>
                    {transportOptions.map((option, index) => (
                      <TransportSelector
                        key={index}
                        isSelected={selectedTransport === index}
                        onClick={() => setSelectedTransport(index)}
                      >
                        <option.icon />
                      </TransportSelector>
                    ))}
                  </TransportSelectors>
                  
                  <DynamicTransportCard>
                    <DynamicTransportIcon>
                      {React.createElement(transportOptions[selectedTransport].icon)}
                    </DynamicTransportIcon>
                    <TransportInfo>
                      <TransportTitle>{transportOptions[selectedTransport].title}</TransportTitle>
                      <LocationTransportDescription>
                        {transportOptions[selectedTransport].description}
                      </LocationTransportDescription>
                      <TransportDetails>
                        <DetailItem>
                          <FaClock /> {transportOptions[selectedTransport].time}
                        </DetailItem>
                        <DetailItem>
                          <FaRoute /> {transportOptions[selectedTransport].distance}
                        </DetailItem>
                      </TransportDetails>
                    </TransportInfo>
                  </DynamicTransportCard>
                </TransportSelectorContainer>
              </TransportOptionsSection>
            </LocationContent>
          </EnhancedLocationSection>

          <WaveSeparator />

          <EnhancedHistorySection>
            <HistoryHeader>
              <HistoryTitle>Historia del Terminal</HistoryTitle>
              <HistorySubtitle>30 años de evolución y crecimiento</HistorySubtitle>
            </HistoryHeader>

            <HistoryContent>
              <HistoryImageSection>
                <TimelineImageContainer>
                  <HistoryMainImage src={historyImages[selectedHistoryImage].image} alt={historyImages[selectedHistoryImage].title} />
                  <ImageYearBadge>{historyImages[selectedHistoryImage].year}</ImageYearBadge>
                </TimelineImageContainer>
                
                <TimelineSelector>
                  {historyImages.map((item, index) => (
                    <TimelineButton
                      key={index}
                      isSelected={selectedHistoryImage === index}
                      onClick={() => setSelectedHistoryImage(index)}
                    >
                      <TimelineYear>{item.year}</TimelineYear>
                      <TimelineLabel>{item.title}</TimelineLabel>
                    </TimelineButton>
                  ))}
                </TimelineSelector>
              </HistoryImageSection>

              <HistoryTextSection>
                <HistoryCard>
                  <HistoryCardTitle>{historyImages[selectedHistoryImage].title}</HistoryCardTitle>
                  <HistoryCardDescription>
                    {historyImages[selectedHistoryImage].description}
                  </HistoryCardDescription>
                </HistoryCard>

                <HistoryEvolution>
                  <EvolutionTitle>Evolución del Terminal</EvolutionTitle>
                  <EvolutionContent>
                    <EvolutionItem>
                      <EvolutionDate>1994</EvolutionDate>
                      <EvolutionDesc>Inauguración para modernizar el transporte terrestre en Loja</EvolutionDesc>
                    </EvolutionItem>
                    <EvolutionItem>
                      <EvolutionDate>2024</EvolutionDate>
                      <EvolutionDesc>30 años después: punto estratégico de movilidad regional con servicios modernos</EvolutionDesc>
                    </EvolutionItem>
                  </EvolutionContent>
                </HistoryEvolution>
              </HistoryTextSection>
            </HistoryContent>
          </EnhancedHistorySection>

          <WaveSeparator />

          <EnhancedServicesSection>
            <ServicesHeader>
              <ServicesMainTitle>Comodidades y Servicios </ServicesMainTitle>
              <ServicesSubtitle>
                Ya sea que estés transfiriendo, llegando o saliendo del Terminal Terrestre Reina del Cisne,
                puedes esperar tranquilo con una experiencia única y apacible.
              </ServicesSubtitle>
            </ServicesHeader>

            <ServicesContent>
              <ServicesCarouselWrapper>
                <ServicesNavigationButton 
                  direction="prev"
                  onClick={handleServicesPrev}
                  disabled={servicesCarouselIndex === 0}
                >
                  ←
                </ServicesNavigationButton>
                
                <ServicesCarouselContainer>
                  <ServicesCarouselTrack
                    style={{
                      transform: `translateX(-${servicesCarouselIndex * 25}%)`
                    }}
                  >
                    {servicesCarousel.map((service, index) => (
                      <IndividualServiceCard key={index}>
                        <ServiceCardImage src={service.image} alt={service.title} />
                        <ServiceCardContent>
                          <ServiceCardHeader>
                            <ServiceCardIcon>{React.createElement(service.icon)}</ServiceCardIcon>
                            <ServiceCardTitle>{service.title}</ServiceCardTitle>
                          </ServiceCardHeader>
                          <ServiceCardDescription>
                            {service.description}
                          </ServiceCardDescription>
                        </ServiceCardContent>
                      </IndividualServiceCard>
                    ))}
                  </ServicesCarouselTrack>
                </ServicesCarouselContainer>
                
                <ServicesNavigationButton 
                  direction="next"
                  onClick={handleServicesNext}
                  disabled={servicesCarouselIndex >= servicesCarousel.length - 4}
                >
                  →
                </ServicesNavigationButton>
              </ServicesCarouselWrapper>
            </ServicesContent>
          </EnhancedServicesSection>

          <WaveSeparator />

          {/* Developer Info Section */}
          {/* Removing the previous developer info section */}
          {/*
          <Section>
            <SectionTitle>Contexto e Información del Desarrollador</SectionTitle>
            <SectionText>
              Esta aplicación web de gestión de inventarios y rutas para operadoras de transporte fue desarrollada como parte de un proyecto enfocado en optimizar la logística y control de operaciones. Mi objetivo como desarrollador es crear herramientas eficientes y fáciles de usar que resuelvan problemas reales en el sector del transporte. Este proyecto utiliza tecnologías web modernas como React, Styled Components, y Supabase para ofrecer una experiencia robusta y escalable.
            </SectionText>
          </Section>
          */}

          {/* Adding FooterSection inside LowerContent below */}

          <FooterInformativa />

        </LowerContent>

        {/* Removing the commented FooterSection outside LowerContent */}
        {/*
        <FooterSection>
          <FooterColumn>
            <img src={terminalImage} alt="Terminal Terrestre Reina de el Cisne Logo" />
            <h3>estre Reina del Cisne</h3>
            <p>
              Somos una web informativa sobre el <BoldText>estre Reina del Cisne de Loja</BoldText>. Brindamos la información más reciente y actualizada.
            </p>
          </FooterColumn>
          <FooterColumn>
            <h3>Contacto</h3>
            <DeveloperInfo>
              <p><BoldText>Desarrollador del Software:</BoldText> Ing Gilson Orlando Quezada Guartizaca</p>
            </DeveloperInfo>
          </FooterColumn>
        </FooterSection>
        */}

      </Container>
    </>
  );
}

const Container = styled.div`
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;

  /* Estilos para la barra de scroll en Chrome/Safari */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    border: 2px solid transparent;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.5);
  }
`;

const VideoBackground = styled.video`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  object-fit: cover;
  z-index: 0;
`;

const Overlay = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
  padding-bottom: 20px;
  justify-content: flex-start;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  max-width: 800px;
  gap: 1rem;
  color: white;
  z-index: 2;
  flex-grow: 1;
`;

const LowerContent = styled.section`
  position: relative;
  z-index: 1;
  background-color: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  gap: 40px;
  width: 100%;
  box-sizing: border-box;
`;

const AboutSection = styled.section`
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: center;

  @media (min-width: 768px) {
    flex-direction: row;
    gap: 50px;
    align-items: center;
  }
`;

const ImageContainer = styled.div`
  flex: 1;
  max-width: 100%;

  @media (min-width: 768px) {
    max-width: 50%;
  }

  img {
    width: 100%;
    height: auto;
    display: block;
  }
`;

const TextContent = styled.div`
  flex: 1;
  max-width: 100%;

  @media (min-width: 768px) {
    max-width: 50%;
  }
`;

const Section = styled.section`
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  text-align: justify;
  color: #3a4b86;
`;

const SectionParagraph = styled.p`
  font-size: 1.1rem;
  text-align: justify;
  margin-bottom: 15px;
  line-height: 1.6;
  color: ${({ theme }) => theme.text};
`;

const WelcomeText = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const DescriptionText = styled.p`
  font-size: 1.5rem;
  color: white;
  opacity: 1;
  margin: 0;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
`;

const SectionText = styled.p`
  font-size: 1.1rem;
  text-align: justify;
`;

const WaveSeparator = styled.div`
  width: 100%;
  height: 150px;
  background-image: url(${portadaImage});
  background-size: 100% 100%;
  background-position: center bottom;
  background-repeat: no-repeat;
  margin-top: -50px;
  z-index: 1;
`;

const LocationSection = styled.section`
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column; // Stack columns by default
  gap: 30px;
  align-items: center; // Center items vertically in column layout

  @media (min-width: 768px) { // Apply two-column layout on tablets and larger screens
    flex-direction: row; // Side-by-side on larger screens
    gap: 50px; // Adjust gap for row layout
    align-items: center; // Align items to the center in row layout
  }
`;

const MapContainer = styled.div`
  flex: 1;
  max-width: 100%;

  @media (min-width: 768px) {
    max-width: 50%; // Map takes roughly half the width on larger screens
  }

  img {
    width: 100%;
    height: auto;
    display: block;
  }
`;

const MapButton = styled.a`
  display: inline-block;
  background-color: #a8e6cf; /* Light green color */
  color: #333; /* Dark text color */
  padding: 10px 20px;
  margin-top: 15px; /* Space above the button */
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  text-align: center;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #88d4ab; /* Slightly darker green on hover */
  }
`;

const HistorySection = styled.section`
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column; // Stack columns by default
  gap: 30px;
  align-items: center; // Center items vertically in column layout

  @media (min-width: 768px) { // Apply two-column layout on tablets and larger screens
    flex-direction: row; // Side-by-side on larger screens
    gap: 50px; // Adjust gap for row layout
    align-items: center; // Align items to the center in row layout
  }
`;



const ServicesSection = styled.section`
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 0;
  text-align: center;
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); // Responsive grid for smaller screens
  gap: 30px;

  @media (min-width: 992px) { // Adjust breakpoint as needed for 4 columns
    grid-template-columns: repeat(4, 1fr); // 4 columns on larger screens
  }
`;

const ServiceItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px;
  background-color: #f9f9f9; // Light background for items
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const ServiceIcon = styled.div`
  font-size: 3rem; // Large icon size
  color: #007bff; // Blue color for icons
  margin-bottom: 15px;
`;

const ServiceTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: #3a4b86;
`;

const ServiceDescription = styled.p`
  font-size: 0.9rem;
  color: #555;
  margin-top: 5px;
  text-align: justify;
`;

const CarouselContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 600px;
  margin-bottom: 20px;
  position: relative;
`;

const CarouselImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const CarouselButtonPrev = styled.button`
  position: absolute;
  left: -20px;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
  @media (max-width: 768px) {
    left: 0;
    top: 90%;
    transform: none;
    background-color: rgba(0, 0, 0, 0.8);
  }
`;

const CarouselButtonNext = styled.button`
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
  @media (max-width: 768px) {
    right: 0;
    top: 90%;
    transform: none;
    background-color: rgba(0, 0, 0, 0.8);
  }
`;



const DeveloperInfo = styled.div`
  font-size: 0.9rem;
  color: #555;
  margin-top: 10px;
`;

// Nuevos componentes estilizados para la sección mejorada del Terminal Terrestre
const EnhancedAboutSection = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  gap: 40px;
  align-items: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3a4b86, #6c5ce7, #74b9ff);
  }

  @media (min-width: 968px) {
    flex-direction: row;
    gap: 60px;
    align-items: flex-start;
  }
`;

const EnhancedImageContainer = styled.div`
  flex: 1;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (min-width: 968px) {
    max-width: 70%;
    flex: 2;
  }
`;

const MainImageWrapper = styled.div`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  transition: transform 0.4s ease, box-shadow 0.4s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  }

  &:hover .image-overlay {
    opacity: 1;
  }
`;

const MainImage = styled.img`
  width: 100%;
  height: 450px;
  object-fit: cover;
  display: block;
  transition: transform 0.6s ease;

  @media (min-width: 968px) {
    height: 500px;
  }

  ${MainImageWrapper}:hover & {
    transform: scale(1.05);
  }
`;

const ImageOverlay = styled.div.attrs({ className: 'image-overlay' })`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
  padding: 25px;
  opacity: 0;
  transition: opacity 0.4s ease;
`;

const OverlayTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 5px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const OverlaySubtitle = styled.p`
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
`;

const ThumbnailGallery = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
`;

const ThumbnailImage = styled.img`
  width: 100px;
  height: 75px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid ${props => props.isSelected ? '#3a4b86' : 'transparent'};
  opacity: ${props => props.isSelected ? 1 : 0.7};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  @media (min-width: 968px) {
    width: 120px;
    height: 90px;
  }

  &:hover {
    opacity: 1;
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
`;

const EnhancedTextContent = styled.div`
  flex: 1;
  max-width: 100%;
  padding: 15px;

  @media (min-width: 968px) {
    max-width: 30%;
    flex: 1;
    padding: 20px;
  }
`;

const ModernSectionTitle = styled.h2`
  font-size: 2.8rem;
  font-weight: 800;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #3a4b86, #6c5ce7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
  position: relative;

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const HighlightBar = styled.div`
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #3a4b86, #6c5ce7);
  border-radius: 2px;
  margin-bottom: 30px;
  animation: ${gradientShift} 3s ease-in-out infinite;
`;

const ModernParagraph = styled.p`
  font-size: 1.15rem;
  text-align: justify;
  margin-bottom: 20px;
  line-height: 1.7;
  color: #444;
  position: relative;
  padding-left: 20px;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 8px;
    width: 4px;
    height: 4px;
    background: linear-gradient(135deg, #3a4b86, #6c5ce7);
    border-radius: 50%;
  }

  &:hover {
    color: #2c3e50;
    transition: color 0.3s ease;
  }
`;

// Nuevos componentes para la organización mejorada
const ThumbnailWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const ThumbnailLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.isSelected ? '#3a4b86' : '#666'};
  text-align: center;
  line-height: 1.2;
  max-width: 100px;
  transition: color 0.3s ease;

  @media (min-width: 968px) {
    max-width: 120px;
    font-size: 0.8rem;
  }
`;

const ImageDescriptionCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-bottom: 15px;

  @media (min-width: 968px) {
    padding: 18px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
  }
`;

const DescriptionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: #3a4b86;
  margin-bottom: 12px;
  border-bottom: 2px solid #f8f9fa;
  padding-bottom: 8px;

  @media (min-width: 968px) {
    font-size: 1.3rem;
  }
`;

const ImageDescriptionText = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: #555;
  text-align: justify;
  margin-bottom: 12px;

  @media (min-width: 968px) {
    font-size: 1.05rem;
  }
`;

const ImageCounter = styled.div`
  font-size: 0.9rem;
  color: #999;
  text-align: right;
  font-style: italic;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
`;

const NavigationButtons = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
`;

const NavButton = styled.button`
  background: linear-gradient(135deg, #3a4b86, #6c5ce7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(58, 75, 134, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.1);
    box-shadow: 0 6px 18px rgba(58, 75, 134, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// Nuevos componentes estilizados para la sección de ubicación mejorada
const EnhancedLocationSection = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3a4b86, #6c5ce7, #74b9ff);
  }
`;

const LocationHeader = styled.div`
  text-align: center;
  margin-bottom: 50px;
`;

const LocationTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 15px;
  background: linear-gradient(135deg, #3a4b86, #6c5ce7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;

  @media (max-width: 768px) {
    font-size: 2rem;
    flex-direction: column;
    gap: 10px;
  }

  svg {
    color: #3a4b86;
  }
`;

const LocationSubtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  font-weight: 500;
  max-width: 600px;
  margin: 0 auto;
`;

const LocationContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;

  @media (min-width: 968px) {
    grid-template-columns: 1.5fr 1fr;
    gap: 50px;
  }
`;

const MapSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const MapWrapper = styled.div`
  position: relative;
  height: 400px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  transition: transform 0.4s ease;

  &:hover {
    transform: translateY(-5px);
  }

  @media (min-width: 968px) {
    height: 450px;
  }
`;

const MapOverlay = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const AddressInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: #3a4b86;
    font-size: 1.2rem;
  }

  strong {
    color: #333;
    font-size: 1rem;
    display: block;
    margin-bottom: 4px;
  }

  p {
    color: #666;
    font-size: 0.9rem;
    margin: 0;
  }
`;

const MapActions = styled.div`
  display: flex;
  justify-content: center;
`;

const EnhancedMapButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #3a4b86, #6c5ce7);
  color: white;
  padding: 12px 24px;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(58, 75, 134, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(58, 75, 134, 0.4);
    text-decoration: none;
    color: white;
  }

  svg {
    font-size: 1rem;
  }
`;

const TransportOptionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const TransportSelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const TransportSelectors = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 10px;
`;

const TransportSelector = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid ${props => props.isSelected ? '#3a4b86' : '#e9ecef'};
  background: ${props => props.isSelected 
    ? 'linear-gradient(135deg, #3a4b86, #6c5ce7)' 
    : '#ffffff'};
  color: ${props => props.isSelected ? 'white' : '#666'};
  font-size: 1.4rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.isSelected 
    ? '0 6px 20px rgba(58, 75, 134, 0.3)' 
    : '0 4px 12px rgba(0, 0, 0, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 8px 25px rgba(58, 75, 134, 0.4);
    border-color: #3a4b86;
    background: ${props => props.isSelected 
      ? 'linear-gradient(135deg, #3a4b86, #6c5ce7)' 
      : 'linear-gradient(135deg, #f8f9fa, #ffffff)'};
  }
`;

const DynamicTransportCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 2px solid #f1f3f4;
  transition: all 0.4s ease;
  display: flex;
  align-items: flex-start;
  gap: 25px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #3a4b86, #6c5ce7);
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    border-color: #3a4b86;
  }
`;

const DynamicTransportIcon = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3a4b86, #6c5ce7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  flex-shrink: 0;
  box-shadow: 0 6px 18px rgba(58, 75, 134, 0.4);
  animation: ${gradientShift} 3s ease-in-out infinite;
`;

const TransportCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  display: flex;
  align-items: flex-start;
  gap: 20px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
  }
`;

const TransportIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3a4b86, #6c5ce7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(58, 75, 134, 0.3);
`;

const TransportInfo = styled.div`
  flex: 1;
`;

const TransportTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
`;

const LocationTransportDescription = styled.p`
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
`;

const TransportDetails = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #555;
  font-weight: 500;

  svg {
    color: #3a4b86;
    font-size: 0.9rem;
  }
`;

// Nuevos componentes estilizados para la sección de Historia mejorada
const EnhancedHistorySection = styled.section`
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3a4b86, #6c5ce7, #74b9ff);
  }
`;

const HistoryHeader = styled.div`
  text-align: center;
  margin-bottom: 50px;
`;

const HistoryTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 15px;
  background: linear-gradient(135deg, #3a4b86, #6c5ce7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HistorySubtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  font-weight: 500;
  max-width: 600px;
  margin: 0 auto;
`;

const HistoryContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;

  @media (min-width: 968px) {
    grid-template-columns: 1.2fr 1fr;
    gap: 50px;
  }
`;

const HistoryImageSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const TimelineImageContainer = styled.div`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  transition: transform 0.4s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const HistoryMainImage = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
  display: block;
  transition: transform 0.6s ease;

  ${TimelineImageContainer}:hover & {
    transform: scale(1.03);
  }

  @media (min-width: 968px) {
    height: 450px;
  }
`;

const ImageYearBadge = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #3a4b86, #6c5ce7);
  color: white;
  padding: 12px 20px;
  border-radius: 25px;
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: 0 4px 12px rgba(58, 75, 134, 0.4);
  backdrop-filter: blur(10px);
`;

const TimelineSelector = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
`;

const TimelineButton = styled.button`
  background: ${props => props.isSelected 
    ? 'linear-gradient(135deg, #3a4b86, #6c5ce7)' 
    : '#ffffff'};
  color: ${props => props.isSelected ? 'white' : '#333'};
  border: 2px solid ${props => props.isSelected ? '#3a4b86' : '#e9ecef'};
  border-radius: 12px;
  padding: 15px 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.isSelected 
    ? '0 6px 20px rgba(58, 75, 134, 0.3)' 
    : '0 4px 12px rgba(0, 0, 0, 0.1)'};
  text-align: center;
  min-width: 120px;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(58, 75, 134, 0.4);
    border-color: #3a4b86;
  }
`;

const TimelineYear = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 4px;
`;

const TimelineLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
`;

const HistoryTextSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const HistoryCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 2px solid #f1f3f4;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  }
`;

const HistoryCardTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #3a4b86;
  margin-bottom: 15px;
`;

const HistoryCardDescription = styled.p`
  font-size: 1.1rem;
  line-height: 1.7;
  color: #555;
  text-align: justify;
`;

const HistoryEvolution = styled.div`
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-radius: 16px;
  padding: 25px;
  border: 1px solid #e9ecef;
`;

const EvolutionTitle = styled.h4`
  font-size: 1.3rem;
  font-weight: 700;
  color: #3a4b86;
  margin-bottom: 20px;
  text-align: center;
`;

const EvolutionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const EvolutionItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const EvolutionDate = styled.div`
  background: linear-gradient(135deg, #3a4b86, #6c5ce7);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
  min-width: 60px;
  text-align: center;
`;

const EvolutionDesc = styled.p`
  font-size: 1rem;
  color: #555;
  line-height: 1.6;
  margin: 0;
  flex: 1;
`;

// Nuevos componentes estilizados para la sección de Servicios mejorada
const EnhancedServicesSection = styled.section`
  max-width: 1400px;
  margin: 0 auto;
  padding: 80px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3a4b86, #6c5ce7, #74b9ff);
  }

  @media (max-width: 768px) {
    padding: 40px 15px;
    border-radius: 15px;
    margin: 0 10px;
  }
`;

const ServicesHeader = styled.div`
  text-align: center;
  margin-bottom: 60px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    margin-bottom: 40px;
    padding: 0 10px;
  }
`;

const ServicesMainTitle = styled.h2`
  font-size: 2.8rem;
  font-weight: 800;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #3a4b86, #6c5ce7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 15px;
  }

  @media (max-width: 480px) {
    font-size: 1.8rem;
    line-height: 1.3;
  }
`;

const ServicesSubtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  line-height: 1.6;
  font-weight: 400;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    line-height: 1.5;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
    padding: 0 10px;
  }
`;

const ServicesContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;

  @media (max-width: 768px) {
    gap: 30px;
  }
`;

// Nuevos componentes para carrusel horizontal de servicios
const ServicesCarouselWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;

  @media (max-width: 768px) {
    gap: 10px;
    padding: 0 5px;
  }
`;

const ServicesCarouselContainer = styled.div`
  flex: 1;
  overflow: hidden;
  border-radius: 16px;
`;

const ServicesCarouselTrack = styled.div`
  display: flex;
  transition: transform 0.5s ease;
  gap: 20px;

  @media (max-width: 768px) {
    gap: 15px;
  }

  @media (max-width: 480px) {
    gap: 10px;
  }
`;

const ServicesNavigationButton = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #3a4b86, #6c5ce7);
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(58, 75, 134, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 6px 18px rgba(58, 75, 134, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    width: 45px;
    height: 45px;
    font-size: 1.3rem;
    touch-action: manipulation;
  }

  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    font-size: 1.1rem;
    min-width: 40px;
  }
`;

const IndividualServiceCard = styled.div`
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 2px solid #f1f3f4;
  transition: all 0.4s ease;
  position: relative;
  min-width: 300px;
  width: 300px;
  flex-shrink: 0;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3a4b86, #6c5ce7);
  }

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(58, 75, 134, 0.2);
    border-color: #3a4b86;
  }

  @media (max-width: 768px) {
    min-width: 280px;
    width: 280px;
    border-radius: 16px;
  }

  @media (max-width: 480px) {
    min-width: 260px;
    width: 260px;
    border-radius: 14px;
  }

  @media (max-width: 360px) {
    min-width: 240px;
    width: 240px;
  }
`;

const ServiceCardImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 0.4s ease;

  ${IndividualServiceCard}:hover & {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    height: 180px;
  }

  @media (max-width: 480px) {
    height: 160px;
  }
`;

const ServiceCardContent = styled.div`
  padding: 25px;

  @media (max-width: 768px) {
    padding: 20px;
  }

  @media (max-width: 480px) {
    padding: 18px;
  }
`;

const ServiceCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;

  @media (max-width: 768px) {
    gap: 12px;
    margin-bottom: 12px;
  }

  @media (max-width: 480px) {
    gap: 10px;
    margin-bottom: 10px;
  }
`;

const ServiceCardIcon = styled.div`
  font-size: 2.5rem;
  color: #3a4b86;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;

  ${IndividualServiceCard}:hover & {
    transform: scale(1.1);
    color: #6c5ce7;
  }

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const ServiceCardTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: #3a4b86;
  margin: 0;
  line-height: 1.3;
  flex: 1;

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }

  @media (max-width: 480px) {
    font-size: 1.2rem;
    line-height: 1.4;
  }
`;

const ServiceCardDescription = styled.p`
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
  margin: 0;
  text-align: justify;

  @media (max-width: 768px) {
    font-size: 0.95rem;
    line-height: 1.5;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
    line-height: 1.5;
    text-align: left;
  }
`;