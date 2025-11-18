import styled from "styled-components";
import { useUsuariosStore } from "../store/UsuariosStore";
import { useOperadoraStore } from "../store/OperadoraStore";
import { useQuery } from "@tanstack/react-query";
import {  useState } from "react";
import { Sidebar } from "../components/organismos/sidebar/Sidebar";
import { MenuHambur } from "../components/organismos/MenuHambur";
import { Device } from "../styles/breackpoints";
import { SpinnerLoader } from "../components/moleculas/SpinnerLoader";
import { ErrorMolecula } from "../components/moleculas/ErrorMolecula";
export function Layout({children}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { mostrarUsuarios, mostrarpermisos,idusuario } = useUsuariosStore();
  const { mostrarOperadora } = useOperadoraStore()
  const { data: datausuarios, isLoading, error } = useQuery({
    queryKey: ["mostrar usuarios"],
    queryFn: mostrarUsuarios,
  });
  const { data: dataoperadora } = useQuery({ queryKey: ["mostrar operadora"], queryFn: () => mostrarOperadora({ iduseradmin: idusuario }), enabled: !!datausuarios })
  const { data: datapermisos } = useQuery({ queryKey: ["mostrar permisos", { id_usuario: idusuario }], queryFn: () => mostrarpermisos({ id_usuario: idusuario }), enabled: !!datausuarios })

  // Mostrar en consola los permisos cargados
  console.log('Permisos cargados para el usuario:', idusuario, datapermisos);

  if (isLoading) {
    return <SpinnerLoader />
  }
  if (error) {
    return <ErrorMolecula mensaje={error.message} />
  }
  return (
    <Container className={sidebarOpen ? "active" : ""}>
      <div className="ContentSidebar">
        <Sidebar
          state={sidebarOpen}
          setState={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>
      <div className="ContentMenuambur">
        <MenuHambur />
      </div>

      <Containerbody> {children}</Containerbody>
    </Container>
  );
}
const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  background: ${({ theme }) => theme.bgtotal};
  transition: all 0.2s ease-in-out;

  .ContentSidebar {
    display: none;
  }
  .ContentMenuambur {
    display: block;
    position: absolute;
    left: 20px;
  }
  @media ${Device.tablet} {
    grid-template-columns: 65px 1fr;
    &.active {
      grid-template-columns: 220px 1fr;
    }
    .ContentSidebar {
      display: initial;
    }
    .ContentMenuambur {
      display: none;
    }
  }
`;
const Containerbody = styled.div`
  grid-column: 1;
  width: 100%;
  @media ${Device.tablet} {
    grid-column: 2;
  }
`;