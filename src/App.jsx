import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Plus, Edit, Archive, Search, Settings, Users, FileText, BarChart3, Building, Phone, CreditCard, FileCheck, DollarSign, AlertCircle, Calendar, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import './App.css';

const API_BASE_URL = 'https://lnh8imcdjy61.manus.space/api';

function App() {
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'categoria' ou 'subcategoria'
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('configuracoes');

  // Estados para formulários
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo: '',
    categoria_id: ''
  });

  // Carregar dados iniciais
  useEffect(() => {
    fetchCategorias();
    fetchSubcategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/categorias`);
      const data = await response.json();
      if (data.success) {
        setCategorias(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategorias = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/subcategorias`);
      const data = await response.json();
      if (data.success) {
        setSubcategorias(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar subcategorias:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingItem 
        ? `${API_BASE_URL}/${dialogType}s/${editingItem.id}`
        : `${API_BASE_URL}/${dialogType}s`;
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        setIsDialogOpen(false);
        resetForm();
        fetchCategorias();
        fetchSubcategorias();
      } else {
        alert(data.message || 'Erro ao salvar');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (type, id) => {
    if (!confirm('Tem certeza que deseja arquivar este item?')) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/${type}s/${id}/arquivar`, {
        method: 'PUT',
      });

      const data = await response.json();
      
      if (data.success) {
        fetchCategorias();
        fetchSubcategorias();
      } else {
        alert(data.message || 'Erro ao arquivar');
      }
    } catch (error) {
      console.error('Erro ao arquivar:', error);
      alert('Erro ao arquivar');
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (type, item = null) => {
    setDialogType(type);
    setEditingItem(item);
    
    if (item) {
      setFormData({
        nome: item.nome || '',
        descricao: item.descricao || '',
        tipo: item.tipo || '',
        categoria_id: item.categoria_id || ''
      });
    } else {
      resetForm();
    }
    
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      tipo: '',
      categoria_id: ''
    });
    setEditingItem(null);
  };

  const filteredCategorias = categorias.filter(cat => 
    cat.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.tipo && cat.tipo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
    { id: 'prospeccoes', label: 'Prospecções', icon: Search },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'filiais', label: 'Filiais', icon: Building },
    { id: 'titularidades', label: 'Titularidades', icon: FileCheck },
    { id: 'contas', label: 'Contas', icon: CreditCard },
    { id: 'contratos', label: 'Contratos', icon: FileText },
    { id: 'faturas', label: 'Faturas Lógica', icon: DollarSign },
    { id: 'linhas', label: 'Linhas', icon: Phone },
    { id: 'faturas-mensais', label: 'Faturas Mensais', icon: Calendar },
    { id: 'servicos', label: 'Serviços e Contestações', icon: AlertCircle },
    { id: 'pendencias', label: 'Pendências', icon: AlertCircle },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
    { id: 'gerenciamento', label: 'Gerenciamento', icon: Settings },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">CRM Lógica</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-blue-600 border-blue-300">
                Sistema de Gestão
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg h-screen sticky top-0">
          <nav className="mt-8">
            <div className="px-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Módulos do Sistema
              </h2>
            </div>
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg mx-2 transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </motion.button>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === 'configuracoes' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h2>
                <p className="text-gray-600">Gerencie categorias e subcategorias para padronizar o sistema</p>
              </div>

              {/* Search and Actions */}
              <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar categorias..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => openDialog('categoria')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Categoria
                  </Button>
                  <Button 
                    onClick={() => openDialog('subcategoria')}
                    variant="outline"
                    className="border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Subcategoria
                  </Button>
                </div>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategorias.map((categoria) => (
                  <motion.div
                    key={categoria.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow border-blue-200">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg text-blue-900">{categoria.nome}</CardTitle>
                            {categoria.tipo && (
                              <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-700">
                                {categoria.tipo}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openDialog('categoria', categoria)}
                              className="h-8 w-8 p-0 hover:bg-blue-100"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleArchive('categoria', categoria.id)}
                              className="h-8 w-8 p-0 hover:bg-red-100"
                            >
                              <Archive className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                        {categoria.descricao && (
                          <CardDescription className="mt-2">{categoria.descricao}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Subcategorias:</span>
                            <span className="font-medium">{categoria.subcategorias?.length || 0}</span>
                          </div>
                          {categoria.subcategorias && categoria.subcategorias.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {categoria.subcategorias.slice(0, 3).map((sub) => (
                                <Badge key={sub.id} variant="outline" className="text-xs border-blue-300 text-blue-600">
                                  {sub.nome}
                                </Badge>
                              ))}
                              {categoria.subcategorias.length > 3 && (
                                <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
                                  +{categoria.subcategorias.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {filteredCategorias.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Settings className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma categoria encontrada</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Tente ajustar sua busca.' : 'Comece criando uma nova categoria.'}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab !== 'configuracoes' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12"
            >
              <div className="mx-auto h-12 w-12 text-blue-400 mb-4">
                {React.createElement(menuItems.find(item => item.id === activeTab)?.icon || Settings, { className: "h-12 w-12" })}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {menuItems.find(item => item.id === activeTab)?.label}
              </h3>
              <p className="text-gray-500">Este módulo será implementado em breve.</p>
            </motion.div>
          )}
        </main>
      </div>

      {/* Dialog for Create/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar' : 'Nova'} {dialogType === 'categoria' ? 'Categoria' : 'Subcategoria'}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? 'Edite as informações' : 'Preencha as informações'} da {dialogType === 'categoria' ? 'categoria' : 'subcategoria'}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nome" className="text-right">
                  Nome
                </Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="descricao" className="text-right">
                  Descrição
                </Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              {dialogType === 'categoria' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tipo" className="text-right">
                    Tipo
                  </Label>
                  <Input
                    id="tipo"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="col-span-3"
                    placeholder="ex: geral, linhas, contas"
                  />
                </div>
              )}
              {dialogType === 'subcategoria' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="categoria" className="text-right">
                    Categoria
                  </Label>
                  <Select
                    value={formData.categoria_id}
                    onValueChange={(value) => setFormData({ ...formData, categoria_id: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;

