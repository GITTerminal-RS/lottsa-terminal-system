import { NavLink, Outlet } from "react-router-dom";
import styled from "styled-components";

export function ReportesTemplate() {

  return (
    <Container>
      <PageContainer>
        <Content>
          <Outlet />
        </Content>
        <Sidebar>
          <SidebarSection>
            <SidebarTitle>Almacen de reportes</SidebarTitle>
            <SidebarItem to="stock-actual-todos">Todos los destinos</SidebarItem>
            <SidebarItem to="stock-actual-por-destino">Destino por provincia</SidebarItem>
            
          </SidebarSection>
          {/*<SidebarSection>
            <SidebarTitle> Entradas y salidas</SidebarTitle>
            <SidebarItem to="kardex-entradas-salidas">Por destino</SidebarItem>
          </SidebarSection>
          <SidebarSection>
          <SidebarTitle>Valorizado</SidebarTitle>
          <SidebarItem to="inventario-valorado">Por destino</SidebarItem>

          </SidebarSection>*/}
        </Sidebar>
      </PageContainer>

    </Container>
  );
}
const Content = styled.div`
  padding: 25px;
  border-radius: 12px;
  margin: 20px;
  flex: 1;
  `;
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1400px;
  justify-content: center;
  width: 100%;
  @media (min-width: 768px){
    flex-direction: row;
    gap: 20px;
  }
  `;
const Container = styled.div`
  min-height: 100vh;
  padding: 15px;
  width: 100%;
  color:${({ theme }) => theme.text};

`;
const Sidebar = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  @media (min-width: 768px){
    width: 320px;
  order: 2;
  }
`;
const SidebarSection = styled.div`
  margin-bottom: 25px;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.color2};
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const SidebarTitle = styled.h3`
  margin-bottom: 25px;
  font-size: 1.2em;
  color: ${({ theme }) => theme.color1};
  font-weight: 600;
  padding: 0 10px;
  text-align: center;
  line-height: 1.4;
  word-wrap: break-word;
  width: 100%;
  box-sizing: border-box;
`;
const SidebarItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  border-radius: 12px;
  cursor: pointer;
  margin: 8px 0;
  text-decoration: none;
  color: ${(props) => props.theme.text};
  height: 55px;
  font-size: 1em;
  transition: all 0.2s ease;
  
  &:hover{
    color: ${(props) => props.theme.colorSubtitle};
    background: ${(props) => props.theme.bg6}40;
  }
  
  &.active{
    background: ${(props) => props.theme.bg6};
    border: 2px solid ${(props) => props.theme.bg5};
    color: ${(props) => props.theme.color1};
    font-weight: 600;
    transform: translateX(5px);
    } 
`;

