
import React, { useState, useEffect } from 'react';
import { ConfiguracoesList } from '../components/Configuracoes/ConfiguracoesList';

function Configuracoes() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      setError("Erro ao carregar categorias.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (newCategory) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchCategorias(); // Recarrega as categorias após adicionar
    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
      setError("Erro ao adicionar categoria.");
    }
  };

  const handleUpdateCategory = async (id, updatedCategory) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCategory),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchCategorias(); // Recarrega as categorias após atualizar
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      setError("Erro ao atualizar categoria.");
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchCategorias(); // Recarrega as categorias após deletar
    } catch (error) {
      console.error("Erro ao deletar categoria:", error);
      setError("Erro ao deletar categoria.");
    }
  };

  if (loading) return <p>Carregando configurações...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Configurações</h1>
      <ConfiguracoesList
        categorias={categorias}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  );
}

export default Configuracoes;


