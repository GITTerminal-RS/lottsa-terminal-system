import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { Btnfiltro, ContentFiltro, Header, Title, useOperadoraStore, v } from '../../index';
import { useQueryClient } from '@tanstack/react-query';
import RegistrarCartelera from '../organismos/fomularios/RegistrarCartelera';
import TablaCartelera from '../organismos/tablas/TablaCartelera';

export default function CarteleraTemplate({ data }) {
  const [state, setState] = useState(false);
  const [dataSelect, setdataSelect] = useState(null);
  const [accion, setAccion] = useState("");
  const [openRegistro, SetopenRegistro] = useState(false);
  const { dataoperadora } = useOperadoraStore();
  const queryClient = useQueryClient();

  const nuevoRegistro = useCallback(() => {
    setdataSelect(null);
    setAccion("Nuevo");
    SetopenRegistro(true);
  }, []);

  const handleCloseRegistro = useCallback(() => {
    SetopenRegistro(false);
    setdataSelect(null);
    setAccion("");
    
    // 🚀 Invalidar cache para refrescar datos después de cerrar modal
    queryClient.invalidateQueries(['cartelera']);
    console.log('🔄 Cache de cartelera invalidado al cerrar modal');
  }, [queryClient]);

  // 🚀 Prefetch de cartelera cuando cambia operadora (opcional)
  useEffect(() => {
    if (dataoperadora?.id) {
      // Prefetch cartelera para la nueva operadora
      queryClient.prefetchQuery({
        queryKey: ['cartelera-base'],
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [dataoperadora?.id, queryClient]);

  return (
    <Container>
      {openRegistro && (
        <RegistrarCartelera dataSelect={dataSelect} accion={accion} onClose={handleCloseRegistro} />
      )}
      <header className="header">
        <Header stateConfig={{ state: state, setState: () => setState(!state) }} />
      </header>
      <section className="area1">
        <ContentFiltro>
          <Title>Cartelera cultural y turística</Title>
          <Btnfiltro funcion={nuevoRegistro} bgcolor="#f6f3f3" textcolor="#353535" icono={<v.agregar />} />
        </ContentFiltro>
      </section>
      <section className="main">
        <TablaCartelera SetopenRegistro={SetopenRegistro} setdataSelect={setdataSelect} setAccion={setAccion} />
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