import styled from "styled-components";
import { AccionTabla } from "../atomos/AccionTabla";
import { v } from "../../styles/variables";

export function TablaOperadora({ data, setOpenRegistro, setDataSelect, setAccion }) {
  const handleEditar = (item) => {
    setDataSelect(item);
    setAccion("Editar");
    setOpenRegistro(true);
  };

  return (
    <Container>
      <table>
        <thead>
          <tr>
            <th>Logo</th>
            <th>Nombre</th>
            <th>Dirección</th>
            <th>Teléfono</th>
            <th>Dirigente</th>
            <th>Correo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item) => (
            <tr key={item.id}>
              <td>
                {item.logo && (
                  <img
                    src={item.logo}
                    alt={`Logo ${item.nombre}`}
                    className="logo-img"
                  />
                )}
              </td>
              <td>{item.nombre}</td>
              <td>{item.direccion}</td>
              <td>{item.telefono}</td>
              <td>{item.dirigente}</td>
              <td>{item.correo}</td>
              <td>
                <AccionTabla
                  funcion={() => handleEditar(item)}
                  icono={<v.iconoeditar />}
                  bgcolor="#f6f3f3"
                  textcolor="#353535"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  overflow-x: auto;
  background: ${({ theme }) => theme.bgcards};
  border-radius: 10px;
  padding: 20px;

  table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    border-radius: 8px;
    overflow: hidden;
  }

  th {
    background: ${({ theme }) => theme.bg3};
    padding: 15px;
    font-weight: 500;
    color: ${({ theme }) => theme.text};
    font-size: 14px;
    text-transform: uppercase;
  }

  td {
    padding: 15px;
    border-bottom: 1px solid ${({ theme }) => theme.bg3};
    color: ${({ theme }) => theme.text};
    font-size: 14px;
  }

  tr:hover {
    background: ${({ theme }) => theme.bg2};
  }

  .logo-img {
    width: 50px;
    height: 50px;
    object-fit: contain;
    border-radius: 5px;
  }
`; 