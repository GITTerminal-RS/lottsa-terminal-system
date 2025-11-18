import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, flexRender } from "@tanstack/react-table";
import styled from "styled-components";
import { ContentAccionesTabla, Paginacion, v, Buscador } from "../../../index";
import Swal from "sweetalert2";
import { FaArrowsAltV } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useCarteleraQuery } from '../../../hooks/useCarteleraQuery';

export default function TablaCartelera({ SetopenRegistro, setdataSelect, setAccion }) {
  const [pagina, setPagina] = useState(1);
  
  // 🚀 TanStack Query: Hook optimizado para cartelera
  const { 
    datacartelera, 
    eliminarCartelera, 
    buscador, 
    setBuscador,
    isLoading,
    isDeleting,
    error 
  } = useCarteleraQuery();

  // ✅ Ya no necesitamos useEffect manual - TanStack Query maneja automáticamente

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
      // 🚀 Mutación optimista - UI se actualiza instantáneamente
      eliminarCartelera(p.id);
    }
  };

  const columns = [
    {
      accessorKey: "titulo",
      header: "Título",
      size: 200,
      minSize: 120,
      cell: (info) => (
        <td data-title="Título" className="ContentCell">
          <span>{info.getValue() || ""}</span>
        </td>
      ),
    },
    {
      accessorKey: "edicion",
      header: "Edición",
      size: 140,
      minSize: 100,
      cell: (info) => (
        <td data-title="Edición" className="ContentCell">
          <span>{info.getValue() || ""}</span>
        </td>
      ),
    },
    {
      accessorKey: "fechafin_inicio",
      header: "Fechas",
      size: 180,
      minSize: 120,
      cell: (info) => (
        <td data-title="Fechas" className="ContentCell">
          <span style={{ fontSize: '13px' }}>{info.getValue() || ""}</span>
        </td>
      ),
    },
    {
      accessorKey: "ciudad_provincia",
      header: "Ciudad/Provincia",
      size: 160,
      minSize: 120,
      cell: (info) => (
        <td data-title="Ciudad/Provincia" className="ContentCell">
          <span>{info.getValue() || ""}</span>
        </td>
      ),
    },
    {
      accessorKey: "responsable",
      header: "Responsable",
      size: 160,
      minSize: 120,
      cell: (info) => (
        <td data-title="Responsable" className="ContentCell">
          <span>{info.getValue() || ""}</span>
        </td>
      ),
    },
    {
      accessorKey: "acciones",
      header: "Acciones",
      size: 110,
      minSize: 60,
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
    data: datacartelera || [],
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

  // 🚀 Estados de loading y error optimizados
  if (error) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#e74c3c' }}>
          <h3>❌ Error al cargar cartelera</h3>
          <p>{error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              background: '#3a4b86', 
              color: 'white', 
              border: 'none', 
              padding: '8px 16px', 
              borderRadius: '4px',
              cursor: 'pointer' 
            }}
          >
            Reintentar
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div style={{ display: 'flex', justifyContent: 'end', marginBottom: 12 }}>
        <Buscador setBuscador={setBuscador} buscador={buscador} placeholder="Buscar cartelera..." />
      </div>
      
      {/* 🔄 Loading overlay */}
      {isLoading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px', 
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderRadius: '8px',
          marginBottom: '12px'
        }}>
          <div>🔄 Cargando cartelera...</div>
        </div>
      )}
      
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