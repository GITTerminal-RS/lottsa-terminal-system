import React from 'react';
import styled from "styled-components";

export function InputTextArea({ children, icono }) {
  return (
    <Container>
      {icono && <IconWrapper>{icono}</IconWrapper>}
      <div className="form__group field">{children}</div>
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;

  .form__group {
    position: relative;
    padding: 20px 0 0;
    width: 100%;
  }

  .form__field {
    font-family: inherit;
    width: 100%;
    border: none;
    border-bottom: 2px solid #9b9b9b;
    outline: 0;
    font-size: 17px;
    color: ${({ theme }) => theme.text};
    padding: 7px 0;
    background: transparent;
    transition: border-color 0.2s;
    resize: vertical;
    min-height: 120px;
    max-height: 300px;
    line-height: 1.5;

    &:focus {
      padding-bottom: 6px;
      font-weight: 700;
      border-width: 1px;
      border-image: linear-gradient(to right, #ec580e, #f23505);
      border-image-slice: 1;
    }

    &::placeholder {
      color: transparent;
    }

    &:required,
    &:invalid {
      box-shadow: none;
    }

    /* Estilos específicos para textarea */
    &.textarea-field {
      min-height: 120px;
      resize: vertical;
      padding-top: 7px;
      overflow-y: auto;
      font-size: 16px;
      
      /* Scrollbar personalizado */
      &::-webkit-scrollbar {
        width: 6px;
      }
      
      &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 3px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #ec580e, #f23505);
        border-radius: 3px;
      }
      
      &::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, #f23505, #d12500);
      }
      
      /* Para Firefox */
      scrollbar-width: thin;
      scrollbar-color: #ec580e rgba(0, 0, 0, 0.1);
    }
  }

  .form__label {
    position: absolute;
    top: 20px;
    left: 0;
    display: block;
    transition: 0.2s;
    font-size: 17px;
    color: #9b9b9b;
    pointer-events: none;
  }

  .form__field:focus ~ .form__label,
  .form__field:not(:placeholder-shown) ~ .form__label {
    top: 0;
    font-size: 13px;
    color: #001f3f;
    font-weight: 700;
  }

  p {
    color: #001f3f;
    font-size: 14px;
    margin-top: 4px;
  }

  /* Contador de caracteres */
  .char-counter {
    position: absolute;
    bottom: -20px;
    right: 0;
    font-size: 12px;
    color: #9b9b9b;
    
    .warning {
      color: #f23505;
    }
  }
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: flex-start;
  padding-top: 20px;
  font-size: 20px;
  color: #9b9b9b;
  transition: color 0.2s;

  ${Container}:focus-within & {
    color: #001f3f;
  }
`;