import styled from "styled-components";
import { Btnfiltro, Buscador, ContentFiltro, Header, RegistrarRuta, TablaRuta, Title, useRutaStore, v } from "../../index";
import { useState, useCallback } from "react";

export function RutaTemplate({data}) {
  console.log("RutaTemplate - Data recibida:", data);
  
  const [state, setState] = useState(false);
  const [dataSelect, setdataSelect] = useState(null);
  const [accion, setAccion] = useState("");
  const [openRegistro, SetopenRegistro] = useState(false);
  
  console.log("RutaTemplate - Estado actual:", {
    state,
    dataSelect,
    accion,
    openRegistro
  });

  const nuevoRegistro = useCallback(() => {
    console.log("Iniciando nuevo registro");
    setdataSelect(null);
    setAccion("Nuevo");
    SetopenRegistro(true);
  }, []);

  const {setBuscador} = useRutaStore();

  const handleSetDataSelect = useCallback((data) => {
    console.log("Actualizando dataSelect:", data);
    setdataSelect(data);
  }, []);

  const handleSetAccion = useCallback((accion) => {
    console.log("Actualizando accion:", accion);
    setAccion(accion);
  }, []);

  const handleOpenRegistro = useCallback((value) => {
    console.log("Abriendo/cerrando registro:", value);
    SetopenRegistro(value);
  }, []);

  const handleCloseRegistro = useCallback(() => {
    console.log("Cerrando modal de registro");
    SetopenRegistro(false);
    setdataSelect(null);
    setAccion("");
  }, []);

  return (
    <Container>
      {openRegistro && (
        <RegistrarRuta 
          dataSelect={dataSelect} 
          accion={accion} 
          onClose={handleCloseRegistro}
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
            Rutas
          </Title>
          <Btnfiltro 
            funcion={nuevoRegistro} 
            bgcolor="#f6f3f3"
            textcolor="#353535"
            icono={<v.agregar/>}
          />
        </ContentFiltro>
      </section>
      <section className="area2">
        <Buscador setBuscador={setBuscador}/>
      </section>
      <section className="main">
        <TablaRuta 
          data={data} 
          SetopenRegistro={handleOpenRegistro}
          setdataSelect={handleSetDataSelect}
          setAccion={handleSetAccion}
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
    "area2" 100px
    "main" auto;
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
  .area2 {
    grid-area: area2;
    /* background-color: rgba(77, 237, 106, 0.14); */
    display: flex;
    align-items: center;
    justify-content:end;
  }
  .main {
    grid-area: main;
    /* background-color: rgba(179, 46, 241, 0.14); */
  }
`;
