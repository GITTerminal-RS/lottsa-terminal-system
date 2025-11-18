import styled from "styled-components";
import { v } from "../../../styles/variables";
import {
  InputText,
  Btnsave,
  useUsuariosStore
} from "../../../index";
import { useForm } from "react-hook-form";
import { MdAlternateEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MostrarUsuarios } from '../../../supabase/crudUsuarios';
import { UserAuth } from '../../../context/AuthContext';
import { supabase } from '../../../index';
import { useOperadoraStore } from '../../../store/OperadoraStore';

export function RegistrarSuperadminRoot({ setState }) {
  const { insertarUsuarioAdmin, mostrarpermisos } = useUsuariosStore();
  const { user } = UserAuth();
  const navigate = useNavigate();
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset
  } = useForm();
  const mutation = useMutation({
    mutationFn: async (data) => {
      const p = {
        correo: data.correo,
        pass:data.pass
      };
      const dt = await insertarUsuarioAdmin(p);
      if (dt) {
        // Esperar un poco para que los triggers se ejecuten
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Cambiar directamente a la sesión del superadmin
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: data.correo,
          password: data.pass,
        });
        let idauth = signInData?.user?.id;
        if (!signInError && idauth) {
          // Usar la función robusta del store para obtener operadora y asignación
          await useOperadoraStore.getState().obtenerOperadoraPorIdAuth(idauth);
          // Refrescar permisos tras login
          setTimeout(async () => {
            const usuario = await MostrarUsuarios();
            if (usuario?.id) {
              const permisos = await mostrarpermisos({ id_usuario: usuario.id });
              console.log('Permisos cargados tras registro y login superadmin:', permisos);
            }
          }, 1500);
          reset();
          navigate("/gestion");
        } else {
          // Si falla, intentar con más tiempo
          await new Promise(resolve => setTimeout(resolve, 3000));
          const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
            email: data.correo,
            password: data.pass,
          });
          idauth = retryData?.user?.id;
          if (!retryError && idauth) {
            await useOperadoraStore.getState().obtenerOperadoraPorIdAuth(idauth);
            // Refrescar permisos tras login
            setTimeout(async () => {
              const usuario = await MostrarUsuarios();
              if (usuario?.id) {
                const permisos = await mostrarpermisos({ id_usuario: usuario.id });
                console.log('Permisos cargados tras registro y login superadmin:', permisos);
              }
            }, 1500);
            reset();
            navigate("/gestion");
          } else {
            // Solo cerrar sesión del root si todo falla
            await supabase.auth.signOut();
            alert("Superadmin creado exitosamente. Por favor, inicie sesión manualmente.");
            navigate("/login");
          }
        }
      } else {
        setState && setState(false);
      }
    },
  });

  // Solo permitir acceso si el usuario es root
  const [isRoot, setIsRoot] = useState(false);
  useEffect(() => {
    async function checkRoot() {
      if (!user) return setIsRoot(false);
      const usuario = await MostrarUsuarios();
      setIsRoot(usuario?.tipouser === "root");
    }
    checkRoot();
  }, [user]);

  if (!isRoot) return <div style={{padding:40, color:'red'}}>Acceso solo para usuario root</div>;

  return (
    <Container>
      <section className="subcontainer">
      <div style={{width:'100%', display:'flex', justifyContent:'flex-end', marginBottom: '4px'}}>
        <span onClick={setState} style={{fontSize: '28px', cursor: 'pointer', color: '#000', lineHeight: 1}}>×</span>
      </div>
      <div className="headers">
        <section>
          <h1 style={{color:'#000'}}>Registrar Superadmin</h1>
        </section>
      </div>
      <form className="formulario" onSubmit={handleSubmit(mutation.mutateAsync)}>
        <section>
          <article>
            <InputText icono={<MdAlternateEmail />}>
              <input  className="form__field"
                style={{ textTransform: "lowercase" }}
                type="text"
                placeholder="correo"
                {...register("correo", {
                  required: true,
                  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i,
                })}
              />
               <label className="form__label">email</label>
              {errors.correo?.type === "pattern" && (
                <p>El formato del email es incorrecto</p>
              )}
              {errors.correo?.type === "required" && <p>Campo requerido</p>}
            </InputText>
          </article>
          <article>
            <InputText icono={<RiLockPasswordLine />}>
              <input  className="form__field"
                type="text"
                placeholder="pass"
                {...register("pass", {
                  required: true,
                })}
              />
 <label className="form__label">pass</label>
              {errors.pass?.type === "required" && <p>Campo requerido</p>}
            </InputText>
          </article>
          <div className="btnguardarContent">
            <Btnsave
              icono={<v.iconoguardar />}
              titulo="Guardar"
              bgcolor="#007BFF"  
            />
          </div>
        </section>
      </form>
      </section>
    </Container>
  );
}
const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(10, 9, 9, 0.5);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;

  .subcontainer {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 8px 32px rgba(10, 9, 9, 0.25);
    padding: 24px 18px 18px 18px;
    z-index: 101;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .headers {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 18px;
    h1 {
      font-size: 20px;
      font-weight: 600;
      color: #fc6027;
      margin: 0;
    }
  }
  .formulario {
    width: 100%;
    section {
      gap: 16px;
      display: flex;
      flex-direction: column;
    }
  }
  .btnguardarContent {
    display: flex;
    justify-content: end;
    margin-top: 10px;
  }
  @media (max-width: 500px) {
    .subcontainer {
      max-width: 95vw;
      padding: 12px 4px 12px 4px;
    }
  }
`; 