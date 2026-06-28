import styled, { createGlobalStyle } from "styled-components";
import { PublicHeader } from "../components/organismos/PublicHeader";
import { FooterInformativa } from "../components/organismos/FooterInformativa";
import { VideoModal } from "../components/modals/VideoModal";
import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { obtenerOperadorasPublico, obtenerDestinosOperadoraPublico, obtenerInfoInstitucional } from "../supabase/crudOperadora";
import { FiClock, FiArrowLeft, FiTarget } from "react-icons/fi";
import { FaLightbulb, FaGlobe, FaBus, FaPlay } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { supabase } from '../supabase/supabase.config';

export function DestinosOperadora() {
  const [isMuted, setIsMuted] = useState(true);
  const [operadora, setOperadora] = useState(null);
  const [loading, setLoading] = useState(true);
  const [destinos, setDestinos] = useState([]);
  const [infoInstitucional, setInfoInstitucional] = useState(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const { id } = useParams();
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const seccion = searchParams.get('seccion') || 'destinos';
  // Estado para controlar el colapso de rutas por destino
  const [rutasExpandida, setRutasExpandida] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const operadoras = await obtenerOperadorasPublico();
        const operadoraEncontrada = operadoras.find(op => op.id === parseInt(id));
        setOperadora(operadoraEncontrada || null);

        if (operadoraEncontrada) {
          if (seccion === 'destinos') {
            const destinosData = await obtenerDestinosOperadoraPublico(operadoraEncontrada.id);
            setDestinos(destinosData || []);
          } else if (seccion === 'info') {
            const infoData = await obtenerInfoInstitucional(operadoraEncontrada.id);
            setInfoInstitucional(infoData);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAllData();
    }
  }, [id, seccion]);

  const destinosFiltrados = destinos.filter(destino => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return true;
    return (
      destino.descripcion_destino?.toLowerCase().includes(texto) ||
      destino.ruta_descripcion?.toLowerCase().includes(texto)
    );
  });

  // Agrupa los destinos por descripcion_destino
  // const destinosAgrupados = _.groupBy(destinos, "descripcion_destino");
  // const destinosFiltrados = Object.entries(destinosAgrupados).filter(([descripcion, rutas]) => {
  //   const texto = busqueda.trim().toLowerCase();
  //   if (!texto) return true;
  //   // Buscar en el nombre del destino o en alguna ruta
  //   return (
  //     descripcion.toLowerCase().includes(texto) ||
  //     rutas.some(destino => destino.ruta_descripcion?.toLowerCase().includes(texto))
  //   );
  // });

  // Agrega la función para formatear el horario en 12h con am/pm
  function formatHoraAMPM(horaStr) {
    if (!horaStr) return '';
    // Acepta formatos como '22:15', '08:00', etc.
    const [h, m] = horaStr.split(":");
    let hour = parseInt(h, 10);
    const minute = m;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    // Mantener formato 24h pero agregar AM/PM
    return `${horaStr} ${ampm}`;
  }

  // Función para mostrar primer y último bloque de palabras de la ruta
  function getRutaColapsada(ruta, minWords = 3) {
    if (!ruta) return '';
    const palabras = ruta.split(/\s+/);
    if (palabras.length <= minWords * 2 + 1) return ruta;
    const inicio = palabras.slice(0, minWords).join(' ');
    const fin = palabras.slice(-minWords).join(' ');
    return `${inicio} - ${fin}`;
  }

  // Función para abrir el modal de video
  const handleOpenVideoModal = async (destino) => {
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
          icon: '��',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
        return;
      }

      // Si hay video, abrir el modal
    const destinoConRutas = {
      ...destino,
      rutas: [
        {
          idruta: destino.idruta,
          ruta_descripcion: destino.ruta_descripcion,
          precio: destino.precio,
          precioespecial: destino.precioespecial,
          horarios: Array.isArray(destino.horarios) ? destino.horarios : [],
        }
      ]
    };
    setSelectedDestination(destinoConRutas);
    setVideoModalOpen(true);
    } catch (error) {
      console.error('Error al verificar video:', error);
      toast.error('Error al verificar la disponibilidad del video');
    }
  };

  // Función para cerrar el modal de video
  const handleCloseVideoModal = () => {
    setVideoModalOpen(false);
    setSelectedDestination(null);
  };

  if (loading) {
    return (
      <Container>
        <PublicHeader stateConfig={false} isMuted={isMuted} setIsMuted={setIsMuted} />
        <ContentContainer>
          <LoadingMsg>Cargando información de la operadora...</LoadingMsg>
        </ContentContainer>
        <FooterWrapper>
          <FooterInformativa />
        </FooterWrapper>
      </Container>
    );
  }

  if (!operadora) {
    return (
      <Container>
        <PublicHeader stateConfig={false} isMuted={isMuted} setIsMuted={setIsMuted} />
        <ContentContainer>
          <Title>Operadora no encontrada</Title>
          <Description>La operadora que buscas no existe o ha sido eliminada.</Description>
        </ContentContainer>
        <FooterWrapper>
          <FooterInformativa />
        </FooterWrapper>
      </Container>
    );
  }

  return (
    <Container>
      <GlobalStyle />
      <PublicHeader useWhiteText={true} stateConfig={false} isMuted={isMuted} setIsMuted={setIsMuted} />
      <PortadaSection>
        <PortadaBlurBg portada={getPortadaUrl(operadora.portada)} />
        <PortadaMainImg portada={getPortadaUrl(operadora.portada)}>
          <PortadaOverlay>
            <PortadaContent>
              <PortadaTitle>{operadora.nombre}</PortadaTitle>
            </PortadaContent>
          </PortadaOverlay>
          {infoInstitucional?.lema && (
            <PortadaLema>{infoInstitucional.lema}</PortadaLema>
          )}
        </PortadaMainImg>
      </PortadaSection>
      <ContentContainer style={{marginTop: 40}}>
        {seccion === 'destinos' ? (
          <>
            <Title>Destinos de {operadora.nombre}</Title>
            <Description>
              Información sobre los destinos disponibles desde la Terminal Terrestre.
            </Description>
            <BusquedaRow>
              <BusquedaInput
                type="text"
                placeholder="Buscar destino o ruta..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </BusquedaRow>
            <DestinosList>
              {destinosFiltrados.length === 0 ? (
                <NoDestinosMsg>No hay destinos registrados para esta operadora.</NoDestinosMsg>
              ) : (
                destinosFiltrados.map((destino, idx) => (
                  <DestinoCard key={destino.id_destino + '-' + destino.idruta}>
                    <DestinoImgContainer onClick={() => handleOpenVideoModal(destino)} className="destino-img-container">
                      <PlayIconOverlay>
                        <FaPlay />
                      </PlayIconOverlay>
                      <DestinoImg 
                        src={getDestinoImg(destino)} 
                        alt={destino.descripcion_destino} 
                      />
                      <div className="play-overlay">
                        <div className="play-icon">▶</div>
                      </div>
                    </DestinoImgContainer>
                    <DestinoInfo>
                      <DestinoTitle>{destino.descripcion_destino}</DestinoTitle>
                      <RutaColumna>
                            <DestinoRuta>
                              <span><b>Ruta:</b></span> 
                              <span 
                                className={`ruta-colapsable ${rutasExpandida[destino.id_destino] ? 'expanded' : ''}`}
                                onClick={() => setRutasExpandida(prev => ({ ...prev, [destino.id_destino]: !prev[destino.id_destino] }))}
                                style={{ cursor: 'pointer' }}
                              >
                                {rutasExpandida[destino.id_destino] 
                                  ? destino.ruta_descripcion 
                                  : getRutaColapsada(destino.ruta_descripcion)
                                }
                              </span>
                              {destino.ruta_descripcion && destino.ruta_descripcion.split(/\s+/).length > 7 && (
                                <span style={{ color: '#3a4b86', fontSize: '0.9rem', marginLeft: '8px' }}>
                                  {rutasExpandida[destino.id_destino] ? '▼' : '▶'}
                                </span>
                              )}
                            </DestinoRuta>
                            <DestinoPrecios>
                              <span><b>Precio:</b> ${Number(destino.precio).toFixed(2)}</span>
                              {destino.precioespecial != null && destino.precioespecial !== '' && Number(destino.precioespecial) > 0 && (
                                <span><b>Precio especial:</b> ${Number(destino.precioespecial).toFixed(2)}</span>
                              )}
                            </DestinoPrecios>
                            <HorariosTitle>Horarios de salidas:</HorariosTitle>
                            <HorariosListColumna className="horarios-scrollable">
                              {Array.isArray(destino.horarios) && destino.horarios.length > 0 ? (
                                destino.horarios.map(horario => (
                                  <HorarioItem key={horario.id}>
                                <FiClock style={{marginRight:6}} /> {formatHoraAMPM(horario.descripcion)}
                                  </HorarioItem>
                                ))
                              ) : (
                                <HorarioItem>No hay horarios disponibles</HorarioItem>
                              )}
                            </HorariosListColumna>
                          </RutaColumna>
                    </DestinoInfo>
                  </DestinoCard>
                ))
              )}
            </DestinosList>
          </>
        ) : (
          <>
            {infoInstitucional?.descripcion_bienvenida && (
              <BienvenidaSection>
                {operadora.logo && (
                  <BienvenidaLogo
                    src={getLogoUrl(operadora.logo)}
                    alt={`Logo ${operadora.nombre}`}
                  />
                )}
                <BienvenidaText>{infoInstitucional.descripcion_bienvenida}</BienvenidaText>
              </BienvenidaSection>
            )}
            <Title>Conoce más sobre {operadora.nombre}</Title>
            <MisionRow>
              <MisionImgBox>
                {infoInstitucional?.fotomision && (
                  <MisionImg src={infoInstitucional.fotomision} alt="Foto misión" />
                )}
                <MisionBanner>
                  <TrophyIcon viewBox="0 0 32 32" width="32" height="32" fill="white">
                    <path d="M8 4a1 1 0 0 0-1 1v3a7 7 0 0 0 6 6.92V23H9a1 1 0 1 0 0 2h14a1 1 0 1 0 0-2h-4V14.92A7 7 0 0 0 25 8V5a1 1 0 0 0-1-1H8zm1 2h14v2a5 5 0 0 1-10 0V6zm-3 3a1 1 0 0 1 1 1v1a9 9 0 0 0 7 8.72V23h-2v-2a1 1 0 1 0-2 0v2H7v-2a1 1 0 1 0-2 0v2a1 1 0 0 0 1 1h2v2a1 1 0 1 0 2 0v-2h2v2a1 1 0 1 0 2 0v-2h2v2a1 1 0 1 0 2 0v-2h2v2a1 1 0 1 0 2 0v-2h2a1 1 0 0 0 1-1v-2a1 1 0 1 0-2 0v2h-2v-2a1 1 0 1 0-2 0v2h-2v-2a1 1 0 1 0-2 0v2h-2v-2a1 1 0 1 0-2 0v2H7v-2a1 1 0 0 0-1-1z"/>
                  </TrophyIcon>
                  <MisionBannerText>NUESTRA MISIÓN</MisionBannerText>
                </MisionBanner>
              </MisionImgBox>
              <MisionTextBox>
                <MisionText>{infoInstitucional?.mision || 'Misión no disponible.'}</MisionText>
              </MisionTextBox>
            </MisionRow>
            <VisionRow>
              <VisionImgBox className="VisionImgBox">
                {infoInstitucional?.fotovision && (
                  <VisionImg src={infoInstitucional.fotovision} alt="Foto visión" />
                )}
                <VisionBanner>
                  <TrophyIcon viewBox="0 0 32 32" width="32" height="32" fill="white">
                    <path d="M8 4a1 1 0 0 0-1 1v3a7 7 0 0 0 6 6.92V23H9a1 1 0 1 0 0 2h14a1 1 0 1 0 0-2h-4V14.92A7 7 0 0 0 25 8V5a1 1 0 0 0-1-1H8zm1 2h14v2a5 5 0 0 1-10 0V6zm-3 3a1 1 0 0 1 1 1v1a9 9 0 0 0 7 8.72V23h-2v-2a1 1 0 1 0-2 0v2H7v-2a1 1 0 1 0-2 0v2a1 1 0 0 0 1 1h2v2a1 1 0 1 0 2 0v-2h2v2a1 1 0 1 0 2 0v-2h2v2a1 1 0 1 0 2 0v-2h2v2a1 1 0 1 0 2 0v-2h2a1 1 0 0 0 1-1v-2a1 1 0 1 0-2 0v2h-2v-2a1 1 0 1 0-2 0v2h-2v-2a1 1 0 1 0-2 0v2h-2v-2a1 1 0 1 0-2 0v2H7v-2a1 1 0 0 0-1-1z"/>
                  </TrophyIcon>
                  <VisionBannerText>NUESTRA VISIÓN</VisionBannerText>
                </VisionBanner>
              </VisionImgBox>
              <VisionTextBox className="VisionTextBox">
                <VisionText>{infoInstitucional.vision}</VisionText>
              </VisionTextBox>
            </VisionRow>
            <PorQueSection>
              <PorQueTitle>¿Por qué elegirnos?</PorQueTitle>
              <PorQueText>Queremos brindar un servicio eficiente y de calidad a un mayor número de personas, tanto a nivel nacional como internacional.</PorQueText>
              <ServiciosSection>
                <ServiciosImgBox>
                  <ServiciosImg src="https://i.ibb.co/dJ14DcTF/9.png" alt="Servicios" />
                </ServiciosImgBox>
                <ServiciosListBox>
                  <ServiciosTitle>Nuestros Servicios</ServiciosTitle>
                  <ServiciosList>
                    {infoInstitucional?.servicios
                      ? infoInstitucional.servicios.split(',').map((servicio, idx) => (
                          <ServicioItem key={idx}>
                            <FaBus style={{ color: '#3a4b86', fontSize: 22, flexShrink: 0 }} />
                            <ServicioText>{servicio.trim()}</ServicioText>
                          </ServicioItem>
                        ))
                      : <ServicioItem>No hay servicios disponibles.</ServicioItem>}
                  </ServiciosList>
                </ServiciosListBox>
              </ServiciosSection>
            </PorQueSection>
          </>
        )}
      </ContentContainer>
      <FooterWrapper>
        <FooterInformativa />
      </FooterWrapper>
      
      {/* Modal de video */}
      <VideoModal
        isOpen={videoModalOpen}
        onClose={handleCloseVideoModal}
        destination={selectedDestination}
        operator={operadora}
      />
    </Container>
  );
}

