import styled from "styled-components";
import { AccionTabla, v } from "../../index";
import { FaKey } from "react-icons/fa";

export function ContentAccionesTabla({ 
  editar, 
  eliminar, 
  funcionEditar, 
  funcionEliminar, 
  funcionCambiarClave, 
  mostrarCambiarClave 
}) {
  // Usar las props con los nombres nuevos o los viejos
  const handleEditar = editar || funcionEditar;
  const handleEliminar = eliminar || funcionEliminar;
  
  return (
    <Container>
      <AccionTabla
        funcion={handleEditar}
        fontSize="18px"
        color="#7d7d7d"
        icono={<v.iconeditarTabla />}
      />
      {mostrarCambiarClave && funcionCambiarClave && (
        <AccionTabla
          funcion={funcionCambiarClave}
          fontSize="18px"
          color="#3498db"
          icono={<FaKey />}
        />
      )}
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
