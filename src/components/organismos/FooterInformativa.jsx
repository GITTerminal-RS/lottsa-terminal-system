import styled from "styled-components";
import { BoldText } from "../../index";
import LOTSALogo from "../../assets/LOTSA-r.png";
import { FaPhone, FaMobile, FaUser, FaBuilding, FaCode, FaPalette, FaAndroid, FaDownload } from "react-icons/fa";

export function FooterInformativa() {
  return (
    <FooterSection>
      <FooterContentWrapper>
        <FooterColumn>
          {/* Logo del Terminal */}
          <img src="https://i.ibb.co/NdmRfsxs/tt.png" alt="Terminal Terrestre Reina de el Cisne" />
          {/* Título */}
          <h3>Terminal Terrestre Reina del Cisne</h3>
          {/* Texto descriptivo */}
          <p>
          La <BoldText>Terminal Terrestre Reina del Cisne de Loja</BoldText>,  es el principal centro de transporte de Loja, operando las 24 horas del día y conectando la ciudad con destinos locales, nacionales e internacionales. Su compromiso es ofrecer una experiencia segura y cómoda para todos los viajeros.
          </p>
        </FooterColumn>
        <FooterColumn>
          {/* Logo de LOTSA */}
          <img src={LOTSALogo} alt="LOTTSA - Plataforma Informativa" />
          {/* Título */}
          <h3>LOTTSA</h3>
          {/* Texto descriptivo */}
          <p>
            <BoldText>LOTTSA</BoldText> es una plataforma web dedicada al Terminal Terrestre Reina del Cisne de Loja, la cual brinda información actualizada y confiable sobre destinos, rutas, horarios y noticias para facilitar la planificación de viajes desde y hacia este importante centro de transporte.
          </p>
        </FooterColumn>
        <FooterColumn>
          {/* Título de Contacto */}
          <h3>Contactos</h3>
          
          {/* Información de contacto ultra compacta */}
          <UltraCompactContactList>
            {/* Municipio */}
            <ContactLine>
              <ContactLineIcon><FaBuilding /></ContactLineIcon>
              <ContactLineText>
                <strong>Municipio:</strong> <FaPhone /> 2570407 Ext.1305
              </ContactLineText>
            </ContactLine>

            {/* Terminal */}
            <ContactLine>
              <ContactLineIcon><FaBuilding /></ContactLineIcon>
              <ContactLineText>
                <strong>Terminal:</strong> <FaPhone /> 2722198 • 2729592
              </ContactLineText>
            </ContactLine>
            <ContactLine>
              <ContactLineIcon></ContactLineIcon>
              <ContactLineText>
                <FaMobile /> 0989165065 <MiniTag>Claro</MiniTag> • 0962079209 <MiniTag>CNT</MiniTag>
              </ContactLineText>
            </ContactLine>

            {/* Desarrolladores */}
            <ContactLine>
              <ContactLineIcon><FaCode /></ContactLineIcon>
              <ContactLineText>
                <strong>Desarrollo:</strong>
              </ContactLineText>
            </ContactLine>
            <ContactLine>
              <ContactLineIcon><FaCode /></ContactLineIcon>
              <ContactLineText>
                Ing. Gilson O. Quezada G. <FaMobile /> 0959811860
              </ContactLineText>
            </ContactLine>
            <ContactLine>
              <ContactLineIcon><FaPalette /></ContactLineIcon>
              <ContactLineText>
                Lic. Soraya A. Cuncay C. <FaMobile /> 0989101576
              </ContactLineText>
            </ContactLine>
          </UltraCompactContactList>
          
          {/* Sección de descarga de APK */}
          <ApkDownloadSection>
            <ApkDownloadTitle>
              <FaAndroid /> App Versión Móvil
            </ApkDownloadTitle>
            <ApkDownloadButton 
              href="/downloads/lottsa.apk" 
              download="LOTTSA-Mobile-v1.0.apk"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaDownload />
              <ApkDownloadText>
                <ApkDownloadLabel>Descargar APK</ApkDownloadLabel>
                <ApkDownloadVersion>Versión 1.0</ApkDownloadVersion>
              </ApkDownloadText>
            </ApkDownloadButton>
          </ApkDownloadSection>
        </FooterColumn>
      </FooterContentWrapper>
    </FooterSection>
  );
}

const FooterSection = styled.footer`
  background-color: #0a0872;
  color: white;
  padding: 40px 20px;
  width: 100%;
  box-sizing: border-box;
`;

const FooterContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  align-items: center;
  justify-content: center;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-around;
    align-items: flex-start;
    gap: 30px;
  }
`;

const FooterColumn = styled.div`
  flex: 1;
  min-width: 200px;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  h3 {
    font-size: 1.3rem;
    margin-bottom: 15px;
    color: white;
    text-align: center;
  }

  p {
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 10px;
    text-align: justify;
  }

  img {
    max-width: 150px;
    height: auto;
    margin-bottom: 15px;
    align-self: center;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 10px;
    text-align: justify;
    position: relative;
    padding-left: 15px;
    &::before {
      content: "-";
      position: absolute;
      left: 0;
      color: white;
    }
  }

  @media (max-width: 767px) {
    max-width: 100%;
    width: 100%;
    align-items: center;
    text-align: center;
    ul, li {
      text-align: center;
      justify-content: center;
      width: 100%;
    }
  }
`;

const UltraCompactContactList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.8rem;
  line-height: 1.4;
`;

const ContactLine = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 0;
  
  &:not(:last-child) {
    margin-bottom: 2px;
  }
`;

const ContactLineIcon = styled.div`
  color: #f8bf5b;
  font-size: 0.9rem;
  min-width: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
`;

const ContactLineText = styled.div`
  flex: 1;
  color: white;
  font-size: 0.8rem;
  line-height: 1.3;
  
  strong {
    color: #f8bf5b;
    font-weight: 600;
    margin-right: 4px;
  }
  
  svg {
    color: #3a4b86;
    font-size: 0.75rem;
    margin: 0 3px;
    vertical-align: middle;
  }
`;

const MiniTag = styled.span`
  background: #3a4b86;
  color: white;
  padding: 0px 4px;
  border-radius: 8px;
  font-size: 0.65rem;
  font-weight: 500;
  margin: 0 2px;
`;

const ApkDownloadSection = styled.div`
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const ApkDownloadTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f8bf5b;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 4px;
  
  svg {
    color: #4CAF50;
    font-size: 1rem;
  }
`;

const ApkDownloadButton = styled.a`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  border: none;
  border-radius: 8px;
  color: white;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
  
  &:hover {
    background: linear-gradient(135deg, #45a049, #3d8b40);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
    text-decoration: none;
    color: white;
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    font-size: 1rem;
    color: white;
  }
`;

const ApkDownloadText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ApkDownloadLabel = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: white;
`;

const ApkDownloadVersion = styled.div`
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
`; 