// Utilidad para obtener imagen del destino (puedes personalizarla por ciudad/provincia)
function getDestinoImg(destino) {
  // Puedes usar una imagen por defecto o lógica para ciudad/provincia
  return "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80";
}

function getPortadaUrl(portadaPath) {
  if (!portadaPath) return '';
  if (portadaPath.startsWith('http')) return portadaPath;
  const { data } = supabase.storage.from('operadora').getPublicUrl(portadaPath);
  return data?.publicUrl || '';
}

function getLogoUrl(logoPath) {
  if (!logoPath) return '';
  if (logoPath.startsWith('http')) return logoPath;
  const { data } = supabase.storage.from('operadora').getPublicUrl(logoPath);
  return data?.publicUrl || '';
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f0f2f5;
  align-items: center;
  justify-content: flex-start;
  padding: 0 20px 20px 20px;
  box-sizing: border-box;
  width: 100vw;
  max-width: 100vw;
  overflow-x: hidden;
`;

const GlobalStyle = createGlobalStyle`
  body {
    overflow-x: hidden !important;
    width: 100vw;
    max-width: 100vw;
  }
`;

const ContentContainer = styled.div`
  background-color: white;
  padding: 40px 80px 100px 80px;
  border-radius: 0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 1092px;
  width: 100%;
  margin-top: 100px;
  margin-bottom: 40px;
  box-sizing: border-box;
  overflow: visible;
  position: relative;
  @media (max-width: 900px) {
    padding: 24px 12px 24px 12px;
  }
`;

const Title = styled.h2`
  font-size: 2.2rem;
  color: #3a4b86;
  margin-bottom: 30px;
  font-weight: 600;
`;

const Description = styled.p`
  font-size: 1.2rem;
  color: #444;
  margin-bottom: 40px;
  line-height: 1.6;
`;

const BienvenidaSection = styled.section`
  display: flex;
  align-items: center;
  gap: 28px;
  width: 100%;
  margin: 0 0 40px 0;
  padding: 28px 32px;
  background: linear-gradient(135deg, #f8f9fc 0%, #eef2fa 100%);
  border-left: 5px solid #3a4b86;
  border-radius: 12px;
  text-align: left;
  box-shadow: 0 2px 12px rgba(58, 75, 134, 0.08);

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 18px;
    padding: 20px 18px;
    margin-bottom: 28px;
  }
`;

const BienvenidaLogo = styled.img`
  width: 120px;
  height: 120px;
  object-fit: contain;
  flex-shrink: 0;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  @media (max-width: 900px) {
    width: 96px;
    height: 96px;
  }
`;

const BienvenidaText = styled.p`
  margin: 0;
  font-size: 1.15rem;
  line-height: 1.75;
  color: #333;
  white-space: pre-line;

  @media (max-width: 900px) {
    font-size: 1.02rem;
  }
`;

const LoadingMsg = styled.div`
  color: #3a4b86;
  font-size: 1.2rem;
  margin: 40px 0;
`;

const DestinosList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-top: 40px;
  width: 100%;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const DestinoCard = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #e1e5e9;
  border-radius: 16px;
  padding: 24px;
  gap: 20px;
  box-sizing: border-box;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(58, 75, 134, 0.15);
    border-color: #3a4b86;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3a4b86, #fc6027);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
  
  @media (max-width: 900px) {
    padding: 20px;
    gap: 16px;
  }
`;

const DestinoImgContainer = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  /* Clase para el hover del PlayIconOverlay */
  &.destino-img-container {
    /* Estilos específicos si es necesario */
  }
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 25px rgba(58, 75, 134, 0.25);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::after {
    opacity: 1;
  }
  
  @media (max-width: 900px) {
    height: 180px;
  }
`;

const PlayIconOverlay = styled.div`
    position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(58, 75, 134, 0.9);
      border-radius: 50%;
  width: 60px;
  height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
  z-index: 3;
  color: #fff;
  font-size: 1.5rem;
  pointer-events: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  
  .destino-img-container:hover & {
    background: rgba(252, 96, 39, 0.9);
    transform: translate(-50%, -50%) scale(1.1);
    border-color: rgba(255, 255, 255, 0.4);
  }
`;

const DestinoImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
`;

const DestinoInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  width: 100%;
  gap: 12px;
`;

const DestinoTitle = styled.h3`
  font-size: 1.4rem;
  color: #3a4b86;
  font-weight: 700;
  margin-bottom: 12px;
  width: 100%;
  line-height: 1.3;
  text-align: center;
  
  @media (max-width: 900px) {
    font-size: 1.3rem;
  }
`;

const DestinoRuta = styled.div`
  font-size: 1rem;
  color: #333;
  margin-bottom: 12px;
  padding: 10px;
  background: #f0f2f5;
  border-radius: 8px;
  border-left: 4px solid #3a4b86;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  
  span:first-child {
    color: #3a4b86;
    font-weight: 600;
    white-space: nowrap;
  }
  
  .ruta-colapsable {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    white-space: normal;
    word-break: break-word;
    transition: max-height 0.2s;
    flex: 1;
    
    @media (max-width: 900px) {
      max-width: 100%;
      font-size: 1rem;
    }
  }
  
  .ruta-colapsable.expanded {
    -webkit-line-clamp: unset;
    max-height: none;
    overflow: visible;
  }
  
  @media (max-width: 900px) {
    padding: 8px;
    font-size: 0.95rem;
  }
`;

const DestinoPrecios = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3a4b86;
  
  span {
    font-size: 1rem;
    color: #333;
    font-weight: 500;
    
    b {
      color: #3a4b86;
      font-weight: 600;
    }
  }
  
  @media (max-width: 900px) {
    padding: 10px;
    
    span {
      font-size: 0.95rem;
    }
  }
`;

const HorariosTitle = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
  color: #3a4b86;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &::before {
    content: '🕒';
    font-size: 1.1rem;
  }
