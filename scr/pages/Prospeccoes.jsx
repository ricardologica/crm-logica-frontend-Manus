import React from 'react';
import { Container } from 'react-bootstrap';
import ProspeccaoList from '../components/Prospeccoes/ProspeccaoList';

const Prospeccoes = () => {
  return (
    <Container fluid className="p-0">
      <ProspeccaoList />
    </Container>
  );
};

export default Prospeccoes;
