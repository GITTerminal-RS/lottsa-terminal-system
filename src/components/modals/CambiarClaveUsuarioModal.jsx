import { useState } from "react";
import styled from "styled-components";
import { RiLockPasswordLine, RiCloseLine } from "react-icons/ri";
import { FaUser } from "react-icons/fa";
import { InputText } from "../organismos/fomularios/InputText";
import { Btnsave } from "../moleculas/Btnsave";
import { CambiarClaveUsuario } from "../../supabase/crudUsuarios";
import toast from "react-hot-toast";

export function CambiarClaveUsuarioModal({ usuario, onClose, onSuccess }) {
  const [nuevaClave, setNuevaClave] = useState("");
  const [confirmarClave, setConfirmarClave] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!nuevaClave || !confirmarClave) {
      toast.error("Debes completar ambos campos");
      return;
    }

    if (nuevaClave.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (nuevaClave !== confirmarClave) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    try {
      setLoading(true);
      toast.loading("Cambiando contraseña...");

      await CambiarClaveUsuario(usuario.idauth, nuevaClave);
      
      toast.dismiss();
      toast.success(`Contraseña cambiada exitosamente para ${usuario.nombres}`);
      
      // Limpiar campos
      setNuevaClave("");
      setConfirmarClave("");
      
      // Llamar callback de éxito si existe
      if (onSuccess) {
        onSuccess();
      }
      
      // Cerrar modal después de un breve delay
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      toast.dismiss();
      console.error("Error al cambiar contraseña:", error);
      toast.error(error.message || "Error al cambiar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Overlay onClick={handleClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <div className="header-content">
            <FaUser className="user-icon" />
            <div className="user-info">
              <h3>Cambiar Contraseña</h3>
              <p>Usuario: <strong>{usuario.nombres}</strong></p>
              <span className="user-type">Tipo: {usuario.tipouser}</span>
            </div>
          </div>
          <button 
            className="close-btn" 
            onClick={handleClose}
            disabled={loading}
          >
            <RiCloseLine />
          </button>
        </ModalHeader>

        <ModalBody>
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
                disabled={loading}
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
                disabled={loading}
              />
              <label className="form__label">Confirmar contraseña</label>
            </InputText>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <Btnsave 
                titulo={loading ? "Cambiando..." : "Cambiar Contraseña"} 
                bgcolor="#3a4b86"
                disabled={loading}
              />
            </div>
          </form>
        </ModalBody>

        <ModalFooter>
          <div className="warning">
            <strong>⚠️ Advertencia:</strong> Esta acción cambiará permanentemente la contraseña del usuario.
          </div>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: ${({ theme }) => theme.bgcards};
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease-out;

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 24px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.border || 'rgba(0,0,0,0.1)'};

  .header-content {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;

    .user-icon {
      background: #3a4b86;
      color: white;
      padding: 12px;
      border-radius: 50%;
      font-size: 20px;
      min-width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-info {
      h3 {
        margin: 0 0 4px 0;
        color: #3a4b86;
        font-weight: 700;
        font-size: 18px;
      }

      p {
        margin: 0 0 4px 0;
        color: ${({ theme }) => theme.text};
        font-size: 14px;
      }

      .user-type {
        background: #3a4b86;
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        text-transform: capitalize;
      }
    }
  }

  .close-btn {
    background: none;
    border: none;
    color: ${({ theme }) => theme.text};
    font-size: 24px;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition: all 0.2s ease;
    min-width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover:not(:disabled) {
      background: rgba(255, 0, 0, 0.1);
      color: #ff4757;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

const ModalBody = styled.div`
  padding: 24px;

  .form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 24px;

    .btn-cancel {
      background: transparent;
      border: 2px solid #ddd;
      color: ${({ theme }) => theme.text};
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        border-color: #ff4757;
        color: #ff4757;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
`;

const ModalFooter = styled.div`
  padding: 16px 24px 24px;
  border-top: 1px solid ${({ theme }) => theme.border || 'rgba(0,0,0,0.1)'};

  .warning {
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    color: #856404;
    padding: 12px;
    border-radius: 8px;
    font-size: 13px;
    text-align: center;

    strong {
      color: #d63031;
    }
  }
`;