`;

const HorariosListColumna = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  
  &.horarios-scrollable {
    /* Altura para mostrar exactamente 3 horarios */
    /* Cada horario: 0.95rem font + 8px padding top/bottom + 4px margin bottom = ~32px */
    /* 3 horarios * 32px + 2 gaps de 6px = 108px */
    max-height: 108px;
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
    
    @media (max-width: 900px) {
      /* En móvil: 0.9rem font + 6px padding top/bottom + 4px margin bottom = ~28px */
      /* 3 horarios * 28px + 2 gaps de 4px = 92px */
      max-height: 92px;
      gap: 4px;
    }
  }
`;

const HorarioItem = styled.li`
  font-size: 0.95rem;
  color: #555;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #fc6027;
  margin-bottom: 4px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 900px) {
    font-size: 0.9rem;
    padding: 3px 6px;
  }
`;

const NoDestinosMsg = styled.div`
  color: #3a4b86;
  font-size: 1.2rem;
  margin: 40px 0;
`;

const FooterWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const RutaColumna = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  gap: 12px;
`;

const LineaDivisoria = styled.hr`
  width: 100%;
  border: none;
  border-top: 1.5px solid #e0e0e0;
  margin: 18px 0;
`;

const BusquedaRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 32px;
`;

const BusquedaInput = styled.input`
  width: 100%;
  max-width: 400px;
  margin-left: auto;
  display: block;
  padding: 12px 16px;
  border: 1px solid #3a4b86;
  border-radius: 6px;
  font-size: 1.1rem;
  outline: none;
  margin-bottom: 0;
  box-sizing: border-box;
  &:focus {
    border-color: #25D366;
    box-shadow: 0 0 0 2px #25d36633;
  }
`;

