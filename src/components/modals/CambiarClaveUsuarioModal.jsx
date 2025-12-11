import React, { useState } from 'react';
import styled from 'styled-components';
import { FaEye, FaEyeSlash, FaKey, FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { CambiarClaveUsuario } from '../../supabase/crudUsuarios';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  position: relative;
  animation: modalSlideIn 0.3s ease-out;

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(-30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
`;

const ModalTitle = styled.h2`
  color: #2c3e50;
  font-size: 1.4rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #7f8c8d;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
    color: #e74c3c;
    transform: scale(1.1);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.9rem;
`;

const InputContainer = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 3rem;
  border: 2px solid ${props => 
    props.error ? '#e74c3c' : 
    props.success ? '#27ae60' : '#ddd'
  };
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${props => 
      props.error ? '#e74c3c' : '#3498db'
    };
    box-shadow: 0 0 0 3px ${props => 
      props.error ? 'rgba(231, 76, 60, 0.1)' : 'rgba(52, 152, 219, 0.1)'
    };
  }

  &::placeholder {
    color: #bdc3c7;
  }
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #7f8c8d;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 0.2s ease;

  &:hover {
    color: #3498db;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const SuccessMessage = styled.div`
  color: #27ae60;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #2980b9, #1f5f8b);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  }
`;

const SecondaryButton = styled(Button)`
  background: #ecf0f1;
  color: #2c3e50;

  &:hover:not(:disabled) {
    background: #d5dbdb;
    transform: translateY(-2px);
  }
`;

const UserInfo = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #3498db;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
`;

const UserRole = styled.div`
  font-size: 0.85rem;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CambiarClaveUsuarioModal = ({ 
  isOpen, 
  onClose, 
  usuario 
}) => {
  const [passwords, setPasswords] = useState({
    nueva: '',
    confirmar: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    nueva: false,
    confirmar: false
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validatePasswords = () => {
    const newErrors = {};
    
    if (!passwords.nueva) {
      newErrors.nueva = 'La contraseña es requerida';
    } else if (passwords.nueva.length < 6) {
      newErrors.nueva = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (!passwords.confirmar) {
      newErrors.confirmar = 'Confirma la contraseña';
    } else if (passwords.nueva !== passwords.confirmar) {
      newErrors.confirmar = 'Las contraseñas no coinciden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = (field, value) => {
    setPasswords(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswords()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('🔐 Iniciando cambio de contraseña para usuario:', usuario);
      
      const resultado = await CambiarClaveUsuario(usuario.id, passwords.nueva);
      
      console.log('✅ Resultado del cambio:', resultado);
      
      if (resultado.success) {
        // Mostrar mensaje de éxito con SweetAlert2
        await Swal.fire({
          icon: 'success',
          title: '¡Contraseña Actualizada!',
          html: `
            <div style="text-align: left; margin: 1rem 0;">
              <p><strong>Usuario:</strong> ${usuario.nombres}</p>
              <p><strong>Resultado:</strong> ${resultado.message}</p>
              ${resultado.showPassword ? `
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin: 1rem 0; border-left: 4px solid #ffc107;">
                  <p style="margin: 0; color: #856404;"><strong>⚠️ Contraseña Temporal:</strong></p>
                  <p style="margin: 0.5rem 0 0 0; font-family: monospace; font-size: 1.1rem; background: white; padding: 0.5rem; border-radius: 4px;">${resultado.newPassword}</p>
                  <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; color: #856404;">El usuario debe cerrar sesión e iniciar con esta contraseña.</p>
                </div>
              ` : ''}
            </div>
          `,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#3498db'
        });
        
        // Mostrar toast de éxito
        toast.success('Contraseña actualizada correctamente');
        
        // Limpiar formulario
        setPasswords({ nueva: '', confirmar: '' });
        setErrors({});
        
        // Cerrar modal
        onClose();
      } else {
        throw new Error(resultado.message || 'Error desconocido');
      }
      
    } catch (error) {
      console.error('❌ Error al cambiar contraseña:', error);
      
      // Mostrar error con SweetAlert2
      await Swal.fire({
        icon: 'error',
        title: 'Error al Cambiar Contraseña',
        html: `
          <div style="text-align: left;">
            <p><strong>Usuario:</strong> ${usuario.nombres}</p>
            <p><strong>Error:</strong> ${error.message}</p>
            <hr style="margin: 1rem 0;">
            <p style="font-size: 0.9rem; color: #7f8c8d;">
              Si el problema persiste, contacta al administrador del sistema.
            </p>
          </div>
        `,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#e74c3c'
      });
      
      // Mostrar toast de error
      toast.error('Error al cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <FaKey />
            Cambiar Contraseña
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        {usuario && (
          <UserInfo>
            <UserName>{usuario.nombres}</UserName>
            <UserRole>{usuario.tipouser}</UserRole>
          </UserInfo>
        )}

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Nueva Contraseña</Label>
            <InputContainer>
              <Input
                type={showPasswords.nueva ? 'text' : 'password'}
                value={passwords.nueva}
                onChange={(e) => handlePasswordChange('nueva', e.target.value)}
                placeholder="Ingresa la nueva contraseña"
                error={!!errors.nueva}
                success={passwords.nueva.length >= 6 && !errors.nueva}
                disabled={isLoading}
              />
              <ToggleButton
                type="button"
                onClick={() => togglePasswordVisibility('nueva')}
                disabled={isLoading}
              >
                {showPasswords.nueva ? <FaEyeSlash /> : <FaEye />}
              </ToggleButton>
            </InputContainer>
            {errors.nueva && (
              <ErrorMessage>{errors.nueva}</ErrorMessage>
            )}
            {passwords.nueva.length >= 6 && !errors.nueva && (
              <SuccessMessage>✓ Contraseña válida</SuccessMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Confirmar Contraseña</Label>
            <InputContainer>
              <Input
                type={showPasswords.confirmar ? 'text' : 'password'}
                value={passwords.confirmar}
                onChange={(e) => handlePasswordChange('confirmar', e.target.value)}
                placeholder="Confirma la nueva contraseña"
                error={!!errors.confirmar}
                success={passwords.confirmar && passwords.nueva === passwords.confirmar}
                disabled={isLoading}
              />
              <ToggleButton
                type="button"
                onClick={() => togglePasswordVisibility('confirmar')}
                disabled={isLoading}
              >
                {showPasswords.confirmar ? <FaEyeSlash /> : <FaEye />}
              </ToggleButton>
            </InputContainer>
            {errors.confirmar && (
              <ErrorMessage>{errors.confirmar}</ErrorMessage>
            )}
            {passwords.confirmar && passwords.nueva === passwords.confirmar && (
              <SuccessMessage>✓ Las contraseñas coinciden</SuccessMessage>
            )}
          </FormGroup>

          <ButtonContainer>
            <SecondaryButton 
              type="button" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </SecondaryButton>
            <PrimaryButton 
              type="submit"
              disabled={isLoading || !passwords.nueva || !passwords.confirmar}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="fa-spin" />
                  Cambiando...
                </>
              ) : (
                <>
                  <FaKey />
                  Cambiar Contraseña
                </>
              )}
            </PrimaryButton>
          </ButtonContainer>
        </form>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default CambiarClaveUsuarioModal;
