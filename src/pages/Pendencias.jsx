import React from 'react';
import { Container } from 'react-bootstrap';
import PendenciaList from '../components/Pendencias/PendenciaList';

const Pendencias = () => {
  return (
    <Container fluid className="p-0">
      <PendenciaList />
    </Container>
  );
};

export default Pendencias;
