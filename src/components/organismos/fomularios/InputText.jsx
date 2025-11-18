import React from 'react';
import styled from "styled-components";

export function InputText({ children, icono }) {
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
    color: #001f3f
;
    font-weight: 700;
  }

  p {
    color: #001f3f
;
    font-size: 14px;
    margin-top: 4px;
  }
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  padding-top: 20px;
  font-size: 20px;
  color: #9b9b9b;
  transition: color 0.2s;

  ${Container}:focus-within & {
    color: #001f3f
;
  }
`;
