import { Routes, Route, BrowserRouter, useNavigate } from "react-router-dom";
import {
  Configuracion,
  ErrorMolecula,
  Home,
  Login,
  Ruta,
  ProtectedRoute,
  SpinnerLoader,
  UserAuth,
  useOperadoraStore,
  useUsuariosStore,
  Horarios,
  Destinos,
  Usuarios,
  Reportes,
  Operadora,
  Informativa,
  DestinoBusquedaTemplate,
  Cooperativas,
  DestinosOperadora,
  Publicidad,
} from "../index";
import { useQuery } from "@tanstack/react-query";
import StockActualTodos from "../components/organismos/report/StockActualTodos";
import StockActualPorDestino from "../components/organismos/report/StockActualPorDestino";
import StockBajoMinimo from "../components/organismos/report/StockBajoMinimo";
import StockInventarioValorado from "../components/organismos/report/StockInventarioValorado";
import { Layout } from "../hooks/Layout";
import DescubreViajaTemplate from '../components/templates/DescubreViajaTemplate';
import CarteleraPortadaTemplate from '../components/templates/CarteleraPortadaTemplate';
import { RegistrarSuperadminRoot } from '../components/organismos/fomularios/RegistrarSuperadminRoot';
import { Cartelera } from '../pages/Cartelera';
import Noticias from '../pages/Noticias';
import Malla from '../pages/Malla';

// Wrapper component para DescubreViajaTemplate con navegación optimizada
function DescubreViajaTemplateWrapper() {
  const navigate = useNavigate();
  
  const handleClose = () => {
    // Usar navigate en lugar de window.location.href para evitar recarga completa
    navigate('/', { replace: true });
  };
  
  return <DescubreViajaTemplate onClose={handleClose} />;
}

export function MyRoutes() {
  return (
    <Routes>
      {/* Ruta informativa pública (ahora protegida para autenticados) */}
      <Route path="/" element={
        <ProtectedRoute accessBy="non-authenticated">
          <Informativa />
        </ProtectedRoute>
      } />

      {/* Ruta de login */}
      <Route path="/login" element={<ProtectedRoute accessBy="non-authenticated">
        <Login />
      </ProtectedRoute>} />

      {/* Ruta de gestión (protegida) */}
      <Route path="/gestion" element={<ProtectedRoute accessBy="authenticated">
        <Layout>
          <Home />
        </Layout>
      </ProtectedRoute>} />

      {/* Resto de rutas protegidas */}
      <Route path="/configurar" element={<ProtectedRoute accessBy="authenticated">
        <Layout>
          <Configuracion />
        </Layout>
      </ProtectedRoute>} />

      <Route path="/configurar/ruta" element={<ProtectedRoute accessBy="authenticated">
        <Layout>
        <Ruta />
        </Layout>
      </ProtectedRoute>} />
        
      <Route path="/configurar/horarios" element={<ProtectedRoute accessBy="authenticated">
        <Layout>
        <Horarios />
        </Layout>
      </ProtectedRoute>} />

      <Route path="/configurar/destinos" element={<ProtectedRoute accessBy="authenticated">
        <Layout>
        <Destinos />
        </Layout>
      </ProtectedRoute>} />

      <Route path="/configurar/personal" element={<ProtectedRoute accessBy="authenticated">
        <Layout>
        <Usuarios />
        </Layout>
      </ProtectedRoute>} />
      <Route path="/configurar/operadora" element={<ProtectedRoute accessBy="authenticated">
        <Layout>
        <Operadora />
        </Layout>
      </ProtectedRoute>} />

      {/* <Route path="/kardex" element={<ProtectedRoute accessBy="authenticated">
        <Layout>
        <Kardex />
        </Layout>
      </ProtectedRoute>} /> */}

      <Route path="/reportes" element={<ProtectedRoute accessBy="authenticated">
        <Layout>
        <Reportes />
        </Layout>
      </ProtectedRoute>} > 
      <Route path="stock-actual-todos" element={<StockActualTodos />} />
        <Route path="stock-actual-por-destino" element={<StockActualPorDestino />} />
      {/* <Route path="stock-bajo-minimo" element={<StockBajoMinimo />} /> */}
      {/* <Route path="kardex-entradas-salidas" element={<KardexEntradaSalida />} /> */}
      {/* <Route path="inventario-valorado" element={<StockInventarioValorado />} /> */}
      </Route>

      {/* Nueva ruta para "Mi Destino" */}
      <Route path="/mi-destino" element={<DestinoBusquedaTemplate />} />
      
      {/* Nueva ruta para "Cooperativas" */}
      <Route path="/cooperativas" element={<Cooperativas />} />
      
      {/* Nueva ruta para "Destinos de Operadora" */}
      <Route path="/destinos-operadora/:id" element={<DestinosOperadora />} />
      
      {/* Nueva ruta para 'Descubre y Viaja' */}
      <Route path="/descubre-viaja" element={<DescubreViajaTemplateWrapper />} />
      
      {/* Nueva ruta para 'Cartelera' */}
      <Route path="/cartelera" element={<CarteleraPortadaTemplate />} />
      
      {/* Ruta exclusiva para root para registrar superadmins */}
      <Route path="/root/registrar-superadmin" element={<ProtectedRoute accessBy="authenticated"><RegistrarSuperadminRoot /></ProtectedRoute>} />
      
      <Route path="/configurar/cartelera" element={<ProtectedRoute accessBy="authenticated">
        <Layout>
        <Cartelera />
        </Layout>
      </ProtectedRoute>} />
      
      <Route path="/configurar/noticias" element={<Noticias />} />
      
      <Route path="/configurar/malla" element={<Malla />} />
      
      <Route path="/configurar/publicidad" element={<ProtectedRoute accessBy="authenticated">
        <Layout>
          <Publicidad />
        </Layout>
      </ProtectedRoute>} />
      
      
    </Routes>
  );
}
