import styled from "styled-components";
import { ContentFiltro, Header, RegistrarHorarios, TablaHorarios, Title, useHorariosStore, v, useOperadoraStore } from "../../index";
import { useState } from "react";

export function HorariosTemplate({data}) {
  const [state, setState] = useState(false);
  const [dataSelect, setdataSelect] = useState(null);
  const [accion, setAccion] = useState("");
  const [openRegistro, SetopenRegistro] = useState(false);
  const { mostrarhorariosagrupados } = useHorariosStore();
  const { dataoperadora } = useOperadoraStore();

  const nuevoRegistro = () => {
    setdataSelect(null);
    setAccion("Nuevo");
    SetopenRegistro(true);
  };

  const cerrarRegistro = async () => {
    SetopenRegistro(false);
    setdataSelect(null);
    setAccion("");
    console.log("Cerrando formulario de horarios y recargando tabla...");
    if (dataoperadora?.id) {
        console.log("Llamando a mostrarhorariosagrupados con id_operadora:", dataoperadora.id);
        await mostrarhorariosagrupados({ id_operadora: dataoperadora.id });
        console.log("Tabla de horarios recargada.");
    } else {
        console.log("No se pudo recargar la tabla: id_operadora no disponible.");
    }
  };

  const { setBuscador } = useHorariosStore();

  return (
    <Container>
      {openRegistro && (
        <RegistrarHorarios 
          dataSelect={dataSelect} 
          accion={accion} 
          onClose={cerrarRegistro}
        />
      )}
     
      <header className="header">
        <Header
          stateConfig={{ state: state, setState: () => setState(!state) }}
        />
      </header>
      <section className="area1">
        <ContentFiltro>
          <Title>
            Horarios
          </Title>
        </ContentFiltro>
      </section>
      <section className="main">
        <TablaHorarios 
          data={data} 
          SetopenRegistro={SetopenRegistro}
          setdataSelect={setdataSelect} 
          setAccion={setAccion}
        />
      </section>
    </Container>
  );
}
const Container = styled.div`
  min-height: 100vh;
  width: 100%;
  background-color: ${(props) => props.theme.bgtotal};
  color: ${({ theme }) => theme.text};
  display: grid;
  padding: 15px;
  grid-template:
    "header" 100px
    "area1" 100px
    "main" auto;
  position: relative;
  .header {
    grid-area: header;
    /* background-color: rgba(103, 93, 241, 0.14); */
    display: flex;
    align-items: center;
  }
  .area1 {
    grid-area: area1;
    /* background-color: rgba(229, 67, 26, 0.14); */
    display: flex;
    align-items: center;
  }
  .main {
    grid-area: main;
    /* background-color: rgba(179, 46, 241, 0.14); */
  }
`;
