import { useQuery } from "@tanstack/react-query";
import { HomeTemplate, useOperadoraStore } from "../index";
export function Home() {
  const {contarusuariosXoperadora,dataoperadora} = useOperadoraStore();
  const {data,isLoading} = useQuery({queryKey:["contar usuarios por operadora",{idoperadora:dataoperadora?.id}],queryFn:()=>contarusuariosXoperadora({id_operadora:dataoperadora?.id}),enabled:!!dataoperadora})
  return (<HomeTemplate/>);
}
