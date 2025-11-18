import styled from "styled-components";
import { NavLink, useNavigate } from "react-router-dom";
import { v } from "../../styles/variables";
import { useState } from "react";
import { FaHome, FaRoute, FaBus, FaTicketAlt, FaRegCalendarAlt } from 'react-icons/fa';

// Array de enlaces para el menú informativo
const InformativeLinks = [
  { icon: <FaHome />, label: "Inicio", to: "/" },
  { icon: <FaRoute />, label: "Mi destino", to: "/mi-destino" },
  { icon: <FaBus />, label: "Cooperativas", to: "/cooperativas" },
  { icon: <FaTicketAlt />, label: "Descubre y Viaja", to: "/descubre-viaja" },
  { icon: <FaRegCalendarAlt />, label: "Cartelera", to: "/cartelera" },
];

export function MenuHamburInformativo() {
  const [click, setClick] = useState(false);
  const navigate = useNavigate();
  
  return (
    <Container>
      <NavBar>
        <section>
          <HamburgerMenu onClick={() => setClick(!click)}>
            <label className={click ? "toggle active" : "toggle"}>
              <div className="bars" id="bar1"></div>
              <div className="bars" id="bar2"></div>
              <div className="bars" id="bar3"></div>
            </label>
          </HamburgerMenu>
        </section>
        <Menu $click={click.toString()}>
          {InformativeLinks.map(({ icon, label, to }) => (
            <div
              onClick={() => setClick(!click)}
              className="LinkContainer"
              key={label}
            >
              <NavLink to={to} className="Links">
                <div className="Linkicon">{icon}</div>
                <span>{label}</span>
              </NavLink>
            </div>
          ))}
          <LoginButtonContainer>
            <LoginButton onClick={() => {
              setClick(false);
              navigate('/gestion');
            }}>
              <v.iconoSettings style={{ marginRight: '10px' }} />
              Gestión de Información
            </LoginButton>
          </LoginButtonContainer>
        </Menu>
      </NavBar>
    </Container>
  );
}

const Container = styled.div`
  background-color: transparent;
  display: inline-block;
`;

const NavBar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HamburgerMenu = styled.button`
  position: fixed;
  top: 2rem;
  right: 1rem;
  z-index: 100;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition-duration: 0.5s;
  background: #fff;
  border-radius: 50%;
  padding: 0.6rem;
  backdrop-filter: blur(5px);
  border: none;
  transform: translateY(-2px);
  .toggle {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    transition-duration: 0.5s;
    &.active {
      transition-duration: 0.5s;
      transform: rotate(180deg);
      .bars {
        position: absolute;
        transition-duration: 0.5s;
      }
      #bar2 {
        transform: scaleX(0);
        transition-duration: 0.5s;
      }
      #bar1 {
        width: 100%;
        transform: rotate(45deg);
        transition-duration: 0.5s;
      }
      #bar3 {
        width: 100%;
        transform: rotate(-45deg);
        transition-duration: 0.5s;
      }
    }
  }
  .bars {
    width: 18px;
    height: 3px;
    background-color: #222;
    border-radius: 4px;
    transition: all 0.3s ease;
  }
  #bar1, #bar2, #bar3 {
    width: 18px;
  }
  #bar2 {
    transition-duration: 0.8s;
  }
  &:hover {
    background: #f3f3f3;
  }
`;

const LoginButtonContainer = styled.div`
  width: 100%;
  padding: 20px;
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const LoginButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background-color: transparent;
  color: white;
  border: 2px solid white;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  svg {
    font-size: 1.2rem;
  }
`;

const Menu = styled.div`
  display: flex;
  align-items: center;
  list-style: none;
  z-index: 10;
  flex-direction: column;
  position: fixed;
  justify-content: flex-start;
  top: 0;
  right: 0;
  width: 280px;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(3px);
  transform: ${(props) =>
    props.$click === "true" ? "translateX(0)" : "translateX(100%)"};
  transition: all 0.3s ease;
  padding-top: 80px;

  .LinkContainer {
    width: 100%;
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    
    .Links {
      width: 100%;
      display: flex;
      align-items: center;
      text-decoration: none;
      color: white;
      height: 60px;
      padding: 0 1.5rem;

      .Linkicon {
        padding: ${v.smSpacing} ${v.mdSpacing};
        display: flex;
        svg {
          font-size: 20px;
        }
      }

      span {
        font-size: 1rem;
        font-weight: 500;
      }
    }
  }
`; 