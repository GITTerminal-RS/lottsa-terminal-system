import { useState } from "react";
import styled from "styled-components";
import { RiLockPasswordLine, RiCloseLine } from "react-icons/ri";
import { InputText } from "../organismos/fomularios/InputText";
import { Btnsave } from "../moleculas/Btnsave";
import { CambiarClaveUsuario } from "../../supabase/crudUsuarios";
import Swal from "sweetalert2";

export function CambiarClaveUsuarioModal({ 
  isOpen, 
  onClose, 
  usuario,
  tipoUsuarioActual 
}) {
  const [nuevaClave, setNuevaClave] = useState("");
  const [confirmarClave, setConfirmarClave] = useState("");
  const [loading, setLoading] = useState(false);

  // Solo permitir si es usuario root y el objetivo es superadmin
  const puedeChangiarClave = tipoUsuarioActual === "root" && usuario?.tipouser === "superadmin";

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!puedeChangiarClave) {
      Swal.fire({
        icon: "error",
        title: "Sin permisos",
        text: "Solo el usuario root puede cambiar claves de superadmin.",
      });
      return;
    }

    if (!nuevaClave || !confirmarClave) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Debes completar ambos campos.",
      });
      return;
    }

    if (nuevaClave !== confirmarClave) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Las contraseñas no coinciden.",
      });
      return;
    }

    if (nuevaClave.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Contraseña muy corta",
        text: "La contraseña debe tener al menos 6 caracteres.",
      });
      return;
    }

    try {
      setLoading(true);
      
      await CambiarClaveUsuario(usuario.idauth, nuevaClave);
      
      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: `Contraseña de ${usuario.nombres} cambiada exitosamente.`,
        timer: 2000,
        showConfirmButton: false
      });

      // Limpiar formulario y cerrar modal
      setNuevaClave("");
      setConfirmarClave("");
      onClose();
      
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error al cambiar la contraseña",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNuevaClave("");
    setConfirmarClave("");
    onClose();
  };

  if (!isOpen || !puedeChangiarClave) return null;

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3>Cambiar Contraseña</h3>
          <CloseButton onClick={handleClose}>
            <RiCloseLine />
          </CloseButton>
        </ModalHeader>

        <UserInfo>
          <strong>Usuario:</strong> {usuario?.nombres}
          <br />
          <strong>Tipo:</strong> {usuario?.tipouser}
        </UserInfo>

        <form onSubmit={handleSubmit}>
          <InputText icono={<RiLockPasswordLine />}>
            <input
              className="form__field"
              type="password"
              placeholder="Nueva contraseña"
              value={nuevaClave}
              onChange={(e) => setNuevaClave(e.target.value)}
              minLength={6}
              required
            />
            <label className="form__label">Nueva contraseña</label>
          </InputText>

          <InputText icono={<RiLockPasswordLine />}>
            <input
              className="form__field"
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmarClave}
              onChange={(e) => setConfirmarClave(e.target.value)}
              minLength={6}
              required
            />
            <label className="form__label">Confirmar contraseña</label>
          </InputText>

          <ButtonContainer>
            <Btnsave 
              titulo={loading ? "Cambiando..." : "Cambiar Contraseña"} 
              bgcolor="#3a4b86"
              disabled={loading}
            />
          </ButtonContainer>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.bgcards};
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 {
    color: #3a4b86;
    font-weight: 700;
    margin: 0;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const UserInfo = styled.div`
  background-color: rgba(58, 75, 134, 0.1);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  line-height: 1.5;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;
