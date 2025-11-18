import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from 'react-hot-toast';
import styled, { ThemeProvider } from "styled-components";
import {
  AuthContextProvider,
  MyRoutes,
  Light,
  Dark,
  Sidebar,
  MenuHambur,
  Login,
} from "./index";

import { createContext, useState } from "react";
import { Device } from "./styles/breackpoints";
import { useLocation } from "react-router-dom";

// QueryClient global para toda la aplicación pública
const globalQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      notifyOnChangeProps: ['data', 'error'],
    },
  },
});

export const ThemeContext = createContext(null);
function App() {
  const [themeuse, setTheme] = useState("light");
  const theme = themeuse === "light" ? "light" : "dark";
  const themeStyle = theme === "light" ? Light : Dark;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  return (
    <>
      <QueryClientProvider client={globalQueryClient}>
        <ThemeContext.Provider value={{ theme, setTheme }}>
          <ThemeProvider theme={themeStyle}>
            <AuthContextProvider>
              <MyRoutes />
              <ReactQueryDevtools initialIsOpen={false} />
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: themeStyle.bgcards,
                    color: themeStyle.text,
                    border: `1px solid ${themeStyle.bg3}`,
                  },
                }}
              />
            </AuthContextProvider>
          </ThemeProvider>
        </ThemeContext.Provider>
      </QueryClientProvider>
    </>
  );
}
const Container = styled.main`
  display: grid;
  grid-template-columns: 1fr;
  background-color: ${({ theme }) => theme.bgtotal};
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
  .ContentRoutes {
    grid-column: 1;
    width: 100%;
    @media ${Device.tablet} {
      grid-column: 2;
    }
  }
`;

export default App;
