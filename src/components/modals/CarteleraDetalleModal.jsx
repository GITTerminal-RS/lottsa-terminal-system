import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaTimes, FaChevronLeft, FaChevronRight, FaYoutube, FaPhotoVideo, FaInfoCircle, FaImage, FaListAlt } from 'react-icons/fa';
import { obtenerInfoCartelera } from '../../supabase/crudInfoCartelera';

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.65);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.3s;
`;
const ModalBox = styled.div`
  background: linear-gradient(135deg, #fffbe6 0%, #f8f9fa 100%);
  border-radius: 22px;
  box-shadow: 0 12px 48px #0007;
  padding: 38px 28px 28px 28px;
  max-width: 90vw;
  max-height: 90vh;
  width: 90vw;
  height: auto;
  min-height: 70vh;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  animation: ${fadeIn} 0.4s;
  border: 3px solid #3a4b86;
  overflow: auto;
  @media (max-width: 900px) {
    max-width: 98vw;
    width: 98vw;
    min-height: 60vh;
    max-height: 98vh;
    padding: 18px 4px 18px 4px;
    border-radius: 12px;
  }
`;
const CloseBtn = styled.button`
  position: absolute;
  top: 14px;
  right: 18px;
  background: #3a4b86;
  border: none;
  color: #fff;
  font-size: 1.7em;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 8px #3a4b86aa;
  transition: background 0.2s, color 0.2s;
  &:hover { background: #3a4b86; color: #FFD700; }
`;
const Titulo = styled.h2`
  color: #3a4b86;
  font-size: 1.35rem;
  font-weight: 800;
  margin-bottom: 10px;
  text-align: center;
  width: 100%;
`;
const Descripcion = styled.p`
  font-size: 1.08rem;
  color: #444;
  margin: 0 0 14px 0;
  text-align: justify;
`;

const Galeria = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 18px 0 16px 0;
  justify-content: center;
`;
const FotoBox = styled.div`
  position: relative;
  width: 100%;
  max-width: 360px;
  min-width: 220px;
  height: 400px;
  margin: 0 auto 10px auto;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px #3a4b86aa;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const Foto = styled.img`
  width: 100%;
  max-width: 360px;
  min-width: 220px;
  height: auto;
  max-height: 400px;
  object-fit: contain;
  border-radius: 12px;
  background: #fff;
  display: block;
  margin: 0 auto;
`;
const Flecha = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(252,96,39,0.85);
  border: none;
  color: #fff;
  font-size: 1.3em;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  z-index: 2;
  transition: background 0.2s;
  &:hover { background: #3a4b86; }
  &.left { left: 8px; }
  &.right { right: 8px; }
`;
const Miniaturas = styled.div`
  display: flex;
  gap: 6px;
  justify-content: center;
  margin-top: 4px;
`;
const Miniatura = styled.img`
  width: 38px;
  height: 28px;
  object-fit: cover;
  border-radius: 5px;
  border: 2px solid ${({ activo }) => activo ? '#3a4b86' : '#fffbe6'};
  cursor: pointer;
  box-shadow: 0 1px 4px #0002;
  transition: border 0.2s;
`;
const VideoBox = styled.div`
  width: 100%;
  margin: 12px 0 18px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const VideoEmbed = styled.div`
  width: 100%;
  max-width: 480px;
  min-width: 260px;
  aspect-ratio: 16/9;
  background: #000;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const VideoThumb = styled.button`
  width: 48px;
  height: 36px;
  background: #fffbe6;
  border: 2px solid ${({ activo }) => activo ? '#3a4b86' : '#fffbe6'};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border 0.2s;
  font-size: 1.2em;
  color: #3a4b86;
  &:hover { border: 2px solid #3a4b86; color: #3a4b86; }
`;

const ContenidoDobleColumna = styled.div`
  display: flex;
  flex-direction: row;
  gap: 32px;
  width: 100%;
  justify-content: center;
  align-items: center;
  @media (max-width: 900px) {
    flex-direction: column;
    gap: 18px;
    align-items: center;
  }
`;
const Columna = styled.div`
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// Styled components para el carrusel de información adicional
const InfoCarouselContainer = styled.div`
  width: 100%;
  margin: 20px 0;
  border: 2px solid #3a4b86;
  border-radius: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  overflow: hidden;
`;

const InfoCarouselTabs = styled.div`
  display: flex;
  background: #3a4b86;
`;

const InfoCarouselTab = styled.button`
  flex: 1;
  padding: 12px 16px;
  background: ${props => props.active ? '#3a4b86' : 'transparent'};
  color: white;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    background: ${props => props.active ? '#3a4b86' : 'rgba(58, 75, 134, 0.3)'};
  }
  
  @media (max-width: 768px) {
    padding: 10px 8px;
    font-size: 0.8rem;
    gap: 4px;
  }
`;

const InfoCarouselContent = styled.div`
  padding: 20px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const InfoSection = styled.div`
  display: ${props => props.active ? 'block' : 'none'};
`;

const InfoSectionTitle = styled.h3`
  color: #3a4b86;
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 15px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const InfoSectionImage = styled.div`
  width: 100%;
  max-width: 300px;
  height: 150px;
  margin: 0 auto 15px;
  border-radius: 10px;
  background-image: url(${props => props.imageUrl});
  background-size: cover;
  background-position: center;
  border: 2px solid #3a4b86;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${props => !props.imageUrl && `
    color: #666;
    font-size: 0.9rem;
    text-align: center;
  `}
`;

const InfoSectionDescription = styled.p`
  color: #444;
  font-size: 1rem;
  line-height: 1.6;
  text-align: justify;
  margin: 0;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${props => !props.hasContent && `
    color: #999;
    font-style: italic;
    text-align: center;
  `}
`;

export default function CarteleraDetalleModal({ open, onClose, evento, tipo = 'full' }) {
  const [fotoIdx, setFotoIdx] = useState(0);
  const [videoIdx, setVideoIdx] = useState(0);
  const [activeInfoTab, setActiveInfoTab] = useState(0);
  const [infoCarteleraData, setInfoCarteleraData] = useState([]);
  const [loadingInfo, setLoadingInfo] = useState(false);
  
  useEffect(() => { 
    setFotoIdx(0); 
    setVideoIdx(0); 
    setActiveInfoTab(0);
  }, [evento]);

  // Cargar información adicional de cartelera
  useEffect(() => {
    async function cargarInfoCartelera() {
      if (evento && evento.id && tipo === 'full') {
        setLoadingInfo(true);
        try {
          const infoData = await obtenerInfoCartelera(evento.id);
          setInfoCarteleraData(infoData || []);
        } catch (error) {
          console.error('Error al cargar información de cartelera:', error);
          setInfoCarteleraData([]);
        } finally {
          setLoadingInfo(false);
        }
      }
    }
    cargarInfoCartelera();
  }, [evento, tipo]);

  // Inyectar el script de TikTok si hay algún blockquote en los videos
  useEffect(() => {
    if (!evento) return;
    const videos = Array.isArray(evento.linkvideos) ? evento.linkvideos : (evento.linkvideos ? evento.linkvideos.split(',') : []);
    if (videos.some(v => v && v.trim().startsWith('<blockquote'))) {
      if (!document.querySelector('script[src="https://www.tiktok.com/embed.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://www.tiktok.com/embed.js';
        script.async = true;
        document.body.appendChild(script);
      } else {
        if (window.tiktokEmbedLoad) window.tiktokEmbedLoad();
      }
    }
  }, [evento]);

  if (!open || !evento) return null;
  const fotos = Array.isArray(evento.linksfotos) ? evento.linksfotos : (evento.linksfotos ? evento.linksfotos.split(',') : []);
  const videos = Array.isArray(evento.linkvideos) ? evento.linkvideos : (evento.linkvideos ? evento.linkvideos.split(',') : []);

  // Detectar si el video es TikTok para expandir el modal
  const isTikTok = tipo === 'video' && videos[videoIdx] && String(videos[videoIdx]).includes('tiktok');

  // Estilos dinámicos para el modal
  const modalBoxStyle = isTikTok
    ? { maxWidth: '600px', maxHeight: '98vh', width: '98vw', height: 'auto', minHeight: '60vh', padding: 0, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }
    : undefined;

  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={e => e.stopPropagation()} style={modalBoxStyle}>
        <CloseBtn onClick={onClose}><FaTimes /></CloseBtn>
        {tipo === 'imagen' && evento.portadaUrl && (
          <Galeria style={{width:'100%',height:'100%',justifyContent:'center',alignItems:'center'}}>
            <FotoBox style={{maxWidth: '90vw', maxHeight: '90vh', height: 'auto', minWidth:220, minHeight:220, boxShadow:'0 2px 24px #0004'}}>
              <Foto src={evento.portadaUrl} alt="portada cartelera" style={{maxWidth:'90vw',maxHeight:'80vh',margin:'0 auto'}} />
            </FotoBox>
          </Galeria>
        )}
        {tipo === 'video' && videos.length > 0 && (
          <VideoBox style={{width:'100%',height:'100%',justifyContent:'center',alignItems:'center'}}>
            <VideoEmbed style={isTikTok ? {width:360,minWidth:325,maxWidth:360,height:600,background:'#fff'} : {}}>
              {renderVideo(videos[videoIdx])}
            </VideoEmbed>
          </VideoBox>
        )}
        {tipo === 'full' && (
          <div style={{width: '100%', padding: '20px'}}>
            <Titulo>{evento.titulo}</Titulo>
            
            {evento.portadaUrl && (
              <div style={{
                width: '100%',
                maxWidth: '400px',
                height: '200px',
                borderRadius: '12px',
                overflow: 'hidden',
                margin: '20px auto',
                backgroundImage: `url(${evento.portadaUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '3px solid #3a4b86'
              }} />
            )}
            


            {/* Carrusel de Información Adicional */}
            <InfoCarouselContainer>
              <InfoCarouselTabs>
                <InfoCarouselTab 
                  active={activeInfoTab === 0} 
                  onClick={() => setActiveInfoTab(0)}
                >
                  <FaInfoCircle />
                  Información General
                </InfoCarouselTab>
                <InfoCarouselTab 
                  active={activeInfoTab === 1} 
                  onClick={() => setActiveInfoTab(1)}
                >
                  <FaListAlt />
                  Detalles del Evento
                </InfoCarouselTab>
                <InfoCarouselTab 
                  active={activeInfoTab === 2} 
                  onClick={() => setActiveInfoTab(2)}
                >
                  <FaImage />
                  Contenido Extra
                </InfoCarouselTab>
              </InfoCarouselTabs>
              
              <InfoCarouselContent>
                {loadingInfo ? (
                  <div style={{textAlign: 'center', color: '#666', padding: '40px 0'}}>
                    Cargando información adicional...
                  </div>
                ) : (
                  <>
                    <InfoSection active={activeInfoTab === 0}>
                      <InfoSectionTitle>
                        <FaInfoCircle />
                        Información General
                      </InfoSectionTitle>
                      {infoCarteleraData[0]?.imagen && (
                        <InfoSectionImage imageUrl={infoCarteleraData[0].imagen} />
                      )}
                      {!infoCarteleraData[0]?.imagen && (
                        <InfoSectionImage>
                          Sin imagen disponible
                        </InfoSectionImage>
                      )}
                      <InfoSectionDescription hasContent={!!infoCarteleraData[0]?.descripcion}>
                        {infoCarteleraData[0]?.descripcion || 'No hay información general disponible para este evento.'}
                      </InfoSectionDescription>
                    </InfoSection>

                    <InfoSection active={activeInfoTab === 1}>
                      <InfoSectionTitle>
                        <FaListAlt />
                        Detalles del Evento
                      </InfoSectionTitle>
                      {infoCarteleraData[1]?.imagen && (
                        <InfoSectionImage imageUrl={infoCarteleraData[1].imagen} />
                      )}
                      {!infoCarteleraData[1]?.imagen && (
                        <InfoSectionImage>
                          Sin imagen disponible
                        </InfoSectionImage>
                      )}
                      <InfoSectionDescription hasContent={!!infoCarteleraData[1]?.descripcion}>
                        {infoCarteleraData[1]?.descripcion || 'No hay detalles del evento disponibles.'}
                      </InfoSectionDescription>
                    </InfoSection>

                    <InfoSection active={activeInfoTab === 2}>
                      <InfoSectionTitle>
                        <FaImage />
                        Contenido Extra
                      </InfoSectionTitle>
                      {infoCarteleraData[2]?.imagen && (
                        <InfoSectionImage imageUrl={infoCarteleraData[2].imagen} />
                      )}
                      {!infoCarteleraData[2]?.imagen && (
                        <InfoSectionImage>
                          Sin imagen disponible
                        </InfoSectionImage>
                      )}
                      <InfoSectionDescription hasContent={!!infoCarteleraData[2]?.descripcion}>
                        {infoCarteleraData[2]?.descripcion || 'No hay contenido extra disponible.'}
                      </InfoSectionDescription>
                    </InfoSection>
                  </>
                )}
              </InfoCarouselContent>
            </InfoCarouselContainer>
          </div>
        )}
      </ModalBox>
    </Overlay>
  );
}

function getEmbedUrl(url) {
  if (!url) return '';
  // YouTube
  const ytMatch = url.match(/(?:youtu.be\/|youtube.com\/(?:watch\?v=|embed\/|v\/|shorts\/)?)([\w-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // TikTok
  const tkMatch = url.match(/tiktok.com\/(?:@\w+\/video\/|v\/)?(\d+)/);
  if (tkMatch) return `https://www.tiktok.com/embed/v2/${tkMatch[1]}`;
  // Default: return as is
  return url;
}

function renderVideo(videoStr) {
  if (!videoStr) return null;
  // Si es un blockquote de TikTok
  if (videoStr.trim().startsWith('<blockquote')) {
    // Eliminar script anterior si existe
    const oldScript = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
    if (oldScript) oldScript.remove();
    // Agregar script de TikTok
    setTimeout(() => {
      const script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
    }, 0);
    // Renderizar el blockquote con tamaño recomendado y centrado
    return (
      <div
        style={{
          width: 360,
          minWidth: 325,
          maxWidth: 360,
          height: 600,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
          border: '1.5px solid #e0e0e0',
          borderRadius: 12,
          padding: 0,
        }}
        dangerouslySetInnerHTML={{ __html: videoStr }}
      />
    );
  }
  // Si es un iframe, renderizar normal
  if (videoStr.trim().startsWith('<iframe')) {
    return (
      <div
        style={{ width: 360, minWidth: 325, maxWidth: 480, height: 360, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1.5px solid #e0e0e0', borderRadius: 12, padding: 0 }}
        dangerouslySetInnerHTML={{ __html: videoStr }}
      />
    );
  }
  // Si es un link, usar el método de embed
  return (
    <iframe
      width="360"
      height="360"
      src={getEmbedUrl(videoStr)}
      title="video"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
      style={{ width: 360, height: 360, background: '#fff', border: '1.5px solid #e0e0e0', borderRadius: 12, display: 'block', margin: '0 auto' }}
    />
  );
} 