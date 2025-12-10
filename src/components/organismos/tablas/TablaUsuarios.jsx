import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import styled from "styled-components";
import { ContentAccionesTabla, Paginacion, useRutaStore, useUsuariosStore, v } from "../../../index";
import Swal from "sweetalert2";
import { FaArrowsAltV } from "react-icons/fa";
import { useState, useEffect } from "react";
import { MostrarUsuarios } from '../../../supabase/crudUsuarios';
import { useOperadoraStore } from '../../../store/OperadoraStore';
import { ContentAccionesTablaUsuarios } from '../ContentAccionesTablaUsuarios';
import { CambiarClaveUsuarioModal } from '../../modals/CambiarClaveUsuarioModal';

export function TablaUsuarios({
  data,
  SetopenRegistro,
  setdataSelect,
  setAccion,
}) {
  const [pagina, setPagina] = useState(1);
  const { eliminarusuarios } = useUsuariosStore();
  const [tipoUsuarioActual, setTipoUsuarioActual] = useState("");
  const { dataoperadora } = useOperadoraStore();
  const [usuarioActual, setUsuarioActual] = useState(null);
  
  // Estados para el modal de cambiar clave
  const [modalCambiarClaveOpen, setModalCambiarClaveOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  useEffect(() => {
    async function getTipoUsuario() {
      const usuario = await MostrarUsuarios();
      setTipoUsuarioActual(usuario?.tipouser || "");
      setUsuarioActual(usuario);
    }
    getTipoUsuario();
  }, []);

  const editar = (data) => {
    // Si es root, solo puede editar superadmin
    if (tipoUsuarioActual === "root") {
      if (data.tipouser !== "superadmin") {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Solo puedes editar usuarios superadmin desde root.",
        });
        return;
      }
    } else if (tipoUsuarioActual === "superadmin") {
      // Si es superadmin, no puede editar otros superadmin, pero sí a sí mismo
      if (data.tipouser === "superadmin" && usuarioActual && data.id !== usuarioActual.id) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "No puedes editar otros superadmin.",
        });
        return;
      }
      // Puede editar administradores y empleados de su operadora, y a sí mismo
    }
    SetopenRegistro(true);
    setdataSelect(data);
    setAccion("Editar");
  };
  const eliminar = (p) => {
    // Solo root puede eliminar superadmin
    if (tipoUsuarioActual === "root") {
      if (p.tipouser !== "superadmin") {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Solo puedes eliminar usuarios superadmin desde root.",
        });
        return;
      }
    } else if (tipoUsuarioActual === "superadmin") {
      // Superadmin no puede eliminar superadmin
    if (p.tipouser === "superadmin") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
          text: "No puedes eliminar otros superadmin.",
      });
      return;
      }
      // Solo puede eliminar admin/empleado de su operadora
    }
    Swal.fire({
      title: "¿Estás seguro(a)(e)?",
      text: "Una vez eliminado, ¡no podrá recuperar este registro!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, eliminar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Si root, no pasar idoperadora; si superadmin, pasar la operadora autenticada
        await eliminarusuarios({ id: p.id }, tipoUsuarioActual === "root" ? undefined : dataoperadora?.id);
      }
    });
  };

  const cambiarClave = (usuario) => {
    // Solo root puede cambiar clave de superadmin
    if (tipoUsuarioActual !== "root") {
      Swal.fire({
        icon: "error",
        title: "Sin permisos",
        text: "Solo el usuario root puede cambiar contraseñas.",
      });
      return;
    }

    if (usuario.tipouser !== "superadmin") {
      Swal.fire({
        icon: "error",
        title: "Usuario no válido",
        text: "Solo se puede cambiar la contraseña de usuarios superadmin.",
      });
      return;
    }

    setUsuarioSeleccionado(usuario);
    setModalCambiarClaveOpen(true);
  };

  const columns = [
    {
      accessorKey: "nombres",
      header: "Nombres",
      cell: (info) =><td data-title="Nombres" className="ContentCell">
        <span >{info.getValue()}</span>
      </td> 
    },
    {
      accessorKey: "tipouser",
      header: "T.User",
      cell: (info) =><td data-title="T.User" className="ContentCell">
        <span >{info.getValue()}</span>
      </td> 
    },
    {
      accessorKey: "estado",
      header: "Estado",
      enableSorting:false,
      cell: (info) =><td data-title="Estado" className="ContentCell">
        <span >{info.getValue()}</span>
      </td> 
    },
    {
      accessorKey: "acciones",
      header: "",
      enableSorting:false,
      cell: (info) => {
        const usuario = info.row.original;
        const mostrarCambiarClave = tipoUsuarioActual === "root" && usuario.tipouser === "superadmin";
        
        return (
          <td className="ContentCell">
            <ContentAccionesTablaUsuarios
              funcionEditar={() => editar(usuario)}
              funcionEliminar={() => eliminar(usuario)}
              funcionCambiarClave={() => cambiarClave(usuario)}
              mostrarCambiarClave={mostrarCambiarClave}
            />
          </td>
        );
      },
    },
  ];
  const table = useReactTable({
    data,
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
      {/* Modal para cambiar contraseña */}
      <CambiarClaveUsuarioModal
        isOpen={modalCambiarClaveOpen}
        onClose={() => {
          setModalCambiarClaveOpen(false);
          setUsuarioSeleccionado(null);
        }}
        usuario={usuarioSeleccionado}
        tipoUsuarioActual={tipoUsuarioActual}
      />
      
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
                  {
                    {
                      asc:" 🔼",
                      desc:" 🔽"
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
      <Paginacion table={table} irinicio = {()=>table.setPageIndex(0)}
      pagina = {table.getState().pagination.pageIndex+1}
      setPagina={setPagina}
      maximo={table.getPageCount()}/>
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
        text-align: center;
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
        text-align: right;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 50px;

        border-bottom: 1px solid rgba(161, 161, 161, 0.32);
        @media (min-width: ${v.bpbart}) {
          justify-content: center;
          border-bottom: none;
        }
      }
      td {
        text-align: right;
        @media (min-width: ${v.bpbart}) {
          border-bottom: 1px solid rgba(161, 161, 161, 0.32);
          text-align: center;
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
    }
  }
`;
