import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Dropdown } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaEdit, FaArchive, FaTrash, FaSearch, FaPlus, FaCog } from 'react-icons/fa';
import Pagination from '../common/Pagination';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const ConfiguracoesList = () => {
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showSubcategoriaForm, setShowSubcategoriaForm] = useState(false);
  const [currentCategoria, setCurrentCategoria] = useState(null);
  const [currentSubcategoria, setCurrentSubcategoria] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo: ''
  });
  const [subcategoriaFormData, setSubcategoriaFormData] = useState({
    nome: '',
    descricao: '',
    categoria_id: ''
  });
  const [validated, setValidated] = useState(false);
  const [subcategoriaValidated, setSubcategoriaValidated] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState(null);

  // Função para carregar categorias
  const loadCategorias = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/categorias`, {
        params: {
          page: currentPage,
          per_page: 10,
          search: searchTerm
        }
      });
      setCategorias(response.data.categorias || []);
      setTotalPages(response.data.pages || 0);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm]);

  // Função para carregar subcategorias de uma categoria específica
  const loadSubcategorias = useCallback(async (categoriaId) => {
    if (!categoriaId) return;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/categorias/${categoriaId}/subcategorias`);
      setSubcategorias(response.data.subcategorias || []);
      
      // Encontrar e definir a categoria selecionada
      const categoria = categorias.find(cat => cat.id === parseInt(categoriaId));
      setSelectedCategoria(categoria || null);
    } catch (error) {
      console.error('Erro ao carregar subcategorias:', error);
      toast.error('Erro ao carregar subcategorias');
    }
  }, [categorias]);

  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCategorias();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoriaClick = (categoriaId) => {
    loadSubcategorias(categoriaId);
  };

  // Funções para o formulário de categoria
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateCategoria = () => {
    setCurrentCategoria(null);
    setFormData({
      nome: '',
      descricao: '',
      tipo: ''
    });
    setShowForm(true);
  };

  const handleEditCategoria = (categoria) => {
    setCurrentCategoria(categoria);
    setFormData({
      nome: categoria.nome,
      descricao: categoria.descricao || '',
      tipo: categoria.tipo || ''
    });
    setShowForm(true);
  };

  const handleCategoriaSubmit = async (e) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    try {
      if (currentCategoria) {
        // Editar categoria existente
        await axios.put(`${API_BASE_URL}/categorias/${currentCategoria.id}`, formData);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        // Criar nova categoria
        await axios.post(`${API_BASE_URL}/categorias`, formData);
        toast.success('Categoria criada com sucesso!');
      }
      
      setShowForm(false);
      loadCategorias();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast.error('Erro ao salvar categoria');
    }
  };

  const handleCancelCategoria = () => {
    setShowForm(false);
    setValidated(false);
  };

  const handleArchiveCategoria = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/categorias/${id}/arquivar`);
      toast.success('Categoria arquivada com sucesso!');
      loadCategorias();
    } catch (error) {
      console.error('Erro ao arquivar categoria:', error);
      toast.error('Erro ao arquivar categoria');
    }
  };

  const handleDeleteCategoria = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.')) {
      try {
        await axios.delete(`${API_BASE_URL}/categorias/${id}`);
        toast.success('Categoria excluída com sucesso!');
        loadCategorias();
      } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        toast.error('Erro ao excluir categoria');
      }
    }
  };

  // Funções para o formulário de subcategoria
  const handleSubcategoriaFormChange = (e) => {
    const { name, value } = e.target;
    setSubcategoriaFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSubcategoria = () => {
    if (!selectedCategoria) {
      toast.warning('Selecione uma categoria primeiro');
      return;
    }
    
    setCurrentSubcategoria(null);
    setSubcategoriaFormData({
      nome: '',
      descricao: '',
      categoria_id: selectedCategoria.id
    });
    setShowSubcategoriaForm(true);
  };

  const handleEditSubcategoria = (subcategoria) => {
    setCurrentSubcategoria(subcategoria);
    setSubcategoriaFormData({
      nome: subcategoria.nome,
      descricao: subcategoria.descricao || '',
      categoria_id: subcategoria.categoria_id
    });
    setShowSubcategoriaForm(true);
  };

  const handleSubcategoriaSubmit = async (e) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setSubcategoriaValidated(true);
      return;
    }
    
    try {
      if (currentSubcategoria) {
        // Editar subcategoria existente
        await axios.put(`${API_BASE_URL}/subcategorias/${currentSubcategoria.id}`, subcategoriaFormData);
        toast.success('Subcategoria atualizada com sucesso!');
      } else {
        // Criar nova subcategoria
        await axios.post(`${API_BASE_URL}/subcategorias`, subcategoriaFormData);
        toast.success('Subcategoria criada com sucesso!');
      }
      
      setShowSubcategoriaForm(false);
      loadSubcategorias(selectedCategoria.id);
    } catch (error) {
      console.error('Erro ao salvar subcategoria:', error);
      toast.error('Erro ao salvar subcategoria');
    }
  };

  const handleCancelSubcategoria = () => {
    setShowSubcategoriaForm(false);
    setSubcategoriaValidated(false);
  };

  const handleArchiveSubcategoria = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/subcategorias/${id}/arquivar`);
      toast.success('Subcategoria arquivada com sucesso!');
      loadSubcategorias(selectedCategoria.id);
    } catch (error) {
      console.error('Erro ao arquivar subcategoria:', error);
      toast.error('Erro ao arquivar subcategoria');
    }
  };

  const handleDeleteSubcategoria = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta subcategoria? Esta ação não pode ser desfeita.')) {
      try {
        await axios.delete(`${API_BASE_URL}/subcategorias/${id}`);
        toast.success('Subcategoria excluída com sucesso!');
        loadSubcategorias(selectedCategoria.id);
      } catch (error) {
        console.error('Erro ao excluir subcategoria:', error);
        toast.error('Erro ao excluir subcategoria');
      }
    }
  };

  // Renderização do formulário de categoria
  if (showForm) {
    return (
      <Container fluid className="py-4">
        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title>{currentCategoria ? 'Editar Categoria' : 'Nova Categoria'}</Card.Title>
            <Form noValidate validated={validated} onSubmit={handleCategoriaSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Nome</Form.Label>
                <Form.Control
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleFormChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Nome é obrigatório
                </Form.Control.Feedback>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Tipo</Form.Label>
                <Form.Control
                  type="text"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleFormChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Tipo é obrigatório
                </Form.Control.Feedback>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Descrição</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleFormChange}
                />
              </Form.Group>
              
              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={handleCancelCategoria} className="me-2">
                  Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  Salvar
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // Renderização do formulário de subcategoria
  if (showSubcategoriaForm) {
    return (
      <Container fluid className="py-4">
        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title>{currentSubcategoria ? 'Editar Subcategoria' : 'Nova Subcategoria'}</Card.Title>
            <Form noValidate validated={subcategoriaValidated} onSubmit={handleSubcategoriaSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Categoria</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedCategoria?.nome || ''}
                  disabled
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Nome</Form.Label>
                <Form.Control
                  type="text"
                  name="nome"
                  value={subcategoriaFormData.nome}
                  onChange={handleSubcategoriaFormChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Nome é obrigatório
                </Form.Control.Feedback>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Descrição</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="descricao"
                  value={subcategoriaFormData.descricao}
                  onChange={handleSubcategoriaFormChange}
                />
              </Form.Group>
              
              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={handleCancelSubcategoria} className="me-2">
                  Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  Salvar
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row>
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Categorias</h2>
                <Button variant="primary" onClick={handleCreateCategoria}>
                  <FaPlus className="me-2" /> Nova Categoria
                </Button>
              </div>

              <Form onSubmit={handleSearch} className="mb-4">
                <div className="d-flex">
                  <Form.Control
                    type="text"
                    placeholder="Buscar categorias..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <Button variant="outline-primary" type="submit" className="ms-2">
                    <FaSearch />
                  </Button>
                </div>
              </Form>

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
                          <th>Nome</th>
                          <th>Tipo</th>
                          <th className="text-end">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categorias.length > 0 ? (
                          categorias.map((categoria) => (
                            <tr 
                              key={categoria.id} 
                              onClick={() => handleCategoriaClick(categoria.id)}
                              className={selectedCategoria?.id === categoria.id ? 'table-primary' : ''}
                              style={{ cursor: 'pointer' }}
                            >
                              <td>{categoria.nome}</td>
                              <td>{categoria.tipo}</td>
                              <td className="text-end">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="me-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditCategoria(categoria);
                                  }}
                                  title="Editar"
                                >
                                  <FaEdit />
                                </Button>
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  className="me-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleArchiveCategoria(categoria.id);
                                  }}
                                  title="Arquivar"
                                >
                                  <FaArchive />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCategoria(categoria.id);
                                  }}
                                  title="Excluir"
                                >
                                  <FaTrash />
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="text-center py-4">
                              Nenhuma categoria encontrada
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
        </Col>

        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">
                  {selectedCategoria ? `Subcategorias de ${selectedCategoria.nome}` : 'Subcategorias'}
                </h2>
                <Button 
                  variant="primary" 
                  onClick={handleCreateSubcategoria}
                  disabled={!selectedCategoria}
                >
                  <FaPlus className="me-2" /> Nova Subcategoria
                </Button>
              </div>

              {!selectedCategoria ? (
                <div className="text-center py-5">
                  <p className="text-muted">Selecione uma categoria para ver suas subcategorias</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Descrição</th>
                        <th className="text-end">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subcategorias.length > 0 ? (
                        subcategorias.map((subcategoria) => (
                          <tr key={subcategoria.id}>
                            <td>{subcategoria.nome}</td>
                            <td>{subcategoria.descricao || '-'}</td>
                            <td className="text-end">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-1"
                                onClick={() => handleEditSubcategoria(subcategoria)}
                                title="Editar"
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="outline-warning"
                                size="sm"
                                className="me-1"
                                onClick={() => handleArchiveSubcategoria(subcategoria.id)}
                                title="Arquivar"
                              >
                                <FaArchive />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteSubcategoria(subcategoria.id)}
                                title="Excluir"
                              >
                                <FaTrash />
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center py-4">
                            Nenhuma subcategoria encontrada
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ConfiguracoesList;
