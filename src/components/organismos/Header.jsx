import styled, { css } from "styled-components";
import { BtnCircular, UserAuth, v, ListaMenuDesplegable, DesplegableUser, useAuthStore } from "../../index";
import { useNavigate } from "react-router-dom";

export function Header({ stateConfig, isInformativePage }) {
  const { signOut } = useAuthStore();
  const { user } = UserAuth();
  const navigate = useNavigate();

  const funcionXtipo = async (p) => {
    if (p.tipo === "cerrarsesion") {
      await signOut();
      navigate('/');
    } else if (p.tipo === "configuracion") {
      navigate('/configurar');
      stateConfig.setState(false);
    } else if (p.tipo === "mipersonal") {
      navigate('/configurar/personal');
      stateConfig.setState(false);
    }
  };

  // Si no hay usuario autenticado, mostrar un header simplificado
  if (!user) {
    return (
      <Container>
        <LoginButton onClick={() => navigate('/gestion')} $isInformativePage={isInformativePage}>
          <v.iconoSettings style={{ marginRight: '10px' }} />
          Gestión de Información
        </LoginButton>
      </Container>
    );
  }

  // Si hay usuario autenticado, mostrar el header completo
  return (
    <Container>
      <Datauser onClick={stateConfig.setState}>
        <div className="imgContainer">
          <img src="https://i.ibb.co/kGYgRZ8/programador.png" alt="user" />
        </div>
        <BtnCircular
          icono={<v.iconocorona />}
          width="25px"
          height="25px"
          bgcolor={`linear-gradient(15deg, rgba(255, 88, 58, 0.86) 9%, #f8bf5b 100%);`}
          textcolor="#ffffff"
          fontsize="11px"
          translatex="-50px"
          translatey="-12px"
        />
        <span className="nombre">{user.email}</span>
        {stateConfig.state && (
          <ListaMenuDesplegable
            data={DesplegableUser}
            top="62px"
            funcion={(p) => funcionXtipo(p)}
          />
        )}
      </Datauser>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  position: relative;
  justify-content: end;
`;

const LoginButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 15px;

  ${(props) =>
    props.$isInformativePage
      ? css`
          padding: 0.8rem 1.8rem;
          font-size: 1rem;
          background-color: transparent;
          color: white;
          border: 2px solid white;

          &:hover {
            background-color: rgba(255, 255, 255, 0.2);
          }
        `
      : css`
          padding: 1rem 2rem;
          font-size: 1.1rem;
          background-color: ${({ theme }) => theme.bgcards};
          color: ${({ theme }) => theme.text};
          border: 2px solid ${({ theme }) => theme.bg3};

          &:hover {
            background-color: ${({ theme }) => theme.bg3};
          }
        `}

  &:active {
    transform: translateY(0);
  }
`;

const Datauser = styled.div`
  z-index: 10;
  position: relative;
  top: 0;
  right: 0;
  width: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  border-radius: 50px;
  margin: 15px;
  cursor: pointer;
  
  .imgContainer {
    height: 40px;
    width: 40px;
    min-height: 40px;
    min-width: 40px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 22px;
    display: flex;
    justify-content: center;
    align-items: center;
    img {
      width: 100%;
      object-fit: cover;
    }
  }
  
  &:hover {
    background-color: ${({ theme }) => theme.bg3};
  }
  
  .nombre {
    width: 100%;
    font-weight: 500;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    word-wrap: break-word;
  }
`;
