import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaTimes, FaImage, FaBell } from 'react-icons/fa';
import { keyframes, css } from 'styled-components';

const NoticiasOverlay = styled.div`
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

const bellRing = keyframes`
  0% { transform: rotate(0deg); }
  10% { transform: rotate(-15deg); }
  20% { transform: rotate(10deg); }
  30% { transform: rotate(-10deg); }
  40% { transform: rotate(6deg); }
  50% { transform: rotate(-4deg); }
  60% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
`;

const bellPulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const bellGlow = keyframes`
  0% { box-shadow: 0 2px 8px rgba(58,75,134,0.13), 0 0 0 0 rgba(255,215,0,0.7); }
  70% { box-shadow: 0 2px 8px rgba(58,75,134,0.13), 0 0 0 10px rgba(255,215,0,0); }
  100% { box-shadow: 0 2px 8px rgba(58,75,134,0.13), 0 0 0 0 rgba(255,215,0,0); }
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
    right: 6rem;
    z-index: 101;
    padding: 0.6rem;
    backdrop-filter: blur(5px);
    transition: all 0.3s ease;
    ${({ hasNoticias }) => hasNoticias && css`
      animation: ${bellPulse} 2s infinite, ${bellGlow} 2s infinite;
    `}
    &:hover {
      background: #f3f3f3;
      transform: scale(1.1);
    }
    svg {
      animation: ${bellRing} 2s infinite;
    }
  }
`;

const IndicadorNotificaciones = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background: #FFD700;
  border-radius: 50%;
  border: 1px solid #fff;
  animation: pulse 2s infinite;
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
`;

const NoticiasModalBox = styled.div`
  background: linear-gradient(135deg, #232526 0%, #FFD700 100%);
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

const CloseBtn = styled.button`
  position: absolute;
  top: 10px;
  right: 12px;
  background: none;
  border: none;
  color: #fff;
  font-size: 1.2em;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
  &:hover { opacity: 1; }
`;

const NoticiasTitulo = styled.h3`
  margin: 0 0 3px 0;
  font-size: 1em;
  font-weight: 800;
  color: #FFD700;
  text-align: center;
  text-shadow: 0 1px 4px #000a;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  svg {
    animation: ${bellRing} 1.5s infinite;
    font-size: 1em;
    color: #fffbe6;
    filter: drop-shadow(0 0 2px #FFD700);
  }
`;

const Separador = styled.div`
  width: 45%;
  height: 2px;
  background: linear-gradient(90deg, #FFD700 0%, #fffbe6 100%);
  border-radius: 1px;
  margin: 0 auto 5px auto;
`;

const NoticiasContenido = styled.div`
  font-size: 0.75em;
  color: #f3f3f3;
  line-height: 1.3;
  max-height: 60px;
  min-height: 40px;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: justify;
  background: rgba(0,0,0,0.10);
  border-radius: 6px;
  padding: 5px 6px;
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
  width: ${8000/80}%;
  animation: progresoAnim 8s linear infinite;
  @keyframes progresoAnim {
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

const LinkFoto = styled.a`
  color: #fff;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.6em;
  text-align: left;
  margin-top: 2px;
  transition: color 0.2s, text-shadow 0.2s;
  &:hover {
    color: #FFD700;
    text-shadow: 0 0 4px #FFD700;
  }
`;

const BtnVerMas = styled.a`
  display: inline-block;
  margin: 6px auto 0 auto;
  padding: 4px 12px;
  background: linear-gradient(90deg, #FFD700 0%, #fffbe6 100%);
  color: #232526;
  font-weight: bold;
  border-radius: 14px;
  text-decoration: none;
  font-size: 0.7em;
  box-shadow: 0 1px 4px #FFD70044;
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: #fffbe6;
    color: #FFD700;
  }
`;

const PreviewOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const PreviewBox = styled.div`
  background: #232526;
  border-radius: 12px;
  box-shadow: 0 4px 24px #000a;
  padding: 18px 18px 12px 18px;
  position: relative;
  max-width: 90vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const PreviewImg = styled.img`
  max-width: 352px;
  max-height: 66vh;
  border-radius: 8px;
  box-shadow: 0 2px 8px #FFD70055;
  background: #fff;
`;
const ClosePreviewBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 10px;
  background: none;
  border: none;
  color: #FFD700;
  font-size: 1.3em;
  cursor: pointer;
  z-index: 10;
  transition: color 0.2s;
  &:hover { color: #fffbe6; }
`;

export default function NoticiasModal({ open, noticias }) {
  // Solo usar noticias reales, sin datos de prueba
  const noticiasArray = Array.isArray(noticias) ? noticias : [];
  const [indice, setIndice] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showOnMobile, setShowOnMobile] = useState(false);

  useEffect(() => {
    if (!open || noticiasArray.length === 0) return;
    const interval = setInterval(() => {
      setIndice((prev) => (prev + 1) % noticiasArray.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [open, noticiasArray.length]);

  // Reiniciar a la primera noticia si cambia el array
  useEffect(() => {
    setIndice(0);
  }, [noticiasArray.length]);

  // No mostrar nada si no hay noticias reales
  if (!open || noticiasArray.length === 0) return null;
  
  const noticiaActual = noticiasArray[indice];
  return (
    <NoticiasOverlay>
      <IconoFlotante onClick={() => setShowOnMobile(!showOnMobile)} hasNoticias={noticias && noticias.length > 0}>
        <FaBell />
        {noticias && noticias.length > 0 && <IndicadorNotificaciones />}
      </IconoFlotante>
      <NoticiasModalBox showOnMobile={showOnMobile}>
        <CloseMobileBtn onClick={() => setShowOnMobile(false)}>
          <FaTimes />
        </CloseMobileBtn>
        <NoticiasTitulo><FaBell />Boletín del Viajero</NoticiasTitulo>
        <Separador />
        <NoticiasContenido>
          {noticiaActual.contexto || noticiaActual.contenido}
        </NoticiasContenido>
        <BarraProgreso>
          <Progreso key={indice} />
        </BarraProgreso>
        {noticiaActual.linkfoto && (
          <>
            <LinkFoto
              href={noticiaActual.linkfoto}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => { e.preventDefault(); setPreviewOpen(true); }}
            >
              <FaImage style={{fontSize: '1.2em'}} />
              Haz clic para ver la imagen
            </LinkFoto>
            {previewOpen && (
              <PreviewOverlay onClick={()=>setPreviewOpen(false)}>
                <PreviewBox onClick={e=>e.stopPropagation()}>
                  <ClosePreviewBtn onClick={()=>setPreviewOpen(false)}><FaTimes /></ClosePreviewBtn>
                  <PreviewImg src={noticiaActual.linkfoto} alt="Previsualización" />
                </PreviewBox>
              </PreviewOverlay>
            )}
          </>
        )}
        {noticiaActual.linknoticia && (
          <BtnVerMas href={noticiaActual.linknoticia} target="_blank" rel="noopener noreferrer">
            Ver más
          </BtnVerMas>
        )}
        <Indicadores>
          {noticiasArray.map((_, i) => (
            <Punto key={i} activo={i === indice} />
          ))}
        </Indicadores>
      </NoticiasModalBox>
    </NoticiasOverlay>
  );
}