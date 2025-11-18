import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaHeart, FaPlay, FaClock, FaEllipsisH } from 'react-icons/fa';
import { supabase } from '../../index';
import toast from 'react-hot-toast';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.bg};
  border-radius: 15px;
  max-width: 90vw;
  max-height: 90vh;
  width: 100%;
  overflow: hidden;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: center;
  @media (max-width: 800px) {
    flex-direction: column;
    max-width: 100vw;
    max-height: 100vh;
    height: 100vh;
    border-radius: 0;
  }
`;

const VideoBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  flex: 1;
  height: 90vh;
  max-height: 100vh;
  border-radius: 18px 0 0 18px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  position: relative;
  @media (max-width: 900px) {
    border-radius: 0;
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
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
  /* Asegurar que los controles del video sean visibles en escritorio */
  @media (min-width: 901px) {
    max-height: calc(100vh - 60px); /* Dejar espacio para controles */
  }
  @media (max-width: 900px) {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const NoVideoMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background: #000;
  color: white;
  text-align: center;
  padding: 20px;
  
  .icon {
    font-size: 4rem;
    margin-bottom: 20px;
    opacity: 0.7;
  }
  
  .title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 10px;
    color: #fc6027;
  }
  
  .message {
    font-size: 1rem;
    opacity: 0.8;
    max-width: 300px;
    line-height: 1.4;
  }
  
  @media (max-width: 900px) {
    .icon {
      font-size: 3rem;
      margin-bottom: 15px;
    }
    
    .title {
      font-size: 1.3rem;
    }
    
    .message {
      font-size: 0.9rem;
  }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  color: #333;
  font-size: 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: scale(1.1);
  }
`;

const DestinoInfo = styled.div`
  position: absolute;
  top: 70px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 15px;
  border-radius: 10px;
  z-index: 10;
  max-width: 250px;
  word-wrap: break-word;
  
  .destino-nombre {
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 5px;
  }
  
  .ubicacion {
    font-size: 0.9rem;
    opacity: 0.9;
  }
`;

const LikeButtonBottom = styled.button`
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  color: ${props => props.isLiked ? '#e74c3c' : '#fc6027'};
  font-size: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: translateY(-50%) scale(1.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LikesCount = styled.div`
  position: absolute;
  top: calc(50% + 40px);
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 20px;
  padding: 5px 10px;
  font-size: 0.9rem;
  font-weight: 600;
  z-index: 10;
`;

const InfoTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin-bottom: 10px;
`;

const InfoOperadora = styled.div`
  font-size: 1.1rem;
  color: #3a4b86;
  font-weight: 600;
  margin-bottom: 10px;
`;

const InfoRuta = styled.div`
  font-size: 1.1rem;
  color: #222;
  margin-bottom: 8px;
`;

const InfoPrecio = styled.div`
  font-size: 1.1rem;
  color: #222;
  margin-bottom: 8px;
`;

const HorariosList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 12px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const HorarioItem = styled.li`
  font-size: 1rem;
  color: #444;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  border-radius: 0 0 15px 15px;
  overflow: hidden;
  margin: 0 auto;
  @media (max-width: 800px) {
    border-radius: 0;
    width: 100vw;
    min-height: 220px;
    height: 60vh;
    max-height: 70vh;
  }
  video {
    width: 100%;
    max-width: 100%;
    height: 72vh;
    max-height: 72vh;
    object-fit: contain;
    background: #000;
    border-radius: 0 0 15px 15px;
    display: block;
    margin: 0 auto;
    @media (max-width: 800px) {
      width: 100vw;
      height: 60vh;
      max-height: 70vh;
      object-fit: contain;
      border-radius: 0;
    }
  }

  .video-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 16px;
    gap: 10px;
    width: 100%;
    height: 60vh;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid ${({ theme }) => theme.bg2};
  position: relative;
  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: ${({ theme }) => theme.text};
  }
  @media (max-width: 800px) {
    padding: 16px 10px 10px 10px;
  }
`;

const MobileHeaderBtns = styled.div`
  display: none;
  @media (max-width: 800px) {
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1003;
  }
`;

const ModalBody = styled.div`
  padding: 25px;
`;

const DestinationInfo = styled.div`
  margin-bottom: 20px;

  .destination-title {
    font-size: 18px;
    font-weight: 600;
    color: ${({ theme }) => theme.text};
    margin-bottom: 8px;
  }

  .destination-details {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    font-size: 14px;
    color: ${({ theme }) => theme.text};
    opacity: 0.8;

    .detail-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }
  }
`;

const LikeButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: ${({ isLiked }) => (isLiked ? '#e74c3c' : '#666')};
  transition: all 0.2s ease;
  padding: 5px;
  border-radius: 50%;

  &:hover {
    transform: scale(1.1);
    color: #e74c3c;
  }
`;

const LikesSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 10px;
  margin-top: 15px;

  .likes-count {
    font-size: 16px;
    font-weight: 600;
    color: ${({ theme }) => theme.text};
  }

  .likes-text {
    font-size: 14px;
    color: ${({ theme }) => theme.text};
    opacity: 0.8;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: ${({ theme }) => theme.text};

  .spinner {
    border: 3px solid ${({ theme }) => theme.bg2};
    border-top: 3px solid #fc6027;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const RutaCard = styled.div`
  background: ${({ theme }) => theme.bg2};
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 18px;
  box-shadow: 0 2px 8px rgba(58,75,134,0.07);
