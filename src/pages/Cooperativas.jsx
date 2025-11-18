import styled from "styled-components";
import { PublicHeader } from "../components/organismos/PublicHeader";
import { FooterInformativa } from "../components/organismos/FooterInformativa";
import { useState } from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { obtenerOperadorasPublico, obtenerDestinosOperadoraPublico } from "../supabase/crudOperadora";
import { supabase } from '../supabase/supabase.config';
import { useNavigate } from "react-router-dom";
import { FiEye } from 'react-icons/fi';

export function Cooperativas() {
  const [isMuted, setIsMuted] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [operadoraSeleccionada, setOperadoraSeleccionada] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 🚀 TanStack Query: Operadoras públicas (CACHE COMPARTIDO con "Mi destino")
  const { 
    data: operadoras = [], 
    isLoading: loading, 
    error: operadorasError 
  } = useQuery({
    queryKey: ['operadoras-publico'],
    queryFn: obtenerOperadorasPublico,
    staleTime: 15 * 60 * 1000, // 15 min - datos relativamente estáticos
    cacheTime: 30 * 60 * 1000, // 30 min - cache agresivo compartido
    refetchOnMount: false,
    // 🚀 Background refresh inteligente
    refetchOnWindowFocus: true, // Refresh cuando el usuario vuelve a la ventana
    refetchInterval: 20 * 60 * 1000, // Background refresh cada 20 minutos
    refetchIntervalInBackground: false, // Solo si la ventana está activa
    // ¡IMPORTANTE! Esta query usa el MISMO cache que "Mi destino"
    // Si el usuario navega Inicio -> Mi destino -> Cooperativas,
    // NO hará fetch adicional - usará datos cached ⚡
  });

  const handleVerMas = (op) => {
    setOperadoraSeleccionada(op);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setOperadoraSeleccionada(null);
  };

  const handleQuieroViajar = (operadoraId) => {
    // 🚀 Prefetch inmediato antes de navegar para navegación instantánea
    queryClient.prefetchQuery({
      queryKey: ['destinos-operadora-publico', operadoraId],
      queryFn: () => obtenerDestinosOperadoraPublico(operadoraId),
      staleTime: 10 * 60 * 1000,
      cacheTime: 20 * 60 * 1000,
    });
    navigate(`/destinos-operadora/${operadoraId}`);
  };

  const handleConocenos = (operadoraId) => {
    // 🚀 Prefetch información institucional si es diferente 
    queryClient.prefetchQuery({
      queryKey: ['destinos-operadora-publico', operadoraId],
      queryFn: () => obtenerDestinosOperadoraPublico(operadoraId),
      staleTime: 10 * 60 * 1000,
      cacheTime: 20 * 60 * 1000,
    });
    navigate(`/destinos-operadora/${operadoraId}?seccion=info`);
  };

  // 🚀 Prefetching inteligente: pre-cargar destinos cuando el usuario hace hover
  const handleMouseEnterOperadora = (operadoraId) => {
    queryClient.prefetchQuery({
      queryKey: ['destinos-operadora-publico', operadoraId],
      queryFn: () => obtenerDestinosOperadoraPublico(operadoraId),
      staleTime: 10 * 60 * 1000, // 10 minutos
      cacheTime: 20 * 60 * 1000, // 20 minutos
      // Solo prefetch si no hay datos cached
    });
  };

  const handleFileSelect = async (file, type) => {
    try {
      // 1. Eliminar archivo anterior si existe y es ruta relativa
      const rutaAnterior = dataSelect[type];
      if (
        rutaAnterior &&
        typeof rutaAnterior === 'string' &&
        !rutaAnterior.startsWith('http')
      ) {
        console.log('Intentando eliminar:', rutaAnterior);
        const { data: removeData, error: removeError } = await supabase
          .storage
          .from('operadora')
          .remove([rutaAnterior]);
        if (removeError) {
          console.error('Error al eliminar archivo anterior:', removeError);
        } else {
          console.log('Resultado de eliminación:', removeData);
        }
      }

      // 2. Subir y guardar el nuevo archivo
      setSelectedFiles(prev => ({
        ...prev,
        [type]: file
      }));
      setSaving(true);
      setSaved(false);
      const logoOrPortada = await uploadFile(file, type);
      await actualizarOperadora({
        id: dataSelect.id,
        [type]: logoOrPortada
      });
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);

    } catch (error) {
      console.error(`Error al validar archivo ${type}:`, error);
    }
  };

  return (
    <Container>
      <PublicHeader stateConfig={false} isMuted={isMuted} setIsMuted={setIsMuted} />
      <ContentContainer>
        <Title>Cooperativas</Title>
        <Description>
          Información sobre las operadoras de transporte que operan en el Terminal Terrestre Reina de el Cisne.
        </Description>
        
        <OperadorasBoard>
          
          {/* Error handling mejorado */}
          {operadorasError && (
            <ErrorMessage>
              ❌ Error al cargar operadoras. 
              <RefreshButton onClick={() => queryClient.invalidateQueries(['operadoras-publico'])}>
                Reintentar
              </RefreshButton>
            </ErrorMessage>
          )}
          
          {loading ? (
            <LoadingMsg>Cargando operadoras...</LoadingMsg>
          ) : operadoras.length === 0 && !operadorasError ? (
            <EmptyContent>
              <EmptyIcon>🚌</EmptyIcon>
              <EmptyText>No hay operadoras registradas</EmptyText>
              <EmptySubtext>Próximamente información detallada sobre las cooperativas</EmptySubtext>
            </EmptyContent>
          ) : (
            <OperadorasGrid>
              {operadoras.map((op) => (
                <OperadoraCard 
                  key={op.id}
                  onMouseEnter={() => handleMouseEnterOperadora(op.id)}
                >
                  <LogoContainer>
                    {op.logo ? (
                      <LogoImg src={getLogoUrl(op.logo)} alt={op.nombre} />
                    ) : (
                      <LogoPlaceholder>🚌</LogoPlaceholder>
                    )}
                  </LogoContainer>
                  <CardTitle>{op.nombre}</CardTitle>
                  <CardDescription>{op.descripcion}</CardDescription>
                  <VerMasLink href="#" onClick={e => { e.preventDefault(); handleVerMas(op); }} title="Ver más información">

                    <FiEye />
                  </VerMasLink>
                  <QuieroViajarButton onClick={() => handleQuieroViajar(op.id)}>Donde puedo viajar</QuieroViajarButton>
                  <ConocenosButton onClick={() => handleConocenos(op.id)}>Conócenos</ConocenosButton>
                </OperadoraCard>
              ))}
            </OperadorasGrid>
          )}
        </OperadorasBoard>
      </ContentContainer>
      <FooterWrapper>
        <FooterInformativa />
      </FooterWrapper>
      {modalOpen && operadoraSeleccionada && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalClose onClick={handleCloseModal}>×</ModalClose>
            <ModalTitle>{operadoraSeleccionada.nombre}</ModalTitle>
            <ModalSectionTitle>Contacto</ModalSectionTitle>
            <ModalItems>
              <ModalItem><b>Dirección:</b> {operadoraSeleccionada.direccion || 'S/'}</ModalItem>
              <ModalItem>
                <b>Teléfono:</b> {operadoraSeleccionada.telefono || 'No disponible'}
                {operadoraSeleccionada.telefono && (
                  <WhatsappButton
                    href={`https://wa.me/${operadoraSeleccionada.telefono.replace(/[^\d]/g, '')}?text=${encodeURIComponent('Un saludo cordial de ' + operadoraSeleccionada.nombre)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Contactar por WhatsApp"
                  >
                    <WhatsappIcon viewBox="0 0 32 32">
                      <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.393L4 29l7.824-2.05C13.41 27.633 14.678 28 16 28c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.18 0-2.33-.205-3.41-.607l-.243-.09-4.646 1.217 1.24-4.53-.158-.234C6.82 18.07 6 16.573 6 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.29-7.71c-.29-.145-1.71-.844-1.974-.94-.264-.097-.456-.145-.648.145-.193.29-.744.94-.912 1.133-.168.193-.336.217-.626.072-.29-.145-1.225-.452-2.334-1.44-.863-.77-1.445-1.72-1.616-2.01-.168-.29-.018-.447.127-.592.13-.13.29-.336.435-.504.145-.168.193-.29.29-.483.097-.193.048-.362-.024-.507-.072-.145-.648-1.566-.888-2.15-.234-.563-.474-.487-.648-.496-.168-.007-.362-.009-.555-.009-.193 0-.507.072-.773.362-.266.29-1.016.994-1.016 2.423 0 1.429 1.04 2.809 1.186 3.004.145.193 2.05 3.13 5.07 4.267.71.244 1.263.39 1.695.499.712.181 1.36.156 1.872.095.571-.067 1.71-.698 1.953-1.372.24-.674.24-1.252.168-1.372-.072-.12-.264-.193-.555-.338z" />
                    </WhatsappIcon>
                  </WhatsappButton>
                )}
              </ModalItem>
              <ModalItem><b>Correo:</b> {operadoraSeleccionada.correo || 'No disponible'}</ModalItem>
              <ModalItem><b>Sitio web:</b> {operadoraSeleccionada.sitioweb ? <a href={operadoraSeleccionada.sitioweb} target="_blank" rel="noopener noreferrer" style={{color:'#3a4b86',fontWeight:'bold'}}>{operadoraSeleccionada.sitioweb}</a> : 'No disponible'}</ModalItem>
              <ModalItem><b>Horario de atención:</b> {operadoraSeleccionada.horarioatencion || 'No disponible'}</ModalItem>
            </ModalItems>
            <ModalSectionTitle>Información institucional</ModalSectionTitle>
            <ModalItems>
              <ModalItem><b>Dirigente:</b> {operadoraSeleccionada.dirigente || 'No disponible'}</ModalItem>
              <ModalItem><b>Provincias de servicios:</b> {operadoraSeleccionada.servicios || 'No disponible'}</ModalItem>
            </ModalItems>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

// Utilidad para obtener la URL pública del logo
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
  padding: 20px;
  box-sizing: border-box;
`;

const ContentContainer = styled.div`
  background-color: white;
  padding: 32px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 1000px;
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

const Description = styled.p`
  font-size: 1.2rem;
  color: #444;
  margin-bottom: 40px;
  line-height: 1.6;
`;

const OperadorasBoard = styled.div`
  margin-top: 20px;
`;

const OperadorasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
  margin-top: 20px;
  @media (min-width: 1100px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const OperadoraCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 28px 20px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 320px;
  position: relative;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const LogoContainer = styled.div`
  width: 100%;
  max-width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
  overflow: hidden;
  border-radius: 10px;
`;

const LogoImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: none;
  display: block;
  margin: 0 auto;
`;

const LogoPlaceholder = styled.div`
  font-size: 2.5rem;
  color: #bbb;
`;

const CardTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: #3a4b86;
  margin-bottom: 10px;
`;

const CardDescription = styled.p`
  font-size: 0.97rem;
  color: #444;
  margin-bottom: 14px;
  min-height: 38px;
  text-align: justify;
`;

const VerMasLink = styled.a`
  position: absolute;
  top: 18px;
  right: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9ecef;
  color: #3a4b86;
  border: none;
  border-radius: 50%;
  width: 38px;
  height: 38px;
  font-size: 1.3rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: #3a4b86;
    color: #fff;
    transform: scale(1.1);
  }
`;

const QuieroViajarButton = styled.button`
  background: #f8bf5b;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 1rem;
  font-weight: 600;
  margin-top: 8px;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
  &:hover {
    background: #e0a84d;
  }
`;

const ConocenosButton = styled.button`
  background: #3a4b86;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 1rem;
  font-weight: 600;
  margin-top: 8px;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
  &:hover {
    background: #25305a;
  }
`;

const LoadingMsg = styled.div`
  color: #3a4b86;
  font-size: 1.2rem;
  margin: 40px 0;
`;

const EmptyContent = styled.div`
  background: rgba(58, 75, 134, 0.07);
  border-radius: 12px;
  padding: 60px 40px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
`;

const EmptyText = styled.h2`
  font-size: 1.5rem;
  color: #3a4b86;
  margin-bottom: 10px;
  font-weight: 600;
`;

const EmptySubtext = styled.p`
  font-size: 1rem;
  color: #444;
  line-height: 1.5;
`;

const FooterWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  padding: 48px 40px 40px 40px;
  min-width: 340px;
  max-width: 98vw;
  width: 540px;
  position: relative;
`;

const ModalClose = styled.button`
  position: absolute;
  top: 18px;
  right: 18px;
  background: none;
  border: none;
  font-size: 2rem;
  color: #3a4b86;
  cursor: pointer;
  font-weight: bold;
  transition: color 0.2s;
  &:hover {
    color: #25305a;
  }
`;

const ModalTitle = styled.h2`
  font-size: 1.3rem;
  color: #3a4b86;
  font-weight: 700;
  margin-bottom: 24px;
  text-align: center;
`;

const ModalSectionTitle = styled.h4`
  font-size: 1.08rem;
  color: #25305a;
  font-weight: 700;
  margin: 18px 0 10px 0;
  text-align: left;
`;

const ModalItems = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ModalItem = styled.li`
  font-size: 1rem;
  color: #333;
  margin-bottom: 14px;
  word-break: break-word;
  a {
    color: #2a5bd7;
    text-decoration: underline;
    &:hover {
      color: #764ba2;
    }
  }
`;

const WhatsappButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: #25D366 !important;
  color: white !important;
  font-weight: 500;
  border: none;
  border-radius: 5px;
  padding: 4px 10px;
  font-size: 0.95rem;
  text-decoration: none;
  margin-left: 8px;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  &:hover {
    background-color: #128C7E !important;
    color: white !important;
  }
`;

const WhatsappIcon = styled.svg`
  width: 18px;
  height: 18px;
  fill: white;
`;

// 🚀 Styled components para TanStack Query feedback
const ErrorMessage = styled.div`
  background: linear-gradient(135deg, #ffebee, #ffcdd2);
  border: 1px solid #f44336;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  color: #c62828;
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const RefreshButton = styled.button`
  background: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #d32f2f;
  }
`; 