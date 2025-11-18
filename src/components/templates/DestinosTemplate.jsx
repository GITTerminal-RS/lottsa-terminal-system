import styled from "styled-components";
import { Btnfiltro, Buscador, ContentFiltro, Header,  RegistrarDestinos, TablaDestinos, Title,useRutaStore,useDestinosStore,v, useOperadoraStore } from "../../index";
import { useState, useCallback, useEffect } from "react";
export function DestinosTemplate({data}) {
  const [state, setState] = useState(false);
  const [dataSelect, setdataSelect] = useState(null);
  const [accion, setAccion] = useState("");
  const [openRegistro, SetopenRegistro] = useState(false);
  
  const nuevoRegistro = useCallback(() => {
    setdataSelect(null);
    setAccion("Nuevo");
    SetopenRegistro(true);
  }, []);

  const handleCloseRegistro = useCallback(() => {
    SetopenRegistro(false);
    setdataSelect(null);
    setAccion("");
  }, []);

  const {setBuscador, mostrardestinos} = useDestinosStore();
  const {dataoperadora} = useOperadoraStore();

  useEffect(() => {
    if (dataoperadora?.id) {
      mostrardestinos({id_operadora: dataoperadora.id});
    }
  }, [dataoperadora?.id, mostrardestinos]);

  return (
    <Container>
      {
        openRegistro &&  <RegistrarDestinos dataSelect={dataSelect} accion={accion} onClose={handleCloseRegistro}/>
      }
     
      <header className="header">
        <Header
          stateConfig={{ state: state, setState: () => setState(!state) }}
        />
      </header>
      <section className="area1">
        <ContentFiltro>
          <Title>
            Destinos
          </Title>
           <Btnfiltro funcion={nuevoRegistro} bgcolor="#f6f3f3"
            textcolor="#353535"
            icono={<v.agregar/>}/>
        </ContentFiltro>
       
      </section>
      
      <section className="main">
        <TablaDestinos SetopenRegistro={SetopenRegistro}
        setdataSelect={setdataSelect} setAccion={setAccion}/>
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
