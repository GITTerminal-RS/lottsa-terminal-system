import styled from "styled-components";
import { v } from "../../index";
import { FaFacebook, FaInstagram, FaYoutube, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { useNavigate, useLocation, Link } from "react-router-dom";
import { MenuHamburInformativo } from "./MenuHamburInformativo";

export function PublicHeader({ stateConfig, isMuted, setIsMuted, useWhiteText }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isInicio = location.pathname === "/";
  const menuColor = isInicio || useWhiteText ? "#fff" : "#222";
  const buttonBg = isInicio || useWhiteText ? "rgba(255,255,255,0.15)" : "#f8bf5b";
  const buttonColor = isInicio || useWhiteText ? "#fff" : "#222";

  return (
    <HeaderContainer>
      <NavBar>
        <Logo>
          <img src="https://i.ibb.co/NdmRfsxs/tt.png" alt="Terminal Terrestre Reina de el Cisne" />
          <span className="logo-text" style={{ color: menuColor }}>Terminal Terrestre<br />REINA DE EL CISNE</span>
        </Logo>
        <NavLinks>
          <NavLinkStyled as={Link} to="/" style={{ color: menuColor }}>Inicio</NavLinkStyled>
          <NavLinkStyled as={Link} to="/mi-destino" style={{ color: menuColor }}>Mi destino</NavLinkStyled>
          <NavLinkStyled as={Link} to="/cooperativas" style={{ color: menuColor }}>Cooperativas</NavLinkStyled>
          <NavLinkStyled as={Link} to="/descubre-viaja" style={{ color: menuColor }}>Descubre y Viaja</NavLinkStyled>
          <NavLinkStyled as={Link} to="/cartelera" style={{ color: menuColor }}>Cartelera</NavLinkStyled>
        </NavLinks>
      </NavBar>
      <HeaderControls>
        {/* Desktop Carousel Control - Now Video Sound Control */}
        <CarouselControl className="desktop-only" onClick={() => setIsMuted(!isMuted)} style={{ color: menuColor }}>
          {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
        </CarouselControl>
        {/* Desktop Login Button */}
        <LoginButton
          onClick={() => navigate('/gestion')}
          className="desktop-only"
          style={{ background: buttonBg, color: buttonColor, borderColor: isInicio ? '#fff' : '#f8bf5b' }}
        >
          <v.iconoSettings style={{ marginRight: '10px', color: buttonColor }} />
          Gestión de Información
        </LoginButton>
      </HeaderControls>

      {/* Mobile-specific controls, independently positioned */}
      {/* <MobileLoginButtonMobile onClick={() => navigate('/gestion')} style={{ color: '#222' }}>
        <v.iconoSettings style={{ color: '#222' }} />
      </MobileLoginButtonMobile> */}
      
      <MobileHamburgerMenuContainer style={{ color: '#222' }}>
        <MenuHamburInformativo color='#222' />
      </MobileHamburgerMenuContainer>

    </HeaderContainer>
  );
}

const HeaderContainer = styled.header`
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 20px;
  background-color: rgba(0, 0, 0, 0.2);
  @media (max-width: 900px) {
    background: none;
    padding: 0;
    height: 0;
    min-height: 0;
    overflow: visible;
    display: block;
  }
`;

const TopBar = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  padding: 0.5rem 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
`;

const ContactInfo = styled.span`
  margin-right: 20px;
`;

const SocialIcons = styled.div`
  a {
    color: white;
    margin-left: 15px;
    font-size: 1.1rem;
    &:hover {
      opacity: 0.8;
    }
  }
`;

const LanguageSelector = styled.div`
  margin-left: 20px;
`;

const NavBar = styled.nav`
  display: flex;
  align-items: center;
  gap: 40px;
  flex: 1;
  @media (max-width: 900px) {
    display: none;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  font-weight: bold;
  
  img {
    height: 60px;
    width: auto;
    margin-right: 10px;
  }

  .logo-text {
    font-size: 1.5rem;
    line-height: 1;
    @media (max-width: 900px) {
      display: none;
    }
  }

  @media (max-width: 900px) {
    display: none;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 20px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLinkStyled = styled.a`
  color: white;
  text-decoration: none;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
  }
`;

const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  @media (max-width: 900px) {
    display: none;
  }
`;

const CarouselControl = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const LoginButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.35rem 1.1rem;
  font-size: 0.75rem;
  background-color: transparent;
  color: white;
  border: 2px solid white;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

// Renamed and refactored MobileOnlyControls to MobileHamburgerMenuContainer
const MobileHamburgerMenuContainer = styled.div`
  display: none;
  @media (max-width: 900px) {
    display: block;
  }
`;

// Reusing and adapting the MobileLoginButton for mobile fixed position
const MobileLoginButtonMobile = styled.button`
  display: none; // Hidden by default on desktop
  position: fixed;
  top: 2rem;
  right: calc(1rem + 32px + 10px);
  z-index: 101;

  padding: 0.6rem;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  border: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  svg {
    margin: 0;
    font-size: 1.2rem;
    color: white;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  @media (max-width: 768px) {
    display: flex; // Show only on mobile
  }
`; 