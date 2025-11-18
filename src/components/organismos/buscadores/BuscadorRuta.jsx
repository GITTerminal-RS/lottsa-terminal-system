import { useEffect, useState } from "react";
import styled from "styled-components";
import { InputText, useRutaStore, v } from "../../../index";
import { useOperadoraStore } from "../../../store/OperadoraStore";

export function BuscadorRuta() {
  const { setBuscador, buscarRuta, parametros } = useRutaStore();
  const { dataoperadora } = useOperadoraStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      try {
        if (dataoperadora?.id) {
          const searchParams = {
            id_operadora: dataoperadora.id,
            descripcion: searchTerm.trim(),
            precio: searchTerm.trim() ? parseFloat(searchTerm) || 0 : null,
            precioespecial: searchTerm.trim() ? parseFloat(searchTerm) || 0 : null
          };
          
          console.log("Buscando rutas con parámetros:", searchParams);
          const results = await buscarRuta(searchParams);
          console.log("Resultados de búsqueda:", results);
        }
      } catch (error) {
        console.error("Error en búsqueda:", error);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, dataoperadora?.id]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setBuscador(value);
  };

  return (
    <Container>
      <section className="area1">
        <InputText icono={<v.iconobuscar />}>
          <input
            className="form__field"
            type="text"
            placeholder=""
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <label className="form__label">Buscar ruta</label>
        </InputText>
      </section>
    </Container>
  );
}

const Container = styled.div`
  min-height: 65px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme }) => theme.bg};
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;

  .area1 {
    width: 100%;
    max-width: 400px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    padding: 15px;

    .area1 {
      max-width: 100%;
    }
  }
`; 