`;

const VerMasBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: none;
  border-radius: 50%;
  width: 38px;
  height: 38px;
  font-size: 1.3rem;
  color: #3a4b86;
  box-shadow: 0 2px 8px rgba(58,75,134,0.13);
  cursor: pointer;
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1002;
  @media (min-width: 801px) { display: none; }
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  outline: none;
  box-shadow: none;
  color: #3a4b86;
  font-size: 1.5rem;
  padding: 0;
  margin: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  &:hover {
    background: none;
    color: #fc6027;
  }
`;

export function VideoModal({ isOpen, onClose, destination, operator }) {
  const [multimedia, setMultimedia] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [likesCount, setLikesCount] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [showDetails, setShowDetails] = useState(window.innerWidth > 800);

  // DEPURACIÓN: Mostrar el id recibido y el objeto multimedia
  console.log('ID destino recibido en modal:', destination?.id, destination?.id_destino);
  console.log('Multimedia:', multimedia);
  console.log('URL del video:', multimedia?.video);
  // LOGS DE DATOS DE RUTAS Y HORARIOS
  console.log('DESTINO EN MODAL:', destination);
  console.log('RUTAS EN MODAL:', destination?.rutas);
  if (destination?.rutas) {
    destination.rutas.forEach((ruta, idx) => {
      console.log(`Ruta ${idx}:`, ruta);
      console.log(`Horarios de la ruta ${idx}:`, ruta.horarios);
    });
  }

  // Cargar multimedia del destino
  useEffect(() => {
    if (isOpen && (destination?.id_destino || destination?.id)) {
      setVideoError(false);
      loadMultimedia();
    }
  }, [isOpen, destination]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 800) {
        setShowDetails(true);
      } else {
        setShowDetails(false);
      }
    };
    window.addEventListener('resize', handleResize);
    // Al abrir el modal, sincroniza el estado
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  const loadMultimedia = async () => {
    try {
      setIsLoading(true);
      const idDestino = destination.id_destino || destination.id;
      const { data, error } = await supabase
        .from('multimedia')
        .select('*')
        .eq('id_destino', idDestino)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      if (data) {
        setMultimedia(data);
        setLikesCount(data.likes || 0);
      } else {
        setMultimedia(null);
        setLikesCount(0);
      }
    } catch (error) {
      console.error('Error al cargar multimedia:', error);
      toast.error('Error al cargar el video del destino');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      if (!multimedia) return;

      const newLikesCount = isLiked ? likesCount - 1 : likesCount + 1;
      
      // Actualizar optimísticamente
      setLikesCount(newLikesCount);
      setIsLiked(!isLiked);

      // Actualizar en la base de datos
      const idDestino = destination.id_destino || destination.id;
      const { error } = await supabase
        .from('multimedia')
        .update({ likes: newLikesCount })
        .eq('id_destino', idDestino);

      if (error) {
        // Revertir si hay error
        setLikesCount(likesCount);
        setIsLiked(isLiked);
        throw error;
      }

      toast.success(isLiked ? 'Like removido' : '¡Te gustó este destino!');
    } catch (error) {
      console.error('Error al actualizar likes:', error);
      toast.error('Error al actualizar el like');
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent>
        <VideoBox>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
          
            {isLoading ? (
              <LoadingSpinner>
                <div className="spinner"></div>
              </LoadingSpinner>
            ) : !videoError && multimedia?.video && multimedia.video !== 'link' && multimedia.video !== '' && multimedia.video !== null ? (
            <Video
                key={multimedia.video}
                controls
                autoPlay
                loop
                poster={destination?.imagen || ''}
                onError={() => setVideoError(true)}
                onPlay={e => {
                  if (e.target.muted) {
                    toast('El navegador ha silenciado el video automáticamente. Activa el sonido si lo deseas.', { icon: '🔇' });
                  }
                }}
              >
                <source src={multimedia.video} type="video/mp4" />
                Tu navegador no soporta el elemento de video.
            </Video>
            ) : (
            <NoVideoMessage>
              <div className="icon">🎬</div>
              <div className="title">No hay video disponible</div>
              <div className="message">
                No existe video para mostrar de este destino. 
                Puedes consultar la información del destino en la sección de detalles.
              </div>
            </NoVideoMessage>
          )}
          
          <DestinoInfo>
            <div className="destino-nombre">
              {destination?.descripcion || destination?.descripcion_destino}
            </div>
            <div className="ubicacion">
              {destination?.ciudaddestino || destination?.ciudad_destino}, {destination?.provinciadestino || destination?.provincia_destino}
            </div>
          </DestinoInfo>
          
          <LikeButtonBottom
              isLiked={isLiked}
              onClick={handleLike}
              disabled={!multimedia}
            >
              <FaHeart />
          </LikeButtonBottom>
          
          {likesCount > 0 && (
            <LikesCount>
              {likesCount} {likesCount === 1 ? 'like' : 'likes'}
            </LikesCount>
          )}
        </VideoBox>
      </ModalContent>
    </ModalOverlay>
  );
} 