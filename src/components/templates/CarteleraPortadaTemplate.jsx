import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { PublicHeader } from '../organismos/PublicHeader';
import CarteleraDetalleModal from '../modals/CarteleraDetalleModal';
import { obtenerCartelera } from '../../supabase/crudCartelera';
import { obtenerUrlPortada } from '../../supabase/crudCarteleraImages';
import portadaFondo from '../../assets/portadatt_2.jpg';
import { FaRegImage, FaYoutube, FaTiktok, FaMapMarkerAlt, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';

const Fondo = styled.div`
  width: 100vw;
  height: 100vh;
  background: url(${portadaFondo}) center center/cover no-repeat;
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 0;
  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(20, 20, 40, 0.55);
    z-index: 1;
  }
`;

const Overlay = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  z-index: 2;
  display: flex;
  flex-direction: column;
`;

const EtiquetasContainer = styled.div`
  position: absolute;
  top: 120px;
  left: 0;
  width: 100vw;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 32px;
  z-index: 3;
  @media (max-width: 700px) {
    flex-direction: column;
    align-items: center;
    top: 90px;
    gap: 18px;
  }
`;

const popIn = keyframes`
  0% { transform: scale(0.7); opacity: 0; }
  80% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;

const Etiqueta = styled.div`
  background: rgba(255,255,255,0.92);
  border-radius: 18px;
  box-shadow: 0 4px 24px #0003;
  padding: 32px 36px;
  min-width: 320px;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  animation: ${popIn} 0.7s cubic-bezier(0.4,1.4,0.6,1) both;
  position: relative;
  border-left: 8px solid #3a4b86;
  border-bottom: 3px solid #3a4b86;
  transition: box-shadow 0.2s, transform 0.2s;
  &:hover {
    box-shadow: 0 8px 32px #3a4b86aa;
    transform: translateY(-6px) scale(1.03);
  }
`;

const Titulo = styled.h3`
  color: #3a4b86;
  font-size: 1.4rem;
  font-weight: 800;
  margin-bottom: 10px;
  text-align: center;
`;
const Info = styled.div`
  font-size: 0.93rem;
  color: #222;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;
const Tag = styled.span`
  background: #3a4b86;
  color: #fff;
  border-radius: 8px;
  padding: 2px 10px;
  font-size: 0.95em;
  margin-left: 8px;
  font-weight: 600;
`;
const BtnVerMas = styled.a`
  margin-top: 18px;
  background: linear-gradient(90deg, #3a4b86 0%, #6c5ce7 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 10px 28px;
  font-size: 1.1rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 2px 8px #3a4b86aa;
  transition: background 0.2s, color 0.2s, transform 0.2s;
  display: inline-block;
  &:hover {
    background: linear-gradient(90deg, #6c5ce7 0%, #3a4b86 100%);
    color: #fffbe6;
    transform: scale(1.05);
  }
`;

const Descripcion = styled.p`
  font-size: 1.05rem;
  color: #555;
  margin: 0 0 12px 0;
  text-align: justify;
`;

const IconosAccion = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 10px;
`;
const IconoAccionBtn = styled.button`
  background: #fffbe6;
  border: 2px solid #3a4b86;
  color: #3a4b86;
  border-radius: 50%;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3em;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border 0.2s;
  &:hover {
    background: #3a4b86;
    color: #fff;
    border: 2px solid #3a4b86;
  }
`;

export default function CarteleraPortadaTemplate() {
  const [eventos, setEventos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [modalTipo, setModalTipo] = useState('full'); // 'full', 'imagen', 'video'

  useEffect(() => {
    async function cargarCartelera() {
      const data = await obtenerCartelera();
      // Procesar las portadas para obtener URLs públicas
      const eventosConPortadas = await Promise.all(
        (data || []).map(async (evento) => {
          if (evento.portada) {
            const portadaUrl = await obtenerUrlPortada(evento.portada);
            return { ...evento, portadaUrl };
          }
          return evento;
        })
      );
      setEventos(eventosConPortadas);
    }
    cargarCartelera();
  }, []);

  const handleVerMas = (evento) => {
    setEventoSeleccionado(evento);
    setModalTipo('full');
    setModalOpen(true);
  };

  const handleVerVideo = (evento) => {
    setEventoSeleccionado(evento);
    setModalTipo('video');
    setModalOpen(true);
  };
  const handleCerrarModal = () => {
    setModalOpen(false);
    setEventoSeleccionado(null);
    setModalTipo('full');
  };

  return (
    <>
      <Fondo />
      <Overlay>
        <PublicHeader useWhiteText={true} />
        <EtiquetasContainer>
          {eventos.map((ev, i) => (
            <Etiqueta key={i} style={{animationDelay: `${i*0.15}s`}}>
              {ev.portadaUrl && (
                <div style={{
                  width: '100%',
                  height: '140px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: '16px',
                  backgroundImage: `url(${ev.portadaUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '2px solid #3a4b86'
                }} />
              )}
              <Titulo>{ev.titulo}</Titulo>
              {ev.edicion && (
                <Info><b>Edición:</b> <Tag>{ev.edicion}</Tag></Info>
              )}
              <Info>
                <FaCalendarAlt style={{color:'#3a4b86'}} />
                <b>Fechas:</b> {ev.fechafin_inicio}
              </Info>
              <Info>
                <FaMapMarkerAlt style={{color:'#3a4b86'}} />
                <b>Ubicación:</b> {ev.ciudad_provincia}
              </Info>
              <Info><b>Responsable:</b> <Tag>{ev.responsable}</Tag> {ev.linkresponsable && (<a href={ev.linkresponsable} target="_blank" rel="noopener noreferrer" style={{marginLeft:8, color:'#3a4b86', textDecoration:'underline'}}>Ver perfil</a>)}</Info>
              {ev.googlemap && (
                <Info>
                  <b>Google Maps:</b> 
                  <a 
                    href={ev.googlemap} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{color:'#3a4b86', textDecoration:'underline'}}
                  >
                    Ver ubicación
                  </a>
                </Info>
              )}
              <IconosAccion>
                <IconoAccionBtn title="Información Adicional de Cartelera" onClick={() => handleVerMas(ev)}>
                  <FaInfoCircle />
                </IconoAccionBtn>
              </IconosAccion>
            </Etiqueta>
          ))}
        </EtiquetasContainer>
        <CarteleraDetalleModal open={modalOpen} onClose={handleCerrarModal} evento={eventoSeleccionado} tipo={modalTipo} />
      </Overlay>
    </>
  );
} 