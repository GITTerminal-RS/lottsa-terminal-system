import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, flexRender } from "@tanstack/react-table";
import styled from "styled-components";
import { ContentAccionesTabla, Paginacion, v, Buscador } from "../../../index";
import Swal from "sweetalert2";
import { FaArrowsAltV } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useNoticiasStore } from '../../../store/NoticiasStore';

export default function TablaNoticias({ SetopenRegistro, setdataSelect, setAccion }) {
  const [pagina, setPagina] = useState(1);
  const { datanoticias, eliminarNoticia, cargarNoticias, buscador, setBuscador } = useNoticiasStore();

  useEffect(() => { cargarNoticias(); }, [buscador]);

  const editar = (data) => {
    setdataSelect(data);
    setAccion("Editar");
    SetopenRegistro(true);
  };

  const eliminar = async (p) => {
    const result = await Swal.fire({
      title: "¿Estás seguro(a)(e)?",
      text: "Una vez eliminado, ¡no podrá recuperar este registro!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, eliminar",
      cancelButtonText: "Cancelar"
    });
    if (result.isConfirmed) {
      await eliminarNoticia({ id: p.id });
    }
  };

  const columns = [
    {
      accessorKey: "contexto",
      header: "Contexto",
      cell: (info) => (
        <td data-title="Contexto" className="ContentCell">
          <span>{info.getValue() || ""}</span>
        </td>
      ),
    },
    {
      accessorKey: "descripcion",
      header: "Descripción",
      cell: (info) => (
        <td data-title="Descripción" className="ContentCell">
          <span>{info.getValue() || ""}</span>
        </td>
      ),
    },
    {
      accessorKey: "linknoticia",
      header: "Link Noticia",
      cell: (info) => (
        <td data-title="Link Noticia" className="ContentCell">
          <a href={info.getValue()} target="_blank" rel="noopener noreferrer">Ver</a>
        </td>
      ),
    },
    {
      accessorKey: "linkfoto",
      header: "Link Foto",
      cell: (info) => (
        <td data-title="Link Foto" className="ContentCell">
          <a href={info.getValue()} target="_blank" rel="noopener noreferrer">Ver</a>
        </td>
      ),
    },
    {
      accessorKey: "acciones",
      header: "Acciones",
      enableSorting: false,
      cell: (info) => (
        <td className="ContentCell">
          <ContentAccionesTabla
            funcionEditar={() => editar(info.row.original)}
            funcionEliminar={() => eliminar(info.row.original)}
          />
        </td>
      ),
    },
  ];

  const table = useReactTable({
    data: datanoticias || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageIndex: pagina - 1,
        pageSize: 10,
      },
    },
    onPaginationChange: (updater) => {
      let newPageIndex = typeof updater === 'function' ? updater({ pageIndex: pagina - 1, pageSize: 10 }).pageIndex : updater.pageIndex;
      setPagina(newPageIndex + 1);
    },
  });

  return (
    <Container>
      <div style={{ display: 'flex', justifyContent: 'end', marginBottom: 12 }}>
        <Buscador setBuscador={setBuscador} buscador={buscador} placeholder="Buscar noticia..." />
      </div>
      <table className="responsive-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.column.columnDef.header}
                  {header.column.getCanSort() && (
                    <span style={{cursor:"pointer"}} onClick={header.column.getToggleSortingHandler()}>
                      <FaArrowsAltV />
                    </span>
                  )}
                  {{ asc:" 🔼", desc:" 🔽" }[header.column.getIsSorted()]}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((item) => (
            <tr key={item.id}>
              {item.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <Paginacion table={table} irinicio={() => table.setPageIndex(0)}
        pagina={table.getState().pagination.pageIndex+1}
        setPagina={setPagina}
        maximo={table.getPageCount()}/>
    </Container>
  );
}
const Container = styled.div`
  position: relative;
  margin: 3% auto;
  max-width: 1089px;
  width: 100%;
  @media (min-width: ${v.bpbart}) {
    margin: 2% auto;
    max-width: 1089px;
  }
  @media (min-width: ${v.bphomer}) {
    margin: 2em auto;
    max-width: 1089px;
  }
  .responsive-table {
    width: 100%;
    margin-bottom: 1.5em;
    border-spacing: 0;
    border-collapse: collapse;
    @media (min-width: ${v.bpbart}) {
      font-size: 0.9em;
    }
    tbody tr {
      display: table-row;
    }
    tbody tr:not(:last-child) {
      border-bottom: 1px solid rgba(161, 161, 161, 0.32);
      @media (min-width: ${v.bpbart}) {
        border-bottom: 1px solid rgba(161, 161, 161, 0.32);
      }
    }
    thead tr th {
      border-bottom: 2px solid rgba(115, 115, 115, 0.32);
      font-weight: normal;
      text-align: center;
      color: ${({ theme }) => theme.text};
    }
  }
`; 