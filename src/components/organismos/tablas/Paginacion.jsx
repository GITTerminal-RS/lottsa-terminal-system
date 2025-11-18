import styled from "styled-components";
import { v } from "../../../index";

export function Paginacion({ table, pagina, setPagina, maximo }) {
  if (!table) return null;

  return (
    <Container>
      <div className="paginacion">
      <button
          onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
          className="btn"
      >
          <v.iconoanterior />
      </button>
        <span className="numeros">
          Página {pagina} de {maximo || table.getPageCount()}
        </span>
      <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="btn"
      >
          <v.iconosiguiente />
      </button>
      </div>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  gap: 10px;
  margin-top: 20px;

  .paginacion {
    display: flex;
    align-items: center;
    gap: 15px;
    background: ${({ theme }) => theme.bg};
    padding: 10px 20px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

    .btn {
      background: ${({ theme }) => theme.bg2};
    border: none;
      padding: 8px;
      border-radius: 5px;
      cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
      color: ${({ theme }) => theme.text};
      transition: all 0.3s ease;
      width: 32px;
      height: 32px;

      svg {
        width: 16px;
        height: 16px;
      }

      &:hover:not(:disabled) {
        background: ${({ theme }) => theme.primary};
        color: white;
        transform: scale(1.1);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .numeros {
      color: ${({ theme }) => theme.text};
      font-size: 14px;
      min-width: 120px;
    text-align: center;
    }
  }

  @media (max-width: 768px) {
    .paginacion {
      padding: 8px 15px;
      gap: 10px;

      .numeros {
        font-size: 12px;
        min-width: 100px;
      }
      
      .btn {
        width: 28px;
        height: 28px;
        
        svg {
          width: 14px;
          height: 14px;
      }
    }
  }
  }
`;
