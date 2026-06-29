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
  useDestinosStore,
  v,
  MostrarHorariosXDestino,
  Buscador
} from "../../../index";
import Swal from "sweetalert2";
import { FaArrowsAltV } from "react-icons/fa";
import { useState } from "react";

export function TablaDestinos({
  SetopenRegistro,
  setdataSelect,
  setAccion,
}) {
  const [pagina, setPagina] = useState(1);
  const { eliminardestinos, actualizarTabla, datadestinos, buscador, setBuscador } = useDestinosStore();

  console.log("TablaDestinos - datadestinos:", datadestinos);
  console.log("TablaDestinos - buscador (from store):", buscador);

  const editar = async (data) => {
    try {
      if (!data) {
        console.error("No hay datos para editar");
        return;
      }

      if (data.descripcion === "Generica") {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Esta registro no se permite modificar ya que es valor por defecto.",
          timer: 2000,
          showConfirmButton: false
        });
        return;
      }

      // Obtener los horarios del destino
      const horarios = await MostrarHorariosXDestino(data.id);
      console.log("Horarios obtenidos para el destino:", horarios);

      // Preparar los datos para la edición
      setdataSelect({
        id: data.id,
        descripcion: data.descripcion,
        provinciadestino: data.provinciadestino,
        ciudaddestino: data.ciudaddestino,
        direcciondestino: data.direcciondestino,
        idruta: data.idruta,
        ruta: data.ruta,
        id_operadora: data.id_operadora,
        frecuenciapaso: data.frecuenciapaso || null,
        horarios: horarios || [] // Agregar los horarios al objeto de datos
      });
      
      setAccion("Editar");
      SetopenRegistro(true);
    } catch (error) {
      console.error("Error al editar:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo abrir el formulario de edición",
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  const eliminar = async (p) => {
    try {
      if (!p) {
        console.error("No hay datos para eliminar");
        return;
      }

    if (p.descripcion === "Generica") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Este registro no se permite eliminar ya que es valor por defecto.",
          timer: 2000,
          showConfirmButton: false
      });
      return;
    }

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
        await eliminardestinos({ id: p.id });
        // La actualización de la tabla ahora se maneja dentro de eliminardestinos
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar el registro",
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  const columns = [
    {
      accessorKey: "descripcion",
      header: "Destino",
      size: 200,
      minSize: 100,
      cell: (info) => (
        <td data-title="Destino" className="ContentCell">
          <span className="cell-scrollable">{info.getValue() || ""}</span>
        </td>
      ),
    },
    {
      accessorKey: "provinciadestino",
      header: "Provincia",
      size: 280,
      minSize: 240,
      cell: (info) => (
        <td data-title="Provincia" className="ContentCell">
          <span className="cell-scrollable">{info.getValue() || "Sin provincia"}</span>
        </td>
      ),
    },
    {
      accessorKey: "ciudaddestino",
      header: "Ciudad",
      size: 140,
      minSize: 100,
      cell: (info) => (
        <td data-title="Ciudad" className="ContentCell">
          <span className="cell-scrollable">{info.getValue() || "Sin ciudad"}</span>
        </td>
      ),
    },
    {
      accessorKey: "direcciondestino",
      header: "Dirección",
      size: 250,
      minSize: 180,
      cell: (info) => (
        <td data-title="Dirección" className="ContentCell">
          <span className="cell-scrollable">{info.getValue() || "Sin dirección"}</span>
        </td>
      ),
    },
    {
      accessorKey: "ruta",
      header: "Ruta",
      size: 120,
      minSize: 80,
      cell: (info) => (
        <td data-title="Ruta" className="ContentCell">
          <span className="cell-scrollable">{info.getValue() || "Sin ruta"}</span>
        </td>
      ),
    },
    // Eliminada la columna de frecuencia
    {
      accessorKey: "acciones",
      header: "Acciones",
      enableSorting: false,
      size: 120,
      minSize: 100,
      cell: (info) => (
        <td data-title="Acciones" className="ContentCell">
          <ContentAccionesTabla
            editar={() => editar(info.row.original)}
            eliminar={() => eliminar(info.row.original)}
          />
        </td>
      ),
    },
  ];

  const table = useReactTable({
    data: datadestinos,
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
      globalFilter: buscador,
    },
    onGlobalFilterChange: setBuscador,
    globalFilterFn: (row, columnId, filterValue) => {
      console.log("globalFilterFn - filterValue:", filterValue);
      console.log("globalFilterFn - row.original:", row.original);
      const descripcion = row.getValue("descripcion")?.toLowerCase() || "";
      const provincia = row.getValue("provinciadestino")?.toLowerCase() || "";
      const ciudad = row.getValue("ciudaddestino")?.toLowerCase() || "";
      const direccion = row.getValue("direcciondestino")?.toLowerCase() || "";
      const ruta = row.getValue("ruta")?.toLowerCase() || "";
      
      const match = (
        descripcion.includes(filterValue.toLowerCase()) ||
        provincia.includes(filterValue.toLowerCase()) ||
        ciudad.includes(filterValue.toLowerCase()) ||
        direccion.includes(filterValue.toLowerCase()) ||
        ruta.includes(filterValue.toLowerCase())
      );
      console.log("globalFilterFn - row match:", match, "for row:", row.original.descripcion);
      return match;
    },
    onPaginationChange: (updater) => {
      let newPageIndex = typeof updater === 'function' ? updater({ pageIndex: pagina - 1, pageSize: 10 }).pageIndex : updater.pageIndex;
      setPagina(newPageIndex + 1);
    },
  });

  return (
    <Container>
      <div className="AreaBuscador">
        <Buscador setBuscador={setBuscador} />
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
                  {
                    {
                      asc: " 🔼",
                      desc: " 🔽",
                    }[header.column.getIsSorted()]
                  }
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
    /* max-width: ${v.bphomer}; */
  }
  .AreaBuscador {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 0;
    padding: 0 1rem;
    max-width: 300px;
    width: 100%;
    margin-left: auto;
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
        white-space: nowrap;
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
      padding: 0.5em;
      vertical-align: middle;
      @media (min-width: ${v.bplisa}) {
        padding: 0.75em 0.5em;
      }
      @media (min-width: ${v.bpbart}) {
        display: table-cell;
        padding: 0.5em;
      }
      @media (min-width: ${v.bpmarge}) {
        padding: 0.75em 0.5em;
      }
      @media (min-width: ${v.bphomer}) {
        padding: 0.75em;
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
      th[scope="row"] {
        @media (min-width: ${v.bplisa}) {
          border-bottom: 1px solid rgba(161, 161, 161, 0.32);
        }
        @media (min-width: ${v.bpbart}) {
          background-color: transparent;
          text-align: center;
          color: ${({ theme }) => theme.text};
        }
      }
      .ContentCell {
        text-align: justify; /* Justificar registros */
        display: flex;
        justify-content: flex-start;
        align-items: center;
        height: 50px;
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
      td[data-title]:before {
        content: attr(data-title);
        float: left;
        font-size: 0.8em;
        @media (min-width: ${v.bplisa}) {
          font-size: 0.9em;
        }
        @media (min-width: ${v.bpbart}) {
          content: none;
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
