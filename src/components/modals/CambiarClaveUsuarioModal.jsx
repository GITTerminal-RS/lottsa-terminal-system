import { useState } from "react";
import styled from "styled-components";
import { RiLockPasswordLine, RiCloseLine } from "react-icons/ri";
import { InputText } from "../organismos/fomularios/InputText";
import { Btnsave } from "../moleculas/Btnsave";
import { CambiarClaveUsuario } from "../../supabase/crudUsuarios";
import toast from "react-hot-toast";

export function CambiarClaveUsuarioModal({ isOpen, onClose, usuario }) {
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
    
    if (nuevaClave !== confirmarClave) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    
    if (nuevaClave.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    
    try {
      console.log("🎯 Iniciando cambio de contraseña desde modal para:", usuario.nombres);
      const result = await CambiarClaveUsuario(usuario.idauth, nuevaClave);
      
      console.log("✅ Resultado del cambio:", result);
      
      if (result.message) {
        toast.success(result.message, { duration: 4000 });
      } else {
        toast.success(`Contraseña de ${usuario.nombres} cambiada exitosamente`, { duration: 4000 });
      }
      
      // Mostrar información adicional en consola
      console.log(`🔐 Contraseña actualizada para ${usuario.nombres} (${usuario.idauth})`);
      console.log("💡 El usuario debe cerrar sesión e iniciar con la nueva contraseña");
      
      handleClose();
    } catch (error) {
      console.error("❌ Error en modal:", error);
      toast.error("Error al cambiar contraseña: " + error.message, { duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNuevaClave("");
    setConfirmarClave("");
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={handleClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <h2>Cambiar Contraseña</h2>
          <CloseButton onClick={handleClose}>
            <RiCloseLine />
          </CloseButton>
        </Header>
        
        <UserInfo>
          <span>Usuario: <strong>{usuario?.nombres}</strong></span>
          <span>Tipo: <strong>{usuario?.tipouser}</strong></span>
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

          <ButtonContainer>
            <Btnsave 
              titulo={loading ? "Cambiando..." : "Cambiar Contraseña"} 
              bgcolor="#3a4b86"
              disabled={loading}
            />
          </ButtonContainer>
        </form>
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: ${({ theme }) => theme.bgcards};
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 24px;
  width: 90%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
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
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.1);
    color: #333;
  }
`;

const UserInfo = styled.div`
  background: rgba(58, 75, 134, 0.1);
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  span {
    font-size: 14px;
    color: ${({ theme }) => theme.text};
    
    strong {
      color: #3a4b86;
    }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;
