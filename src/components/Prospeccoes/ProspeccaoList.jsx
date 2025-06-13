import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Dropdown } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaEdit, FaArchive, FaTrash, FaSearch, FaPlus, FaFilter, FaCog, FaEye } from 'react-icons/fa';
import Pagination from '../common/Pagination';
import ProspeccaoForm from './ProspeccaoForm';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const ProspeccaoList = () => {
  const [prospeccoes, setProspeccoes] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentProspeccao, setCurrentProspeccao] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArquivados, setShowArquivados] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [statusOptions, setStatusOptions] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState({
    numero_contrato: true,
    nome_razao_social: true,
    tipo_pessoa: true,
    cpf_cnpj: true,
    data_entrada: true,
    status_negociacao: true,
    consultor: true,
    total_linhas: true,
    filiais: true
  });

  // Função para carregar prospecções
  const loadProspeccoes = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: 10,
        search: searchTerm,
        arquivado: showArquivados
      };
      
      if (statusFilter) {
        params.status_negociacao_id = statusFilter;
      }
      
      const response = await axios.get(`${API_BASE_URL}/prospeccoes`, { params });
      setProspeccoes(response.data.prospeccoes || []);
      setTotalPages(response.data.pages || 0);
    } catch (error) {
      console.error('Erro ao carregar prospecções:', error);
      toast.error('Erro ao carregar prospecções');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, showArquivados, statusFilter]);

  // Carregar status de negociação para filtro
  const loadStatusOptions = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categorias?tipo=status_negociacao`);
      setStatusOptions(response.data.categorias || []);
    } catch (error) {
      console.error('Erro ao carregar status de negociação:', error);
    }
  }, []);

  useEffect(() => {
    loadProspeccoes();
  }, [loadProspeccoes]);

  useEffect(() => {
    loadStatusOptions();
  }, [loadStatusOptions]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProspeccoes();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleArquivados = () => {
    setShowArquivados(!showArquivados);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleColumnToggle = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const handleView = (prospeccao) => {
    setCurrentProspeccao(prospeccao);
    setShowForm(true);
  };

  const handleEdit = (prospeccao) => {
    setCurrentProspeccao(prospeccao);
    setShowForm(true);
  };

  const handleCreate = () => {
    setCurrentProspeccao(null);
    setShowForm(true);
  };

  const handleSave = () => {
    setShowForm(false);
    loadProspeccoes();
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const handleArchive = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/prospeccoes/${id}/arquivar`);
      toast.success('Prospecção arquivada com sucesso!');
      loadProspeccoes();
    } catch (error) {
      console.error('Erro ao arquivar prospecção:', error);
      toast.error('Erro ao arquivar prospecção');
    }
  };

  const handleUnarchive = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/prospeccoes/${id}/desarquivar`);
      toast.success('Prospecção desarquivada com sucesso!');
      loadProspeccoes();
    } catch (error) {
      console.error('Erro ao desarquivar prospecção:', error);
      toast.error('Erro ao desarquivar prospecção');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta prospecção?')) {
      try {
        await axios.delete(`${API_BASE_URL}/prospeccoes/${id}`);
        toast.success('Prospecção excluída com sucesso!');
        loadProspeccoes();
      } catch (error) {
        console.error('Erro ao excluir prospecção:', error);
        toast.error('Erro ao excluir prospecção');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (showForm) {
    return (
      <Container fluid className="py-4">
        <ProspeccaoForm 
          prospeccao={currentProspeccao} 
          onSave={handleSave} 
          onCancel={handleCancel} 
          viewOnly={false}
        />
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Prospecções</h2>
            <Button variant="primary" onClick={handleCreate}>
              <FaPlus className="me-2" /> Nova Prospecção
            </Button>
          </div>

          <Row className="mb-4">
            <Col md={4}>
              <Form onSubmit={handleSearch}>
                <div className="d-flex">
                  <Form.Control
                    type="text"
                    placeholder="Buscar prospecções..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <Button variant="outline-primary" type="submit" className="ms-2">
                    <FaSearch />
                  </Button>
                </div>
              </Form>
            </Col>
            <Col md={4}>
              <Form.Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value="">Todos os status</option>
                {statusOptions.map(status => (
                  <option key={status.id} value={status.id}>
                    {status.nome}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4} className="d-flex justify-content-end">
              <Button 
                variant={showArquivados ? "warning" : "outline-secondary"} 
                onClick={toggleArquivados}
                className="me-2"
              >
                <FaArchive className="me-1" /> {showArquivados ? 'Mostrar Ativos' : 'Mostrar Arquivados'}
              </Button>
              
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" id="dropdown-columns">
                  <FaCog className="me-1" /> Colunas
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => handleColumnToggle('numero_contrato')}>
                    <Form.Check 
                      type="checkbox" 
                      label="Número do Contrato" 
                      checked={visibleColumns.numero_contrato} 
                      onChange={() => {}} 
                    />
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleColumnToggle('nome_razao_social')}>
                    <Form.Check 
                      type="checkbox" 
                      label="Nome/Razão Social" 
                      checked={visibleColumns.nome_razao_social} 
                      onChange={() => {}} 
                    />
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleColumnToggle('tipo_pessoa')}>
                    <Form.Check 
                      type="checkbox" 
                      label="Tipo de Pessoa" 
                      checked={visibleColumns.tipo_pessoa} 
                      onChange={() => {}} 
                    />
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleColumnToggle('cpf_cnpj')}>
                    <Form.Check 
                      type="checkbox" 
                      label="CPF/CNPJ" 
                      checked={visibleColumns.cpf_cnpj} 
                      onChange={() => {}} 
                    />
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleColumnToggle('data_entrada')}>
                    <Form.Check 
                      type="checkbox" 
                      label="Data de Entrada" 
                      checked={visibleColumns.data_entrada} 
                      onChange={() => {}} 
                    />
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleColumnToggle('status_negociacao')}>
                    <Form.Check 
                      type="checkbox" 
                      label="Status da Negociação" 
                      checked={visibleColumns.status_negociacao} 
                      onChange={() => {}} 
                    />
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleColumnToggle('consultor')}>
                    <Form.Check 
                      type="checkbox" 
                      label="Consultor" 
                      checked={visibleColumns.consultor} 
                      onChange={() => {}} 
                    />
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleColumnToggle('total_linhas')}>
                    <Form.Check 
                      type="checkbox" 
                      label="Total de Linhas" 
                      checked={visibleColumns.total_linhas} 
                      onChange={() => {}} 
                    />
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleColumnToggle('filiais')}>
                    <Form.Check 
                      type="checkbox" 
                      label="Filiais" 
                      checked={visibleColumns.filiais} 
                      onChange={() => {}} 
                    />
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>

          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      {visibleColumns.numero_contrato && <th>Nº Contrato</th>}
                      {visibleColumns.nome_razao_social && <th>Nome/Razão Social</th>}
                      {visibleColumns.tipo_pessoa && <th>Tipo</th>}
                      {visibleColumns.cpf_cnpj && <th>CPF/CNPJ</th>}
                      {visibleColumns.data_entrada && <th>Data Entrada</th>}
                      {visibleColumns.status_negociacao && <th>Status</th>}
                      {visibleColumns.consultor && <th>Consultor</th>}
                      {visibleColumns.total_linhas && <th>Linhas</th>}
                      {visibleColumns.filiais && <th>Filiais</th>}
                      <th className="text-end">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prospeccoes.length > 0 ? (
                      prospeccoes.map((prospeccao) => (
                        <tr key={prospeccao.id}>
                          {visibleColumns.numero_contrato && <td>{prospeccao.numero_contrato || '-'}</td>}
                          {visibleColumns.nome_razao_social && <td>{prospeccao.nome_razao_social}</td>}
                          {visibleColumns.tipo_pessoa && <td>{prospeccao.tipo_pessoa === 'PF' ? 'Física' : 'Jurídica'}</td>}
                          {visibleColumns.cpf_cnpj && <td>{prospeccao.cpf_cnpj}</td>}
                          {visibleColumns.data_entrada && <td>{formatDate(prospeccao.data_entrada)}</td>}
                          {visibleColumns.status_negociacao && <td>{prospeccao.status_negociacao?.nome || '-'}</td>}
                          {visibleColumns.consultor && <td>{prospeccao.consultor?.nome || '-'}</td>}
                          {visibleColumns.total_linhas && <td>{prospeccao.total_linhas || '0'}</td>}
                          {visibleColumns.filiais && <td>{prospeccao.filiais || '0'}</td>}
                          <td className="text-end">
                            <Button
                              variant="outline-info"
                              size="sm"
                              className="me-1"
                              onClick={() => handleView(prospeccao)}
                              title="Visualizar"
                            >
                              <FaEye />
                            </Button>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-1"
                              onClick={() => handleEdit(prospeccao)}
                              title="Editar"
                            >
                              <FaEdit />
                            </Button>
                            {showArquivados ? (
                              <Button
                                variant="outline-success"
                                size="sm"
                                className="me-1"
                                onClick={() => handleUnarchive(prospeccao.id)}
                                title="Desarquivar"
                              >
                                <FaArchive />
                              </Button>
                            ) : (
                              <Button
                                variant="outline-warning"
                                size="sm"
                                className="me-1"
                                onClick={() => handleArchive(prospeccao.id)}
                                title="Arquivar"
                              >
                                <FaArchive />
                              </Button>
                            )}
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(prospeccao.id)}
                              title="Excluir"
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" className="text-center py-4">
                          Nenhuma prospecção encontrada
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProspeccaoList;