const PortadaSection = styled.section`
  width: 100vw;
  min-height: 100vh;
  height: 100vh;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin-top: 0;
  box-shadow: 0 4px 18px rgba(0,0,0,0.08);
  overflow: hidden;
`;

const PortadaBlurBg = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  width: 100%;
  height: 100%;
  background: ${({portada}) => portada ? `url('${portada}') center center/cover no-repeat` : '#e9ecef'};
  filter: blur(18px) brightness(0.7);
  z-index: 1;
`;

const PortadaMainImg = styled.div`
  position: relative;
  z-index: 2;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: ${({portada}) => portada ? `url('${portada}') center center/contain no-repeat` : 'none'};
`;

const PortadaOverlay = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg,rgba(0,0,0,0.12) 0%,rgba(0,0,0,0.38) 100%);
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
`;

const PortadaContent = styled.div`
  width: 100%;
  padding: 32px 40px 18px 40px;
  text-align: left;
`;

const PortadaTitle = styled.h1`
  color: #fff;
  font-size: 2.6rem;
  font-weight: 800;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.18);
  margin: 0;
`;

const PortadaLema = styled.h2`
  color: #fff;
  font-size: 2.1rem;
  font-weight: 700;
  text-align: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.28);
  margin: 0;
  width: 70%;
  max-width: 600px;
  white-space: pre-line;
`;

