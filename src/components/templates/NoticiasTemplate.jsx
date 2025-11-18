import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { Btnfiltro, ContentFiltro, Header, Title, useOperadoraStore, v } from '../../index';
import RegistrarNoticias from '../organismos/fomularios/RegistrarNoticias';
import TablaNoticias from '../organismos/tablas/TablaNoticias';

export default function NoticiasTemplate({ data }) {
  const [state, setState] = useState(false);
  const [dataSelect, setdataSelect] = useState(null);
  const [accion, setAccion] = useState("");
  const [openRegistro, SetopenRegistro] = useState(false);
  const { dataoperadora } = useOperadoraStore();

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

  useEffect(() => {
    // Si necesitas cargar noticias por operadora, hazlo aquí
  }, [dataoperadora?.id]);

  return (
    <Container>
      {openRegistro && (
        <RegistrarNoticias dataSelect={dataSelect} accion={accion} onClose={handleCloseRegistro} />
      )}
      <header className="header">
        <Header stateConfig={{ state: state, setState: () => setState(!state) }} />
      </header>
      <section className="area1">
        <ContentFiltro>
          <Title>Gestión de Noticias</Title>
          <Btnfiltro funcion={nuevoRegistro} bgcolor="#f6f3f3" textcolor="#353535" icono={<v.agregar />} />
        </ContentFiltro>
      </section>
      <section className="main">
        <TablaNoticias SetopenRegistro={SetopenRegistro} setdataSelect={setdataSelect} setAccion={setAccion} />
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
    display: flex;
    align-items: center;
  }
  .area1 {
    grid-area: area1;
    display: flex;
    align-items: center;
  }
  .main {
    grid-area: main;
  }
`; 