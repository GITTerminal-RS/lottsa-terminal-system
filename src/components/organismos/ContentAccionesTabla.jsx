import styled from "styled-components";
import { AccionTabla, v } from "../../index";

export function ContentAccionesTabla({ editar, eliminar, funcionEditar, funcionEliminar }) {
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