const InfoSection = styled.div`
  text-align: left;
  margin-bottom: 40px;
  width: 100%;
`;

const InfoTitle = styled.h3`
  font-size: 1.8rem;
  color: #3a4b86;
  font-weight: 700;
  margin-bottom: 16px;
  border-bottom: 2px solid #3a4b86;
  padding-bottom: 8px;
  width: 90%;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
`;

const InfoText = styled.p`
  font-size: 1.1rem;
  color: #333;
  line-height: 1.7;
  white-space: pre-wrap;
  text-align: justify;
  width: 90%;
  margin-left: auto;
  margin-right: auto;
`;

const MisionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  width: 100%;
  min-height: 520px;
  margin-bottom: 60px;
  padding-bottom: 60px;
  padding-right: 0;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border-radius: 0;
  overflow: visible;
  position: relative;
  margin-left: auto;
  margin-right: auto;
  @media (max-width: 900px) {
    flex-direction: column;
    align-items: stretch;
    min-height: unset;
    padding-bottom: 24px;
    padding-right: 0;
    width: 100%;
  }
`;

const MisionImgBox = styled.div`
  position: relative;
  width: 65%;
  min-width: 380px;
  max-width: 700px;
  min-height: 380px;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  background: none;
  overflow: visible;
  z-index: 1;
  @media (max-width: 900px) {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    margin-bottom: 24px;
    min-height: 220px;
  }
