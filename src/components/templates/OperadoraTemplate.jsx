import styled from "styled-components";
import { Header, ModificarOperadora, useOperadoraStore, SpinnerLoader, UserAuth } from "../../index";
import { useState, useEffect } from "react";

export function OperadoraTemplate() {
  const [state, setState] = useState(false);
  const { user } = UserAuth();
  const { dataoperadora } = useOperadoraStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (dataoperadora) {
      setShowForm(true);
    }
  }, [dataoperadora]);

  if (!dataoperadora) {
    return (
      <Container>
        <header className="header">
          <Header
            stateConfig={{ state: state, setState: () => setState(!state) }}
          />
        </header>
        <section className="main">
          <div className="error">No se encontraron datos de la operadora</div>
        </section>
      </Container>
    );
  }

  return (
    <Container>
      <header className="header">
        <Header
          stateConfig={{ state: state, setState: () => setState(!state) }}
        />
      </header>

      <section className="main">
        {showForm && (
          <ModificarOperadora 
            setState={() => setShowForm(false)}
            dataSelect={dataoperadora}
            accion="Editar"
          />
        )}
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

  .error {
    text-align: center;
    font-size: 1.2rem;
    color: #007BFF;
    padding: 20px;
    background: ${({ theme }) => theme.bgcards};
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;