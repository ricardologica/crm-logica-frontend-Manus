import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Tab, Tabs } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale } from 'react-datepicker';
import pt from 'date-fns/locale/pt-BR';
import CidadeAutoSuggest from '../common/CidadeAutoSuggest';

registerLocale('pt-BR', pt);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const ProspeccaoForm = ({ prospeccao, onSave, onCancel, viewOnly = false }) => {
  const [formData, setFormData] = useState({
    tipo_pessoa: 'PJ',
    cpf_cnpj: '',
    nome_razao_social: '',
    data_entrada: new Date(),
    nome_responsavel: '',
    celular: '',
    email: '',
    status_negociacao_id: '',
    natureza_contrato_ids: [],
    followup_id: '',
    total_linhas: '',
    filiais: '',
    cidade_id: '',
    consultor_id: '',
    data_aceite: null,
    tipo_aceite_id: '',
    link_upload_aceite: '',
    descricao_tratativas: '',
    descricao_servicos: '',
    descricao_financeiro: ''
  });
  
  const [statusNegociacao, setStatusNegociacao] = useState([]);
  const [naturezaContrato, setNaturezaContrato] = useState([]);
  const [followup, setFollowup] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [consultores, setConsultores] = useState([]);
  const [tipoAceite, setTipoAceite] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [activeTab, setActiveTab] = useState('dados-gerais');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Carregar categorias
        const statusResponse = await axios.get(`${API_BASE_URL}/categorias?tipo=status_negociacao`);
        setStatusNegociacao(statusResponse.data.categorias || []);
        
        const naturezaResponse = await axios.get(`${API_BASE_URL}/categorias?tipo=natureza_contrato`);
        setNaturezaContrato(naturezaResponse.data.categorias || []);
        
        const followupResponse = await axios.get(`${API_BASE_URL}/categorias?tipo=followup`);
        setFollowup(followupResponse.data.categorias || []);
        
        const cidadesResponse = await axios.get(`${API_BASE_URL}/categorias?tipo=cidade`);
        setCidades(cidadesResponse.data.categorias || []);
        
        const consultoresResponse = await axios.get(`${API_BASE_URL}/categorias?tipo=consultor`);
        setConsultores(consultoresResponse.data.categorias || []);
        
        const tipoAceiteResponse = await axios.get(`${API_BASE_URL}/categorias?tipo=tipo_aceite`);
        setTipoAceite(tipoAceiteResponse.data.categorias || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados necessários');
      }
    };
    
    fetchData();
    
    // Se estiver editando, preenche o formulário com os dados da prospecção
    if (prospeccao) {
      const formattedData = {
        ...prospeccao,
        data_entrada: prospeccao.data_entrada ? new Date(prospeccao.data_entrada) : new Date(),
        data_aceite: prospeccao.data_aceite ? new Date(prospeccao.data_aceite) : null,
        natureza_contrato_ids: prospeccao.natureza_contrato_ids || []
      };
      setFormData(formattedData);
    }
  }, [prospeccao]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date, fieldName) => {
    setFormData(prev => ({ ...prev, [fieldName]: date }));
  };

  const handleNaturezaContratoChange = (e) => {
    const { value, checked } = e.target;
    const valueNum = parseInt(value, 10);
    
    setFormData(prev => {
      const currentIds = [...prev.natureza_contrato_ids];
      
      if (checked) {
        if (!currentIds.includes(valueNum)) {
          return { ...prev, natureza_contrato_ids: [...currentIds, valueNum] };
        }
      } else {
        return { ...prev, natureza_contrato_ids: currentIds.filter(id => id !== valueNum) };
      }
      
      return prev;
    });
  };

  const formatCPFCNPJ = (value) => {
    if (!value) return value;
    
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Formata como CPF ou CNPJ dependendo do tamanho
    if (formData.tipo_pessoa === 'PF') {
      // CPF: 000.000.000-00
      if (numbers.length <= 3) {
        return numbers;
      } else if (numbers.length <= 6) {
        return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
      } else if (numbers.length <= 9) {
        return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
      } else {
        return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
      }
    } else {
      // CNPJ: 00.000.000/0000-00
      if (numbers.length <= 2) {
        return numbers;
      } else if (numbers.length <= 5) {
        return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
      } else if (numbers.length <= 8) {
        return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
      } else if (numbers.length <= 12) {
        return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
      } else {
        return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
      }
    }
  };

  const handleCPFCNPJChange = (e) => {
    const formattedValue = formatCPFCNPJ(e.target.value);
    setFormData(prev => ({ ...prev, cpf_cnpj: formattedValue }));
  };

  const formatCelular = (value) => {
    if (!value) return value;
    
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a formatação (XX) XXXXX-XXXX
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handleCelularChange = (e) => {
    const formattedValue = formatCelular(e.target.value);
    setFormData(prev => ({ ...prev, celular: formattedValue }));
  };

  const handleCidadeSelect = (cidadeId) => {
    setFormData(prev => ({ ...prev, cidade_id: cidadeId }));
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
        data_aceite: formData.data_aceite ? formData.data_aceite.toISOString().split('T')[0] : null
      };
      
      let response;
      
      if (prospeccao && prospeccao.id) {
        // Atualizar prospecção existente
        response = await axios.put(`${API_BASE_URL}/prospeccoes/${prospeccao.id}`, dataToSend);
        toast.success('Prospecção atualizada com sucesso!');
      } else {
        // Criar nova prospecção
        response = await axios.post(`${API_BASE_URL}/prospeccoes`, dataToSend);
        toast.success('Prospecção criada com sucesso!');
      }
      
      if (onSave) onSave(response.data);
    } catch (error) {
      console.error('Erro ao salvar prospecção:', error);
      toast.error(error.response?.data?.error || 'Erro ao salvar prospecção');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Card.Title>
            {viewOnly ? 'Visualizar Prospecção' : prospeccao ? 'Editar Prospecção' : 'Nova Prospecção'}
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
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
          >
            <Tab eventKey="dados-gerais" title="Dados Gerais">
              <Row className="mb-3">
                <Form.Group as={Col} md="3">
                  <Form.Label>Tipo de Pessoa</Form.Label>
                  <Form.Select
                    name="tipo_pessoa"
                    value={formData.tipo_pessoa}
                    onChange={handleChange}
                    disabled={viewOnly}
                    required
                  >
                    <option value="PF">Pessoa Física</option>
                    <option value="PJ">Pessoa Jurídica</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group as={Col} md="3">
                  <Form.Label>{formData.tipo_pessoa === 'PF' ? 'CPF' : 'CNPJ'}</Form.Label>
                  <Form.Control
                    type="text"
                    name="cpf_cnpj"
                    value={formData.cpf_cnpj}
                    onChange={handleCPFCNPJChange}
                    placeholder={formData.tipo_pessoa === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
                    disabled={viewOnly}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {formData.tipo_pessoa === 'PF' ? 'CPF é obrigatório' : 'CNPJ é obrigatório'}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group as={Col} md="6">
                  <Form.Label>{formData.tipo_pessoa === 'PF' ? 'Nome' : 'Razão Social'}</Form.Label>
                  <Form.Control
                    type="text"
                    name="nome_razao_social"
                    value={formData.nome_razao_social}
                    onChange={handleChange}
                    placeholder={formData.tipo_pessoa === 'PF' ? 'Nome completo' : 'Razão social'}
                    disabled={viewOnly}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {formData.tipo_pessoa === 'PF' ? 'Nome é obrigatório' : 'Razão Social é obrigatória'}
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} md="3">
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
                </Form.Group>
                
                <Form.Group as={Col} md="3">
                  <Form.Label>Nome do Responsável</Form.Label>
                  <Form.Control
                    type="text"
                    name="nome_responsavel"
                    value={formData.nome_responsavel}
                    onChange={handleChange}
                    placeholder="Nome do responsável"
                    disabled={viewOnly}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Nome do responsável é obrigatório
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group as={Col} md="3">
                  <Form.Label>Celular</Form.Label>
                  <Form.Control
                    type="text"
                    name="celular"
                    value={formData.celular}
                    onChange={handleCelularChange}
                    placeholder="(00) 00000-0000"
                    disabled={viewOnly}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Celular é obrigatório
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group as={Col} md="3">
                  <Form.Label>E-mail</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@exemplo.com"
                    disabled={viewOnly}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    E-mail válido é obrigatório
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} md="3">
                  <Form.Label>Status da Negociação</Form.Label>
                  <Form.Select
                    name="status_negociacao_id"
                    value={formData.status_negociacao_id}
                    onChange={handleChange}
                    disabled={viewOnly}
                  >
                    <option value="">Selecione...</option>
                    {statusNegociacao.map(status => (
                      <option key={status.id} value={status.id}>
                        {status.nome}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group as={Col} md="3">
                  <Form.Label>Follow-up</Form.Label>
                  <Form.Select
                    name="followup_id"
                    value={formData.followup_id}
                    onChange={handleChange}
                    disabled={viewOnly}
                  >
                    <option value="">Selecione...</option>
                    {followup.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.nome}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group as={Col} md="3">
                  <Form.Label>Total de Linhas</Form.Label>
                  <Form.Control
                    type="number"
                    name="total_linhas"
                    value={formData.total_linhas}
                    onChange={handleChange}
                    placeholder="0"
                    disabled={viewOnly}
                  />
                </Form.Group>
                
                <Form.Group as={Col} md="3">
                  <Form.Label>Filiais</Form.Label>
                  <Form.Control
                    type="number"
                    name="filiais"
                    value={formData.filiais}
                    onChange={handleChange}
                    placeholder="0"
                    disabled={viewOnly}
                  />
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} md="4">
                  <Form.Label>Cidade</Form.Label>
                  <CidadeAutoSuggest
                    cidades={cidades}
                    value={formData.cidade_id}
                    onChange={handleCidadeSelect}
                    disabled={viewOnly}
                  />
                </Form.Group>
                
                <Form.Group as={Col} md="4">
                  <Form.Label>Consultor</Form.Label>
                  <Form.Select
                    name="consultor_id"
                    value={formData.consultor_id}
                    onChange={handleChange}
                    disabled={viewOnly}
                  >
                    <option value="">Selecione...</option>
                    {consultores.map(consultor => (
                      <option key={consultor.id} value={consultor.id}>
                        {consultor.nome}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group as={Col} md="4">
                  <Form.Label>Natureza do Contrato</Form.Label>
                  <div className="border rounded p-2" style={{ maxHeight: '100px', overflowY: 'auto' }}>
                    {naturezaContrato.map(item => (
                      <Form.Check
                        key={item.id}
                        type="checkbox"
                        id={`natureza-${item.id}`}
                        label={item.nome}
                        value={item.id}
                        checked={formData.natureza_contrato_ids.includes(item.id)}
                        onChange={handleNaturezaContratoChange}
                        disabled={viewOnly}
                      />
                    ))}
                  </div>
                </Form.Group>
              </Row>
            </Tab>
            
            <Tab eventKey="aceite" title="Aceite">
              <Row className="mb-3">
                <Form.Group as={Col} md="4">
                  <Form.Label>Data do Aceite</Form.Label>
                  <DatePicker
                    selected={formData.data_aceite}
                    onChange={(date) => handleDateChange(date, 'data_aceite')}
                    className="form-control"
                    dateFormat="dd/MM/yyyy"
                    locale="pt-BR"
                    isClearable
                    placeholderText="Selecione a data"
                    disabled={viewOnly}
                  />
                </Form.Group>
                
                <Form.Group as={Col} md="4">
                  <Form.Label>Tipo de Aceite</Form.Label>
                  <Form.Select
                    name="tipo_aceite_id"
                    value={formData.tipo_aceite_id}
                    onChange={handleChange}
                    disabled={viewOnly}
                  >
                    <option value="">Selecione...</option>
                    {tipoAceite.map(tipo => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nome}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group as={Col} md="4">
                  <Form.Label>Link do Aceite</Form.Label>
                  <Form.Control
                    type="text"
                    name="link_upload_aceite"
                    value={formData.link_upload_aceite}
                    onChange={handleChange}
                    placeholder="Link para o documento de aceite"
                    disabled={viewOnly}
                  />
                </Form.Group>
              </Row>
            </Tab>
            
            <Tab eventKey="descricoes" title="Descrições">
              <Row className="mb-3">
                <Form.Group as={Col} md="12" className="mb-3">
                  <Form.Label>Descrição das Tratativas</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="descricao_tratativas"
                    value={formData.descricao_tratativas}
                    onChange={handleChange}
                    placeholder="Descreva as tratativas realizadas"
                    disabled={viewOnly}
                  />
                </Form.Group>
                
                <Form.Group as={Col} md="12" className="mb-3">
                  <Form.Label>Descrição dos Serviços</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="descricao_servicos"
                    value={formData.descricao_servicos}
                    onChange={handleChange}
                    placeholder="Descreva os serviços contratados"
                    disabled={viewOnly}
                  />
                </Form.Group>
                
                <Form.Group as={Col} md="12">
                  <Form.Label>Descrição Financeira</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="descricao_financeiro"
                    value={formData.descricao_financeiro}
                    onChange={handleChange}
                    placeholder="Descreva os aspectos financeiros"
                    disabled={viewOnly}
                  />
                </Form.Group>
              </Row>
            </Tab>
          </Tabs>
          
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

export default ProspeccaoForm;