`;

const MisionImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0;
  box-shadow: none;
  clip-path: polygon(0 0, 92% 0, 100% 100%, 0% 100%);
`;

const MisionBanner = styled.div`
  position: absolute;
  right: -68px;
  bottom: -40px;
  width: 340px;
  min-width: 220px;
  background: #3a4b86;
  color: #fff;
  display: flex;
  align-items: center;
  padding: 16px 32px;
  font-weight: bold;
  font-size: 1.5rem;
  clip-path: polygon(0 0, 92% 0, 100% 100%, 0% 100%);
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  border-radius: 0;
  z-index: 10;
  @media (max-width: 900px) {
    position: absolute;
    left: 50%;
    right: auto;
    bottom: 12px;
    width: 70%;
    min-width: 0;
    border-radius: 0;
    clip-path: polygon(0 0, 92% 0, 100% 100%, 0% 100%);
    margin-top: 0;
    justify-content: center;
    transform: translateX(-50%);
    padding: 8px 12px;
    font-size: 1.05rem;
  }
`;

const TrophyIcon = styled.svg`
  margin-right: 16px;
  flex-shrink: 0;
`;

const MisionBannerText = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 1px;
  @media (max-width: 900px) {
    font-size: 1.05rem;
  }
`;

const MisionTextBox = styled.div`
  width: 40%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 32px;
  background: #fff;
  @media (max-width: 900px) {
    width: 100%;
    padding: 24px 12px;
  }
