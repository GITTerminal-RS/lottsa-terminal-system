import { useState } from "react";
import styled, { keyframes } from "styled-components";
import { FaBuilding } from "react-icons/fa";
import { FiMapPin, FiClock, FiPhone, FiPackage, FiChevronDown } from "react-icons/fi";

export function AgenciasPublicas({ agencias = [] }) {
  const [expandedId, setExpandedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  if (!agencias.length) return null;

  const toggleCard = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <Section>
      <SectionHeader>
        <IconBadge>
          <FaBuilding />
        </IconBadge>
        <div>
          <SectionTitle>Nuestras agencias</SectionTitle>
          <SectionSubtitle>
            Encuentra nuestros puntos de atención y encomiendas
          </SectionSubtitle>
        </div>
      </SectionHeader>

      <AgenciasGrid>
        {agencias.map((agencia) => {
          const isExpanded = expandedId === agencia.id;
          const isHovered = hoveredId === agencia.id;

          return (
            <AgenciaCard
              key={agencia.id}
              type="button"
              $expanded={isExpanded}
              $hovered={isHovered}
              onClick={() => toggleCard(agencia.id)}
              onMouseEnter={() => setHoveredId(agencia.id)}
              onMouseLeave={() => setHoveredId(null)}
              aria-expanded={isExpanded}
            >
              <CardGlow $active={isExpanded || isHovered} />
              <CardTop>
                <OfficeIcon $active={isExpanded || isHovered}>
                  <FaBuilding />
                </OfficeIcon>
                <CardTitleBlock>
                  <CardLugar>{agencia.lugar}</CardLugar>
                  <CardHint>
                    {isExpanded ? "Toca para cerrar" : "Toca para ver detalles"}
                  </CardHint>
                </CardTitleBlock>
                <ExpandIcon $expanded={isExpanded}>
                  <FiChevronDown />
                </ExpandIcon>
              </CardTop>

              <CardPreview>
                {agencia.direccion && (
                  <PreviewItem>
                    <FiMapPin />
                    <span>{agencia.direccion}</span>
                  </PreviewItem>
                )}
                {agencia.hora_atencion && (
                  <PreviewItem>
                    <FiClock />
                    <span>{agencia.hora_atencion}</span>
                  </PreviewItem>
                )}
              </CardPreview>

              <CardDetails $expanded={isExpanded}>
                <DetailsInner>
                  {agencia.contactos && (
                    <DetailRow>
                      <DetailIcon><FiPhone /></DetailIcon>
                      <DetailContent>
                        <DetailLabel>Contactos</DetailLabel>
                        <DetailValue>{agencia.contactos}</DetailValue>
                      </DetailContent>
                    </DetailRow>
                  )}
                  {agencia.encomiendas_contacto && (
                    <DetailRow>
                      <DetailIcon><FiPackage /></DetailIcon>
                      <DetailContent>
                        <DetailLabel>Encomiendas</DetailLabel>
                        <DetailValue>{agencia.encomiendas_contacto}</DetailValue>
                      </DetailContent>
                    </DetailRow>
                  )}
                  {!agencia.contactos && !agencia.encomiendas_contacto && (
                    <DetailEmpty>Sin contactos adicionales registrados.</DetailEmpty>
                  )}
                </DetailsInner>
              </CardDetails>
            </AgenciaCard>
          );
        })}
      </AgenciasGrid>
    </Section>
  );
}

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Section = styled.section`
  width: 100%;
  margin: 0 0 48px 0;
  text-align: left;
  animation: ${fadeUp} 0.45s ease;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 28px;
`;

const IconBadge = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, #3a4b86 0%, #5b6eae 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 8px 20px rgba(58, 75, 134, 0.25);
  flex-shrink: 0;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.8rem;
  color: #3a4b86;
  font-weight: 700;
`;

const SectionSubtitle = styled.p`
  margin: 4px 0 0;
  color: #666;
  font-size: 1rem;
`;

const AgenciasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const AgenciaCard = styled.button`
  position: relative;
  display: block;
  width: 100%;
  text-align: left;
  border: 1px solid ${({ $expanded }) => ($expanded ? "#3a4b86" : "#e2e8f0")};
  border-radius: 16px;
  background: #fff;
  padding: 20px;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  transform: translateY(${({ $hovered, $expanded }) => ($hovered || $expanded ? "-4px" : "0")});
  box-shadow: ${({ $hovered, $expanded }) =>
    $hovered || $expanded
      ? "0 14px 30px rgba(58, 75, 134, 0.16)"
      : "0 4px 14px rgba(0, 0, 0, 0.06)"};

  &:focus-visible {
    outline: 3px solid rgba(58, 75, 134, 0.35);
    outline-offset: 2px;
  }
`;

const CardGlow = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(58, 75, 134, 0.12), transparent 55%);
  opacity: ${({ $active }) => ($active ? 1 : 0)};
  transition: opacity 0.25s ease;
  pointer-events: none;
`;

const CardTop = styled.div`
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 14px;
`;

const OfficeIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: ${({ $active }) => ($active ? "#fff" : "#3a4b86")};
  background: ${({ $active }) =>
    $active ? "linear-gradient(135deg, #3a4b86, #5b6eae)" : "#eef2fa"};
  transition: all 0.25s ease;
  flex-shrink: 0;
`;

const CardTitleBlock = styled.div`
  flex: 1;
  min-width: 0;
`;

const CardLugar = styled.h4`
  margin: 0;
  font-size: 1.15rem;
  color: #2c3e67;
  font-weight: 700;
  line-height: 1.3;
`;

const CardHint = styled.span`
  display: block;
  margin-top: 4px;
  font-size: 0.82rem;
  color: #8a94a6;
`;

const ExpandIcon = styled.div`
  color: #3a4b86;
  font-size: 1.2rem;
  transition: transform 0.25s ease;
  transform: rotate(${({ $expanded }) => ($expanded ? "180deg" : "0deg")});
  flex-shrink: 0;
`;

const CardPreview = styled.div`
  position: relative;
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const PreviewItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: #444;
  font-size: 0.95rem;
  line-height: 1.45;

  svg {
    color: #3a4b86;
    margin-top: 2px;
    flex-shrink: 0;
  }
`;

const CardDetails = styled.div`
  max-height: ${({ $expanded }) => ($expanded ? "220px" : "0")};
  opacity: ${({ $expanded }) => ($expanded ? 1 : 0)};
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.25s ease, margin 0.25s ease;
  margin-top: ${({ $expanded }) => ($expanded ? "16px" : "0")};
`;

const DetailsInner = styled.div`
  padding-top: 16px;
  border-top: 1px dashed #d7deec;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const DetailRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

const DetailIcon = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #f4f7fc;
  color: #3a4b86;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const DetailContent = styled.div`
  min-width: 0;
`;

const DetailLabel = styled.span`
  display: block;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #8a94a6;
  margin-bottom: 2px;
`;

const DetailValue = styled.span`
  display: block;
  color: #333;
  font-size: 0.96rem;
  line-height: 1.5;
  white-space: pre-line;
`;

const DetailEmpty = styled.p`
  margin: 0;
  color: #888;
  font-size: 0.92rem;
`;
