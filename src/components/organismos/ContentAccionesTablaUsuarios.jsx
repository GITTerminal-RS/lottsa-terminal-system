import styled from "styled-components";
import { AccionTabla, v } from "../../index";
import { RiLockPasswordLine } from "react-icons/ri";

export function ContentAccionesTablaUsuarios({ 
  editar, 
  eliminar, 
  funcionEditar, 
  funcionEliminar, 
  cambiarClave,
  funcionCambiarClave,
  mostrarCambiarClave = false
}) {
  // Usar las props con los nombres nuevos o los viejos
  const handleEditar = editar || funcionEditar;
  const handleEliminar = eliminar || funcionEliminar;
  const handleCambiarClave = cambiarClave || funcionCambiarClave;
  
  return (
    <Container>
      {/* Botón Editar */}
      <AccionTabla
        funcion={handleEditar}
        fontSize="18px"
        color="#7d7d7d"
        icono={<v.iconeditarTabla />}
      />
      
      {/* Botón Cambiar Clave - Solo visible si se especifica */}
      {mostrarCambiarClave && handleCambiarClave && (
        <AccionTabla
          funcion={handleCambiarClave}
          fontSize="18px"
          color="#3a4b86"
          icono={<RiLockPasswordLine />}
        />
      )}
      
      {/* Botón Eliminar */}
      {handleEliminar && (
        <AccionTabla
          funcion={handleEliminar}
          fontSize="18px"
          color="#f76e8e"
          icono={<v.iconeliminarTabla />}
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
