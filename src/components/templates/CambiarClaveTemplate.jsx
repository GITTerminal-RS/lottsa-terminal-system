import styled from "styled-components";
import { useState } from "react";
import { supabase } from "../../index";
import { Btnsave } from "../moleculas/Btnsave";
import { InputText } from "../organismos/fomularios/InputText";
import { RiLockPasswordLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

export default function CambiarClaveTemplate() {
  const [clave, setClave] = useState("");
  const [clave2, setClave2] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    if (!clave || !clave2) {
      setMensaje("Debes completar ambos campos.");
      return;
    }
    if (clave !== clave2) {
      setMensaje("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: clave });
    setLoading(false);
    if (error) {
      setMensaje("Error al cambiar la clave: " + error.message);
    } else {
      setMensaje("¡Contraseña cambiada exitosamente!");
      setClave("");
      setClave2("");
      setTimeout(() => {
        navigate("/gestion");
      }, 1500);
    }
  };

  return (
    <Container>
      <h2>Cambiar clave</h2>
      <form onSubmit={handleSubmit}>
        <InputText icono={<RiLockPasswordLine />}>
          <input
            className="form__field"
            type="password"
            placeholder="Nueva clave"
            value={clave}
            onChange={e => setClave(e.target.value)}
            minLength={6}
            required
          />
          <label className="form__label">Nueva clave</label>
        </InputText>
        <InputText icono={<RiLockPasswordLine />}>
          <input
            className="form__field"
            type="password"
            placeholder="Repetir clave"
            value={clave2}
            onChange={e => setClave2(e.target.value)}
            minLength={6}
            required
          />
          <label className="form__label">Repetir clave</label>
        </InputText>
        <div className="btnguardarContent">
          <Btnsave titulo={loading ? "Cambiando..." : "Cambiar clave"} bgcolor="#3a4b86" />
        </div>
        {mensaje && <Mensaje>{mensaje}</Mensaje>}
      </form>
    </Container>
  );
}

const Container = styled.div`
  max-width: 400px;
  margin: 40px auto;
  background: ${({ theme }) => theme.bgcards};
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  padding: 32px 24px;
  h2 {
    color: #3a4b86;
    font-weight: 700;
    margin-bottom: 24px;
    text-align: center;
  }
  .btnguardarContent {
    display: flex;
    justify-content: flex-end;
    margin-top: 18px;
  }
`;

const Mensaje = styled.div`
  margin-top: 18px;
  color: #1bc47d;
  font-weight: 500;
  text-align: center;
`; 