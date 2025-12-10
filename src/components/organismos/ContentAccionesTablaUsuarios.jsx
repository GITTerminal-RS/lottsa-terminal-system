import styled from "styled-components";
import { AccionTabla, v } from "../../index";
import { RiLockPasswordLine } from "react-icons/ri";

export function ContentAccionesTablaUsuarios({ 
  funcionEditar, 
  funcionEliminar, 
  funcionCambiarClave,
  mostrarCambiarClave = false 
}) {
  return (
    <Container>
      <AccionTabla
        funcion={funcionEditar}
        fontSize="18px"
        color="#7d7d7d"
        icono={<v.iconeditarTabla />}
      />
      
      {funcionEliminar && (
        <AccionTabla
          funcion={funcionEliminar}
          fontSize="18px"
          color="#f76e8e"
          icono={<v.iconeliminarTabla />}
        />
      )}
      
      {mostrarCambiarClave && funcionCambiarClave && (
        <AccionTabla
          funcion={funcionCambiarClave}
          fontSize="18px"
          color="#3a4b86"
          icono={<RiLockPasswordLine />}
        />
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  
  @media (max-width: 48em) {
    justify-content: end;
  }
`;
