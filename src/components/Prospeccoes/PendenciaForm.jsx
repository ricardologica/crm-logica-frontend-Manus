import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Tab, Tabs } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale } from 'react-datepicker';
import pt from 'date-fns/locale/pt-BR';

registerLocale('pt-BR', pt);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const PendenciaForm = ({ pendencia, onSave, onCancel, viewOnly = false }) => {
  const [formData, setFormData] = useState({
    data_entrada: new Date(),
    data_prevista: null,
    data_finalizacao: null,
    status_pendencia_id: '',
    cliente_id: '',
    aba_mae: '',
    aba_principal: '',
    colaborador_id: '',
    descricao: '',
    visto_gerencia: false
  });
  
  const [statusPendencia, setStatusPendencia] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [abas, setAbas] = useState([
    'Prospecções', 'Clientes', 'Filiais', 'Contas', 'Contratos', 'Linhas', 
    'Faturas', 'Serviços', 'Financeiro', 'Relatórios'
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Carregar categorias e dados necessários
        const statusResponse = await axios.get(`${API_BASE_URL}/categorias?tipo=status_pendencia`);
        setStatusPendencia(statusResponse.data.categorias || []);
        
        const clientesResponse = await axios.get(`${API_BASE_URL}/clientes`);
        setClientes(clientesResponse.data.clientes || []);
        
        const colaboradoresResponse = await axios.get(`${API_BASE_URL}/categorias?tipo=colaborador`);
        setColaboradores(colaboradoresResponse.data.categorias || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados necessários');
      }
    };
    
    fetchData();
    
    // Se estiver editando, preenche o formulário com os dados da pendência
    if (pendencia) {
      const formattedData = {
        ...pendencia,
        data_entrada: pendencia.data_entrada ? new Date(pendencia.data_entrada) : new Date(),
        data_prevista: pendencia.data_prevista ? new Date(pendencia.data_prevista) : null,
        data_finalizacao: pendencia.data_finalizacao ? new Date(pendencia.data_finalizacao) : null
      };
      setFormData(formattedData);
    }
  }, [pendencia]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleDateChange = (date, fieldName) => {
    setFormData(prev => ({ ...prev, [fieldName]: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const dataToSend = {
        ...formData,
        data_entrada: formData.data_entrada ? formData.data_entrada.toISOString().split('T')[0] : null,
        data_prevista: formData.data_prevista ? formData.data_prevista.toISOString().split('T')[0] : null,
        data_finalizacao: formData.data_finalizacao ? formData.data_finalizacao.toISOString().split('T')[0] : null
      };
      
      let response;
      
      if (pendencia && pendencia.id) {
        // Atualizar pendência existente
        response = await axios.put(`${API_BASE_URL}/pendencias/${pendencia.id}`, dataToSend);
        toast.success('Pendência atualizada com sucesso!');
      } else {
        // Criar nova pendência
        response = await axios.post(`${API_BASE_URL}/pendencias`, dataToSend);
        toast.success('Pendência criada com sucesso!');
      }
      
      if (onSave) onSave(response.data);
    } catch (error) {
      console.error('Erro ao salvar pendência:', error);
      toast.error(error.response?.data?.error || 'Erro ao salvar pendência');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Card.Title>
            {viewOnly ? 'Visualizar Pendência' : pendencia ? 'Editar Pendência' : 'Nova Pendência'}
          </Card.Title>
          {!viewOnly && (
            <div>
              <Button variant="secondary" onClick={onCancel} className="me-2" disabled={isLoading}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          )}
        </div>

        <Form noValidate validated={validated}>
          <Row className="mb-3">
            <Form.Group as={Col} md="4">
              <Form.Label>Data de Entrada</Form.Label>
              <DatePicker
                selected={formData.data_entrada}
                onChange={(date) => handleDateChange(date, 'data_entrada')}
                className="form-control"
                dateFormat="dd/MM/yyyy"
                locale="pt-BR"
                disabled={viewOnly}
                required
              />
              <Form.Control.Feedback type="invalid">
                Data de entrada é obrigatória
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group as={Col} md="4">
              <Form.Label>Data Prevista</Form.Label>
              <DatePicker
                selected={formData.data_prevista}
                onChange={(date) => handleDateChange(date, 'data_prevista')}
                className="form-control"
                dateFormat="dd/MM/yyyy"
                locale="pt-BR"
                isClearable
                placeholderText="Selecione a data prevista"
                disabled={viewOnly}
              />
            </Form.Group>
            
            <Form.Group as={Col} md="4">
              <Form.Label>Data de Finalização</Form.Label>
              <DatePicker
                selected={formData.data_finalizacao}
                onChange={(date) => handleDateChange(date, 'data_finalizacao')}
                className="form-control"
                dateFormat="dd/MM/yyyy"
                locale="pt-BR"
                isClearable
                placeholderText="Selecione a data de finalização"
                disabled={viewOnly}
              />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} md="4">
              <Form.Label>Status da Pendência</Form.Label>
              <Form.Select
                name="status_pendencia_id"
                value={formData.status_pendencia_id}
                onChange={handleChange}
                disabled={viewOnly}
                required
              >
                <option value="">Selecione...</option>
                {statusPendencia.map(status => (
                  <option key={status.id} value={status.id}>
                    {status.nome}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Status da pendência é obrigatório
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group as={Col} md="4">
              <Form.Label>Cliente</Form.Label>
              <Form.Select
                name="cliente_id"
                value={formData.cliente_id}
                onChange={handleChange}
                disabled={viewOnly}
                required
              >
                <option value="">Selecione...</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome_razao_social}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Cliente é obrigatório
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group as={Col} md="4">
              <Form.Label>Colaborador</Form.Label>
              <Form.Select
                name="colaborador_id"
                value={formData.colaborador_id}
                onChange={handleChange}
                disabled={viewOnly}
              >
                <option value="">Selecione...</option>
                {colaboradores.map(colaborador => (
                  <option key={colaborador.id} value={colaborador.id}>
                    {colaborador.nome}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} md="6">
              <Form.Label>Aba Mãe (que originou a pendência)</Form.Label>
              <Form.Select
                name="aba_mae"
                value={formData.aba_mae}
                onChange={handleChange}
                disabled={viewOnly}
              >
                <option value="">Selecione...</option>
                {abas.map(aba => (
                  <option key={aba} value={aba}>
                    {aba}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group as={Col} md="6">
              <Form.Label>Aba Principal (onde vai executar o serviço)</Form.Label>
              <Form.Select
                name="aba_principal"
                value={formData.aba_principal}
                onChange={handleChange}
                disabled={viewOnly}
              >
                <option value="">Selecione...</option>
                {abas.map(aba => (
                  <option key={aba} value={aba}>
                    {aba}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} md="12">
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Descreva a pendência"
                disabled={viewOnly}
                required
              />
              <Form.Control.Feedback type="invalid">
                Descrição é obrigatória
              </Form.Control.Feedback>
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} md="12">
              <Form.Check
                type="checkbox"
                id="visto-gerencia"
                label="Visto da Gerência"
                name="visto_gerencia"
                checked={formData.visto_gerencia}
                onChange={handleChange}
                disabled={viewOnly}
              />
            </Form.Group>
          </Row>
          
          {!viewOnly && (
            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" onClick={onCancel} className="me-2" disabled={isLoading}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
};

export default PendenciaForm;
