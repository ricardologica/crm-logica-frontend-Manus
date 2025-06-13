import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Dropdown } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaEdit, FaArchive, FaTrash, FaSearch, FaPlus, FaFilter, FaCog, FaEye } from 'react-icons/fa';
import Pagination from '../common/Pagination';
import PendenciaForm from './PendenciaForm';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const PendenciaList = () => {
  const [pendencias, setPendencias] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentPendencia, setCurrentPendencia] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArquivados, setShowArquivados] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [clienteFilter, setClienteFilter] = useState('');
  const [statusOptions, setStatusOptions] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState({
    data_entrada: true,
    data_prevista: true,
    data_finalizacao: true,
    status_pendencia: true,
    cliente: true,
    aba_mae: true,
    aba_principal: true,
    colaborador: true,
    descricao: true,
    visto_gerencia: true
  });

  // Função para carregar pendências
  const loadPendencias = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        per_page: 10,
        search: searchTerm,
        arquivado: showArquivados
      };
      
      if (statusFilter) {
        params.status_pendencia_id = statusFilter;
      }
      
      if (clienteFilter) {
        params.cliente_id = clienteFilter;
      }
      
      const response = await axios.get(`${API_BASE_URL}/pendencias`, { params });
      setPendencias(response.data.pendencias || []);
      setTotalPages(response.data.pages || 0);
    } catch (error) {
      console.error('Erro ao carregar pendências:', error);
      toast.error('Erro ao carregar pendências');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, showArquivados, statusFilter, clienteFilter]);

  // Carregar status de pendência para filtro
  const loadStatusOptions = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categorias?tipo=status_pendencia`);
      setStatusOptions(response.data.categorias || []);
    } catch (error) {
      console.error('Erro ao carregar status de pendência:', error);
    }
  }, []);

  // Carregar clientes para filtro
  const loadClientes = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/clientes`);
      setClientes(response.data.clientes || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  }, []);

  useEffect(() => {
    loadPendencias();
  }, [loadPendencias]);

  useEffect(() => {
    loadStatusOptions();
    loadClientes();
  }, [loadStatusOptions, loadClientes]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadPendencias();
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

  const handleClienteFilterChange = (e) => {
    setClienteFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleColumnToggle = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const handleView = (pendencia) => {
    setCurrentPendencia(pendencia);
    setShowForm(true);
  };

  const handleEdit = (pendencia) => {
    setCurrentPendencia(pendencia);
    setShowForm(true);
  };

  const handleCreate = () => {
    setCurrentPendencia(null);
    setShowForm(true);
  };

  const handleSave = () => {
    setShowForm(false);
    loadPendencias();
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const handleArchive = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/pendencias/${id}/arquivar`);
      toast.success('Pendência arquivada com sucesso!');
      loadPendencias();
    } catch (error) {
      console.error('Erro ao arquivar pendência:', error);
      toast.error('Erro ao arquivar pendência');
    }
  };

  const handleUnarchive = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/pendencias/${id}/desarquivar`);
      toast.success('Pendência desarquivada com sucesso!');
      loadPendencias();
    } catch (error) {
      console.error('Erro ao desarquivar pendência:', error);
      toast.error('Erro ao desarquivar pendência');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta pendência?')) {
      try {
        await axios.delete(`${API_BASE_URL}/pendencias/${id}`);
        toast.success('Pendência excluída com sucesso!');
        loadPendencias();
      } catch (error) {
        console.error('Erro ao excluir pendência:', error);
        toast.error('Erro ao excluir pendência');
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
        <PendenciaForm 
          pendencia={currentPendencia} 
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
            <h2 className="mb-0">Pendências</h2>
            <Button variant="primary" onClick={handleCreate}>
              <FaPlus className="me-2" /> Nova Pendência
            </Button>
          </div>

          <Row className="mb-4">
            <Col md={3}>
              <Form onSubmit={handleSearch}>
                <div className="d-flex">
                  <Form.Control
                    type="text"
                    placeholder="Buscar pendências..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <Button variant="outline-primary" type="submit" className="ms-2">
                    <FaSearch />
                  </Button>
                </div>
              </Form>
            </Col>
            <Col md={3}>
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
            <Col md={3}>
              <Form.Select
                value={clienteFilter}
                onChange={handleClienteFilterChange}
              >
                <option value="">Todos os clientes</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome_razao_social}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3} className="d-flex justify-content-end">
              <Button 
                variant={showArquivados ? "warning" : "outline-secondary"} 
                onClick={toggleArquivados}
                className="me-2"
              >
                <FaArchive className="me-1" /> {showArquivados ? 'Mostrar Ativas' : 'Mostrar Arquivadas'}
              </Button>
              
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" id="dropdown-columns">
                  <FaCog className="me-1" /> Colunas
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => handleColumnToggle('data_entrada')}>
                    <Form.Check 
                      type="checkbox" 
                      label="Data de Entrada" 
                      checked={visibleColumns.data_entrada} 
                      onChange={() => {}} 
                    />
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleColumnToggle('data_prevista')}>
                    <Form.Check 
                      type="checkbox" 
                      label="Data Prevista" 
                      checked={visibleColumns.data_prevista} 
                      onChange={() => {}} 
                    />
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleColumnToggle('data_finalizacao')}>
                    <Form.Check 
                      type="checkbox" 
                      label="Data de Finalização" 
                      checked={visibleColumns.data_finalizacao} 
                      onChange={() => {}} 
                    />
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleColumnToggle('status_pendencia')}>
                    <Form.Check 
                      type="checkbox" 
                      label="Status" 
                      checked={visibleColumns.status_pendencia} 
                      onChange={() => {}} 
                    />
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleColumnToggle('cliente')}>
                    <Form.Check 
                      type="checkbox" 
                      label="Cliente" 
                      checked={visibleColumns.cliente} 
                      onChange={() => {}} 
                    />
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleColumnToggle('aba_mae')}>
                    <Form.Check 
                      type="checkbox" 
                      label="Aba Mãe" 
                      checked={visibleColumns.aba_mae} 
                      onChange={() => {}} 
                    />
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleColumnToggle('aba_principal')}>
                    <Form.Check 
                      type="checkbox" 
                      label="Aba Principal" 
                      checked={visibleColumns.aba_principal} 
                      onChange={() => {}} 
                    />
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleColumnToggle('colaborador')}>
                    <Form.Check 
                      type="checkbox" 
                      label="Colaborador" 
                      checked={visibleColumns.colaborador} 
                      onChange={() => {}} 
                    />
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleColumnToggle('descricao')}>
                    <Form.Check 
                      type="checkbox" 
                      label="Descrição" 
                      checked={visibleColumns.descricao} 
                      onChange={() => {}} 
                    />
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleColumnToggle('visto_gerencia')}>
                    <Form.Check 
                      type="checkbox" 
                      label="Visto Gerência" 
                      checked={visibleColumns.visto_gerencia} 
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
                      {visibleColumns.data_entrada && <th>Data Entrada</th>}
                      {visibleColumns.data_prevista && <th>Data Prevista</th>}
                      {visibleColumns.data_finalizacao && <th>Data Finalização</th>}
                      {visibleColumns.status_pendencia && <th>Status</th>}
                      {visibleColumns.cliente && <th>Cliente</th>}
                      {visibleColumns.aba_mae && <th>Aba Mãe</th>}
                      {visibleColumns.aba_principal && <th>Aba Principal</th>}
                      {visibleColumns.colaborador && <th>Colaborador</th>}
                      {visibleColumns.descricao && <th>Descrição</th>}
                      {visibleColumns.visto_gerencia && <th>Visto Gerência</th>}
                      <th className="text-end">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendencias.length > 0 ? (
                      pendencias.map((pendencia) => (
                        <tr key={pendencia.id}>
                          {visibleColumns.data_entrada && <td>{formatDate(pendencia.data_entrada)}</td>}
                          {visibleColumns.data_prevista && <td>{formatDate(pendencia.data_prevista)}</td>}
                          {visibleColumns.data_finalizacao && <td>{formatDate(pendencia.data_finalizacao)}</td>}
                          {visibleColumns.status_pendencia && <td>{pendencia.status_pendencia?.nome || '-'}</td>}
                          {visibleColumns.cliente && <td>{pendencia.cliente?.nome_razao_social || '-'}</td>}
                          {visibleColumns.aba_mae && <td>{pendencia.aba_mae || '-'}</td>}
                          {visibleColumns.aba_principal && <td>{pendencia.aba_principal || '-'}</td>}
                          {visibleColumns.colaborador && <td>{pendencia.colaborador?.nome || '-'}</td>}
                          {visibleColumns.descricao && <td>{pendencia.descricao || '-'}</td>}
                          {visibleColumns.visto_gerencia && <td>{pendencia.visto_gerencia ? 'Sim' : 'Não'}</td>}
                          <td className="text-end">
                            <Button
                              variant="outline-info"
                              size="sm"
                              className="me-1"
                              onClick={() => handleView(pendencia)}
                              title="Visualizar"
                            >
                              <FaEye />
                            </Button>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-1"
                              onClick={() => handleEdit(pendencia)}
                              title="Editar"
                            >
                              <FaEdit />
                            </Button>
                            {showArquivados ? (
                              <Button
                                variant="outline-success"
                                size="sm"
                                className="me-1"
                                onClick={() => handleUnarchive(pendencia.id)}
                                title="Desarquivar"
                              >
                                <FaArchive />
                              </Button>
                            ) : (
                              <Button
                                variant="outline-warning"
                                size="sm"
                                className="me-1"
                                onClick={() => handleArchive(pendencia.id)}
                                title="Arquivar"
                              >
                                <FaArchive />
                              </Button>
                            )}
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(pendencia.id)}
                              title="Excluir"
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="11" className="text-center py-4">
                          Nenhuma pendência encontrada
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

export default PendenciaList;