`;

const MisionText = styled.p`
  font-size: 0.95rem;
  color: #222;
  line-height: 1.6;
  margin: 0;
  text-align: justify;
  @media (max-width: 900px) {
    font-size: 0.7rem;
  }
`;

const VisionRow = styled(MisionRow)`
  flex-direction: row;
  @media (max-width: 900px) {
    flex-direction: column;
    & > div {
      width: 100% !important;
      max-width: 100% !important;
    }
    & > div.VisionImgBox {
      order: 1;
    }
    & > div.VisionTextBox {
      order: 2;
    }
  }
`;

const VisionImgBox = styled(MisionImgBox)`
  justify-content: flex-end;
`;

const VisionImg = styled(MisionImg)`
  clip-path: polygon(8% 0, 100% 0, 100% 100%, 0% 100%);
`;

const VisionBanner = styled(MisionBanner)`
  left: -68px;
  right: auto;
  background: #3a4b86;
  clip-path: polygon(8% 0, 100% 0, 100% 100%, 0% 100%);
  @media (max-width: 900px) {
    left: 50%;
    right: auto;
    bottom: 12px;
    width: 70%;
    min-width: 0;
    border-radius: 0;
    clip-path: polygon(8% 0, 100% 0, 100% 100%, 0% 100%);
    margin-top: 0;
    justify-content: center;
    transform: translateX(-50%);
    padding: 8px 12px;
    font-size: 1.05rem;
  }
`;

const VisionBannerText = styled(MisionBannerText)``;

const VisionTextBox = styled(MisionTextBox)`
  justify-content: flex-start;
`;

const VisionText = styled(MisionText)``;

const ServiciosSection = styled.section`
  display: flex;
  align-items: stretch;
  gap: 40px;
  width: 100%;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border-radius: 0;
  margin: 48px 0 0 0;
  padding: 0;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 0;
    margin: 24px 0 0 0;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }
`;

const ServiciosImgBox = styled.div`
  width: 340px;
  min-width: 220px;
  max-width: 400px;
  height: auto;
  min-height: 100%;
  overflow: hidden;
  border-radius: 12px 0 0 12px;
  display: flex;
  @media (max-width: 900px) {
    width: 100%;
    max-width: 100%;
    height: 180px;
    border-radius: 12px 12px 0 0;
    min-height: unset;
  }
`;

const ServiciosImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const ServiciosListBox = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 32px 24px;
  height: auto;
  @media (max-width: 900px) {
    padding: 18px 10px 24px 10px;
  }
`;

const ServiciosTitle = styled.h3`
  font-size: 1.8rem;
  color: #3a4b86;
  font-weight: 700;
  margin-bottom: 18px;
  border-bottom: 2px solid #3a4b86;
  padding-bottom: 8px;
  text-align: left;
  @media (max-width: 900px) {
    font-size: 1.3rem;
    margin-bottom: 12px;
    padding-bottom: 6px;
  }
`;

const ServiciosList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  @media (max-width: 900px) {
    gap: 10px;
  }
`;

const ServicioItem = styled.li`
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 1.1rem;
  color: #222;
  @media (max-width: 900px) {
    font-size: 0.98rem;
    gap: 10px;
  }
`;

const ServicioText = styled.span`
  font-size: 1.08rem;
  @media (max-width: 900px) {
    font-size: 0.98rem;
  }
`;

const PorQueSection = styled.section`
  width: 100%;
  margin: 48px 0 0 0;
  background: none;
  @media (max-width: 900px) {
    margin: 32px 0 0 0;
  }
`;

const PorQueTitle = styled.h3`
  font-size: 2.2rem;
  color: #3a4b86;
  margin-bottom: 30px;
  font-weight: 600;
  @media (max-width: 900px) {
    font-size: 1.3rem;
    margin-bottom: 16px;
  }
`;

const PorQueText = styled.p`
  font-size: 1.2rem;
  color: #444;
  margin-bottom: 40px;
  line-height: 1.6;
  text-align: justify;
  @media (max-width: 900px) {
    font-size: 1rem;
    margin-bottom: 18px;
  }
`;