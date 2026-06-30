import { useState } from "react";
import styled from "styled-components";
import toast from "react-hot-toast";
import {
  Btnfiltro,
  ContentFiltro,
  Header,
  RegistrarDestinos,
  TablaDestinos,
  Title,
  useOperadoraStore,
  v,
} from "../../index";

export function DestinosTemplate({ isRoot = false, operadoras = [], operadoraSeleccionada = null }) {
  const [state, setState] = useState(false);
  const [dataSelect, setdataSelect] = useState(null);
  const [accion, setAccion] = useState("");
  const [openRegistro, SetopenRegistro] = useState(false);
  const { setOperadoraContexto } = useOperadoraStore();

  const nuevoRegistro = () => {
    if (isRoot && !operadoraSeleccionada?.id) {
      toast.error("Selecciona una cooperativa primero");
      return;
    }

    setdataSelect(null);
    setAccion("Nuevo");
    SetopenRegistro(true);
  };

  const handleCloseRegistro = () => {
    SetopenRegistro(false);
    setdataSelect(null);
    setAccion("");
  };

  const handleSelectOperadora = (event) => {
    const operadoraId = parseInt(event.target.value, 10);
    if (!operadoraId) {
      setOperadoraContexto(null);
      return;
    }

    const operadora = operadoras.find((op) => op.id === operadoraId) || null;
    setOperadoraContexto(operadora);
  };

  return (
    <Container>
      {openRegistro && (
        <RegistrarDestinos
          dataSelect={dataSelect}
          accion={accion}
          isRoot={isRoot}
          onClose={handleCloseRegistro}
        />
      )}

      <header className="header">
        <Header stateConfig={{ state: state, setState: () => setState(!state) }} />
      </header>

      <section className="area1">
        <ContentFiltro>
          <TitleBlock>
            <Title>Destinos</Title>
            {isRoot && (
              <RootBadge>Gestión global · Usuario root</RootBadge>
            )}
          </TitleBlock>
          {!isRoot && (
            <Btnfiltro
              funcion={nuevoRegistro}
              bgcolor="#f6f3f3"
              textcolor="#353535"
              icono={<v.agregar />}
            />
          )}
        </ContentFiltro>

        {isRoot && (
          <SelectorCard>
            <SelectorLabel htmlFor="operadora-root-select">Cooperativa</SelectorLabel>
            <SelectorRow>
              <Selector
                id="operadora-root-select"
                value={operadoraSeleccionada?.id || ""}
                onChange={handleSelectOperadora}
              >
                <option value="">Seleccionar cooperativa...</option>
                {operadoras.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.nombre}
                  </option>
                ))}
              </Selector>
            </SelectorRow>
            <SelectorHint>
              {operadoraSeleccionada
                ? `Editando destinos de: ${operadoraSeleccionada.nombre}`
                : "Elige una cooperativa para listar, editar o eliminar sus destinos."}
            </SelectorHint>
          </SelectorCard>
        )}
      </section>

      <section className="main">
        {isRoot && !operadoraSeleccionada?.id ? (
          <EmptyState>
            <EmptyIcon>🏢</EmptyIcon>
            <EmptyTitle>Selecciona una cooperativa</EmptyTitle>
            <EmptyText>
              Como usuario root puedes editar y eliminar destinos de cualquier operadora
              desde este módulo.
            </EmptyText>
          </EmptyState>
        ) : (
          <TablaDestinos
            SetopenRegistro={SetopenRegistro}
            setdataSelect={setdataSelect}
            setAccion={setAccion}
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
    "area1" auto
    "main" auto;
  .header {
    grid-area: header;
    display: flex;
    align-items: center;
  }
  .area1 {
    grid-area: area1;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .main {
    grid-area: main;
  }
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const RootBadge = styled.span`
  display: inline-flex;
  width: fit-content;
  padding: 4px 10px;
  border-radius: 999px;
  background: #eef2fa;
  color: #3a4b86;
  font-size: 0.82rem;
  font-weight: 600;
`;

const SelectorCard = styled.div`
  width: 100%;
  padding: 18px;
  border-radius: 14px;
  background: linear-gradient(135deg, #f8f9fc 0%, #eef2fa 100%);
  border: 1px solid #dce3f5;
`;

const SelectorLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #3a4b86;
  font-weight: 700;
`;

const SelectorRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const Selector = styled.select`
  min-width: 280px;
  flex: 1;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #c5cee0;
  background: #fff;
  color: #333;
  font-size: 1rem;
`;

const SelectorHint = styled.p`
  margin: 10px 0 0;
  color: #666;
  font-size: 0.92rem;
`;

const EmptyState = styled.div`
  margin-top: 24px;
  padding: 48px 24px;
  border-radius: 16px;
  background: #fff;
  border: 1px dashed #c5cee0;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 2.4rem;
  margin-bottom: 12px;
`;

const EmptyTitle = styled.h3`
  margin: 0 0 8px;
  color: #3a4b86;
`;

const EmptyText = styled.p`
  margin: 0;
  color: #666;
  max-width: 520px;
  margin-inline: auto;
  line-height: 1.6;
`;
