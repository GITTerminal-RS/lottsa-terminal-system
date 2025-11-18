import styled, { keyframes, css } from 'styled-components';
import { useState, useRef, useEffect } from 'react';
import { FaWhatsapp, FaBus, FaMapMarkerAlt, FaRoute } from 'react-icons/fa';
import { MdAccessTime } from 'react-icons/md';

export default function Viajaya({ viajaYa, loadingViajaYa, onClose }) {
  const [viajaYaIdx, setViajaYaIdx] = useState(0);
  const viajaYaInterval = useRef(null);
  const [showOnMobile, setShowOnMobile] = useState(false);

  // Función para mejorar la presentación de los puntos de la ruta
  function formatRutaPuntos(descripcionRuta) {
    if (!descripcionRuta) return '';
    
    // Separar los puntos por "-"
    const puntos = descripcionRuta.split('-').map(punto => punto.trim()).filter(punto => punto);
    
    if (puntos.length <= 3) {
      // Si hay 3 o menos puntos, mostrar todos
      return puntos.join(' - ');
    }
    
    // Si hay más de 3 puntos, mostrar primero, medio y último
    const primerPunto = puntos[0];
    const ultimoPunto = puntos[puntos.length - 1];
    const puntoMedio = puntos[Math.floor(puntos.length / 2)];
    
    // Si el punto medio es igual al primero o último, no duplicar
    if (puntoMedio === primerPunto || puntoMedio === ultimoPunto) {
      return `${primerPunto} - ${ultimoPunto}`;
    }
    
    return `${primerPunto} - ${puntoMedio} - ${ultimoPunto}`;
  }

  useEffect(() => {
    if (!viajaYa || viajaYa.length === 0) return;
    if (viajaYaInterval.current) clearInterval(viajaYaInterval.current);
    viajaYaInterval.current = setInterval(() => {
      setViajaYaIdx(prev => (prev + 1) % viajaYa.length);
    }, 15000);
    return () => clearInterval(viajaYaInterval.current);
  }, [viajaYa.length]);

  useEffect(() => {
    setViajaYaIdx(0);
  }, [viajaYa.length]);

  const whatsappMove = keyframes`
    0% { transform: translateX(0); }
    20% { transform: translateX(-4px); }
    40% { transform: translateX(4px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
    100% { transform: translateX(0); }
  `;
  
  const MovingWhatsapp = styled(FaWhatsapp)`
    color: #25D366;
    font-size: 1.2em;
    margin-right: 6px;
    animation: ${whatsappMove} 1.5s infinite linear;
  `;

  const ViajayaOverlay = styled.div`
    position: relative;
    width: auto;
    height: auto;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    z-index: 2000;
    pointer-events: auto;
    @media (max-width: 768px) {
      position: fixed;
      top: 20px;
      right: 20px;
      width: auto;
      height: auto;
    }
  `;

  const busPulse = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  `;

  const busGlow = keyframes`
    0% { box-shadow: 0 2px 8px rgba(58,75,134,0.13), 0 0 0 0 rgba(0,123,255,0.7); }
    70% { box-shadow: 0 2px 8px rgba(58,75,134,0.13), 0 0 0 10px rgba(0,123,255,0); }
    100% { box-shadow: 0 2px 8px rgba(58,75,134,0.13), 0 0 0 0 rgba(0,123,255,0); }
  `;

  const IconoFlotante = styled.button`
    display: none;
    @media (max-width: 768px) {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: #fff;
      border: none;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(58,75,134,0.13);
      color: #222;
      font-size: 1.2rem;
      cursor: pointer;
      position: fixed;
      top: 2rem;
      right: 8.5rem;
      z-index: 101;
      padding: 0.6rem;
      backdrop-filter: blur(5px);
      transition: all 0.3s ease;
      ${({ hasHorarios }) => hasHorarios && css`
        animation: ${busPulse} 2s infinite, ${busGlow} 2s infinite;
      `}
      &:hover {
        background: #f3f3f3;
        transform: scale(1.1);
      }
    }
  `;

  const IndicadorHorarios = styled.div`
    position: absolute;
    top: 6px;
    right: 6px;
    width: 8px;
    height: 8px;
    background: #007BFF;
    border-radius: 50%;
    border: 1px solid #fff;
    animation: pulse 2s infinite;
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
  `;

  const CloseMobileBtn = styled.button`
    display: none;
    @media (max-width: 768px) {
      display: block;
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      color: #FFD700;
      font-size: 1.2em;
      cursor: pointer;
      z-index: 10;
      transition: color 0.2s;
      &:hover { color: #fffbe6; }
    }
  `;

  const ViajayaBox = styled.div`
    background: linear-gradient(135deg, #232526 0%, #007BFF 100%);
    color: #fff;
    border-radius: 16px;
    box-shadow: 0 6px 18px rgba(0,0,0,0.22);
    width: 260px;
    max-width: 90vw;
    min-height: 120px;
    max-height: 260px;
    margin: 0;
    padding: 14px 10px 10px 10px;
    z-index: 1200;
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    position: relative;
    @media (max-width: 768px) {
      display: ${({ showOnMobile }) => showOnMobile ? 'flex' : 'none'};
      width: 280px;
      max-width: calc(100vw - 40px);
      margin: 0;
      position: fixed;
      top: 80px;
      right: 20px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    }
  `;

  const ViajayaTitle = styled.h2`
    margin: 0 0 3px 0;
    font-size: 1.1em;
    font-weight: 800;
    color: #FFD700;
    text-align: center;
    text-shadow: 0 1px 4px #000a;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    letter-spacing: 1px;
  `;

  const ViajayaSeparador = styled.div`
    width: 45%;
    height: 2px;
    background: linear-gradient(90deg, #FFD700 0%, #fffbe6 100%);
    border-radius: 1px;
    margin: 0 auto 8px auto;
  `;

  const ViajayaContent = styled.div`
    font-size: 0.82em;
    margin-bottom: 8px;
  `;

  const ViajayaCard = styled.div`
    background: rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 5px 4px;
    margin-bottom: 10px;
    box-shadow: 0 2px 8px #007bff22;
    font-size: 0.82em;
    transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
    word-break: break-word;
    white-space: pre-line;
    &:hover {
      background: #007BFF22;
      box-shadow: 0 4px 16px #007bff44;
      transform: scale(1.03);
    }
  `;

  const BarraProgreso = styled.div`
    width: 100%;
    height: 2px;
    background: rgba(255,255,255,0.18);
    border-radius: 1px;
    margin: 6px 0 0 0;
    overflow: hidden;
  `;

  const Progreso = styled.div`
    height: 100%;
    background: linear-gradient(90deg, #FFD700 0%, #fffbe6 100%);
    width: 100%;
    animation: progresoAnimViajaya 15s linear infinite;
    @keyframes progresoAnimViajaya {
      from { width: 0; }
      to { width: 100%; }
    }
  `;

  const Indicadores = styled.div`
    display: flex;
    justify-content: center;
    gap: 5px;
    margin-top: 6px;
  `;

  const Punto = styled.span`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ activo }) => (activo ? '#FFD700' : '#fffbe6')};
    border: 1px solid #FFD700;
    box-shadow: ${({ activo }) => (activo ? '0 0 4px #FFD700' : 'none')};
    display: inline-block;
    transition: background 0.3s, box-shadow 0.3s;
  `;



  return (
    <ViajayaOverlay>
      <IconoFlotante onClick={() => setShowOnMobile(!showOnMobile)} hasHorarios={viajaYa && viajaYa.length > 0}>
        <FaBus />
        {viajaYa && viajaYa.length > 0 && <IndicadorHorarios />}
      </IconoFlotante>
      <ViajayaBox showOnMobile={showOnMobile}>
        <CloseMobileBtn onClick={() => setShowOnMobile(false)}>
          ×
        </CloseMobileBtn>
        <ViajayaTitle><MovingWhatsapp />¡Viajá ya!</ViajayaTitle>
        <ViajayaSeparador />
        <ViajayaContent>
          {loadingViajaYa ? (
            <p style={{marginBottom:0}}>Cargando destinos especiales...</p>
          ) : viajaYa && viajaYa.length > 0 ? (
            <>
              <div style={{fontSize:'0.93em', color:'#fff', marginBottom:10, fontWeight:500, textAlign:'justify', lineHeight:'1.4'}}>
                ¡Tu turno en un clic!, Sin filas, sin demoras… ¡pídelo al instante!.
              </div>
              <a
                href={`https://wa.me/${viajaYa[viajaYaIdx].telefono_operadora?.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
                  `¡Hola! Quiero comprar un boleto a:\n` +
                  `Destino: ${viajaYa[viajaYaIdx].descripcion_destino}\n` +
                  `Horario: ${viajaYa[viajaYaIdx].descripcion_horario}\n` +
                  `Ruta: ${formatRutaPuntos(viajaYa[viajaYaIdx].descripcion_ruta)}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                title="Contactar por WhatsApp"
              >
                <ViajayaCard
                  key={viajaYaIdx}
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                >
                  <span style={{fontWeight:700, fontSize:'1.08em', color:'#fff', display:'flex', alignItems:'center', gap:12, justifyContent:'space-between'}}>
                    <span style={{display:'flex', alignItems:'center', gap:6}}>
                      <FaMapMarkerAlt style={{fontSize:'1.1em', color:'#FFD700'}} title="Destino" /> {viajaYa[viajaYaIdx].descripcion_destino}
                    </span>
                    <span style={{display:'flex', alignItems:'center', gap:6}}>
                      <MdAccessTime style={{fontSize:'1.1em', color:'#FFD700'}} title="Horario" /> <b>{viajaYa[viajaYaIdx].descripcion_horario}</b>
                    </span>
                  </span>
                  <div style={{fontSize:'0.98em', color:'#fffbe6', marginBottom:2, display:'flex', alignItems:'center', gap:6}}>
                    <FaBus style={{fontSize:'1.1em', color:'#FFD700'}} title="Operadora" /> <b>{viajaYa[viajaYaIdx].nombre_operadora}</b>
                  </div>
                  <div style={{fontSize:'0.98em', color:'#fffbe6', marginBottom:2, display:'flex', alignItems:'center', gap:6}}>
                    <FaRoute style={{fontSize:'1.1em', color:'#FFD700'}} title="Ruta" /> <b>{formatRutaPuntos(viajaYa[viajaYaIdx].descripcion_ruta)}</b>
                  </div>
                </ViajayaCard>
              </a>
              <BarraProgreso>
                <Progreso key={viajaYaIdx} />
              </BarraProgreso>
              <Indicadores>
                {viajaYa.map((_, i) => (
                  <Punto key={i} activo={i === viajaYaIdx} onClick={() => setViajaYaIdx(i)} />
                ))}
              </Indicadores>
            </>
          ) : (
            <p style={{marginBottom:0}}>No hay destinos especiales disponibles en este momento.</p>
          )}
        </ViajayaContent>
      </ViajayaBox>
    </ViajayaOverlay>
  );
} 