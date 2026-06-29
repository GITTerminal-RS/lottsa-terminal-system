import { useOperadoraStore } from "../store/OperadoraStore";

export function useOperadoraActiva() {
  const dataoperadora = useOperadoraStore((state) => state.dataoperadora);
  const operadoraContexto = useOperadoraStore((state) => state.operadoraContexto);
  return dataoperadora?.id ? dataoperadora : operadoraContexto;
}
