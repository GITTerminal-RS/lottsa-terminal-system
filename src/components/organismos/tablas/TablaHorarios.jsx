import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import styled from "styled-components";
import {
  Colorcontent,
  ColorcontentTable,
  ContentAccionesTabla,
  Paginacion,
  useHorariosStore,
  v,
  useOperadoraStore,
  Buscador,
} from "../../../index";
import Swal from "sweetalert2";
import { FaArrowsAltV } from "react-icons/fa";
import { useState, useEffect } from "react";

export function TablaHorarios({
  SetopenRegistro,
  setdataSelect,
  setAccion,
}) {
  const [pagina, setPagina] = useState(1);
  const [globalFilter, setGlobalFilter] = useState("");
  const { eliminarhorarios, mostrarhorariosagrupados, datahorarios } = useHorariosStore();
  const { dataoperadora } = useOperadoraStore();

  useEffect(() => {
    if (dataoperadora?.id) {
      mostrarhorariosagrupados({ id_operadora: dataoperadora.id });
    }
  }, [dataoperadora?.id]);

  const columns = [
    {
      accessorKey: "descripcion_destino",
      header: "Destino",
      cell: (info) => (
        <td data-title="Destino" className="ContentCell">
          <div className="cell-scrollable" style={{ width: '100%' }}>
            <div style={{
              fontSize: '1.1em',
              fontWeight: '500',
              color: '#2196F3',
              textAlign: 'left'
            }}>
              {info.getValue() || "Sin destino"}
            </div>
            {info.row.original.direcciondestino && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '6px',
                fontSize: '0.9em',
                color: '#666',
                textAlign: 'left'
              }}>
                <span style={{ marginTop: '2px' }}>📍</span>
                <span>{info.row.original.direcciondestino}</span>
              </div>
            )}
          </div>
        </td>
      ),
      filterFn: (row, id, value) => {
        const descripcion = row.getValue(id)?.toLowerCase() || "";
        return descripcion.includes(value.toLowerCase());
      }
    },
    {
      accessorKey: "horarios",
      header: "Horarios",
      cell: (info) => {
        const horarios = info.row.original.horarios || [];
        return (
          <td data-title="Horarios" className="ContentCell">
            <div className="cell-scrollable" style={{ width: '100%' }}>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              width: '100%'
            }}>
              {horarios.length > 0 ? (
                horarios.map((horario) => (
                  <div 
                    key={horario.id} 
                    style={{ 
                      padding: '6px 12px', 
                      borderRadius: '6px',
                      fontSize: '0.9em',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      color: horario.color || "#fc6027",
                      fontWeight: '500',
                      textAlign: 'center',
                      wordBreak: 'break-word',
                      border: `1px solid ${horario.color || "#fc6027"}`,
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: horario.color || "#fc6027",
                        color: 'white'
                      }
                    }}
                  >
                    <span>🕒</span>
                    {horario.descripcion}
                  </div>
                ))
              ) : (
                <div style={{
                  gridColumn: '1 / -1',
                  padding: '8px 16px',
                  fontSize: '0.9em',
                  color: '#757575',
                  textAlign: 'center',
                  fontStyle: 'italic'
                }}>
                  Sin horarios registrados
                </div>
              )}
              </div>
            </div>
          </td>
        );
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      enableSorting: false,
      cell: (info) => (
        <td data-title="Acciones" className="ContentCell">
          <ContentAccionesTabla
            funcionEditar={() => {
              setdataSelect({
                ...info.row.original,
                descripcion: info.row.original.descripcion_destino
              });
              setAccion("Editar");
              SetopenRegistro(true);
            }}
          />
        </td>
      ),
    },
  ];

  const table = useReactTable({
    data: datahorarios,
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
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const descripcion = row.getValue("descripcion_destino")?.toLowerCase() || "";
      return descripcion.includes(filterValue.toLowerCase());
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({
          pageIndex: pagina - 1,
          pageSize: 10,
        });
        setPagina(newState.pageIndex + 1);
      } else if (typeof updater === "object" && updater.pageIndex !== undefined) {
        setPagina(updater.pageIndex + 1);
      }
    },
  });

  return (
    <Container>
      <div className="AreaBuscador">
        <Buscador setBuscador={setGlobalFilter} />
      </div>

      <table className="responsive-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.column.columnDef.header}
                  {header.column.getCanSort() && (
                    <span
                      style={{ cursor: "pointer" }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <FaArrowsAltV />
                    </span>
                  )}
                  {{
                    asc: " 🔼",
                    desc: " 🔽",
                  }[header.column.getIsSorted()] ?? null}
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
      <Paginacion
        table={table}
        irinicio={() => table.setPageIndex(0)}
        pagina={table.getState().pagination.pageIndex + 1}
        setPagina={setPagina}
        maximo={table.getPageCount()}
      />
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  margin: 5% 3%;
  @media (min-width: ${v.bpbart}) {
    margin: 2%;
  }
  @media (min-width: ${v.bphomer}) {
    margin: 2em auto;
  }

  .AreaBuscador {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 0; 
    padding: 0 1rem;
  }

  .responsive-table {
    width: 100%;
    margin-bottom: 1.5em;
    border-spacing: 0;
    @media (min-width: ${v.bpbart}) {
      font-size: 0.9em;
    }
    @media (min-width: ${v.bpmarge}) {
      font-size: 1em;
    }

    thead {
      position: absolute;
      padding: 0;
      border: 0;
      height: 1px;
      width: 1px;
      overflow: hidden;
      @media (min-width: ${v.bpbart}) {
        position: relative;
        height: auto;
        width: auto;
        overflow: auto;
      }
      th {
        border-bottom: 2px solid rgba(115, 115, 115, 0.32);
        font-weight: normal;
        text-align: center; /* Centrar cabecera */
        color: ${({ theme }) => theme.text};
        &:first-of-type {
          text-align: center;
        }
      }
    }

    tbody,
    tr,
    th,
    td {
      display: block;
      padding: 0;
      text-align: left;
      white-space: normal;
    }

    tr {
      @media (min-width: ${v.bpbart}) {
        display: table-row;
      }
    }

    th,
    td {
      padding: 0.8em 0.5em;
      vertical-align: middle;
      @media (min-width: ${v.bplisa}) {
        padding: 1em 0.5em;
      }
      @media (min-width: ${v.bpbart}) {
        display: table-cell;
        padding: 0.8em 0.5em;
      }
      @media (min-width: ${v.bpmarge}) {
        padding: 1em 0.5em;
      }
      @media (min-width: ${v.bphomer}) {
        padding: 1em;
      }
      text-align: left;
    }

    tbody {
      @media (min-width: ${v.bpbart}) {
        display: table-row-group;
      }
      tr {
        margin-bottom: 1em;
        @media (min-width: ${v.bpbart}) {
          display: table-row;
          border-width: 1px;
        }
        &:last-of-type {
          margin-bottom: 0;
        }
        &:nth-of-type(even) {
          @media (min-width: ${v.bpbart}) {
            background-color: rgba(78, 78, 78, 0.12);
          }
        }
      }
      .ContentCell {
        text-align: justify; /* Justificar registros */
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        border-bottom: 1px solid rgba(161, 161, 161, 0.32);
        @media (min-width: ${v.bpbart}) {
          justify-content: flex-start;
          border-bottom: none;
        }
      }
      td {
        text-align: justify; /* Justificar registros */
        @media (min-width: ${v.bpbart}) {
          border-bottom: 1px solid rgba(161, 161, 161, 0.32);
          text-align: justify;
        }
      }
      .cell-scrollable {
        display: block;
        max-height: 4.5em; /* Aproximadamente 3 líneas */
        overflow-y: auto;
        line-height: 1.5em;
        word-break: break-word;
        white-space: pre-line;
        scrollbar-width: thin;
        scrollbar-color: #bdbdbd #f5f5f5;
      }
      .cell-scrollable::-webkit-scrollbar {
        width: 6px;
      }
      .cell-scrollable::-webkit-scrollbar-thumb {
        background: #bdbdbd;
        border-radius: 4px;
        }
      .cell-scrollable::-webkit-scrollbar-track {
        background: #f5f5f5;
      }
    }
  }
`;
