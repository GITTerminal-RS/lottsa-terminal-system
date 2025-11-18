import styled from "styled-components";
import { Header, SpinnerLoader } from "../../index";
import { useMallaStore } from "../../store/MallaStore";
import { useEffect, useState } from "react";
import { ModificarMalla } from "../organismos/fomularios/ModificarMalla";

export function MallaTemplate() {
  const [state, setState] = useState(false);
  const { datamalla, cargarMalla } = useMallaStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    cargarMalla().then(() => setShowForm(true));
  }, [cargarMalla]);

  if (!datamalla) {
    return (
      <Container>
        <header className="header">
          <Header stateConfig={{ state: state, setState: () => setState(!state) }} />
        </header>
        <section className="main">
          <SpinnerLoader />
        </section>
      </Container>
    );
  }

  return (
    <Container>
      <header className="header">
        <Header stateConfig={{ state: state, setState: () => setState(!state) }} />
      </header>
      <section className="main">
        {showForm && <ModificarMalla dataSelect={datamalla} />}
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
    "main" auto;
  .header {
    grid-area: header;
    display: flex;
    align-items: center;
  }
  .main {
    grid-area: main;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 20px;
  }
`; 