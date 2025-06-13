
import React, { useState } from 'react';

export function ConfiguracoesList({ categorias, onAddCategory, onUpdateCategory, onDeleteCategory }) {
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAdd = () => {
    if (newCategoryName.trim()) {
      onAddCategory({ nome: newCategoryName });
      setNewCategoryName('');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Gerenciar Categorias</h2>
      <div className="mb-4 flex">
        <input
          type="text"
          className="border p-2 rounded w-full mr-2"
          placeholder="Nova Categoria"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <button onClick={handleAdd} className="bg-blue-500 text-white p-2 rounded">Adicionar</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categorias.map((categoria) => (
          <div key={categoria.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">{categoria.nome}</h3>
            {/* Aqui você pode adicionar a lógica para subcategorias, edição e exclusão */}
            <button
              onClick={() => onUpdateCategory(categoria.id, { nome: categoria.nome + ' (Editado)' })}
              className="bg-yellow-500 text-white p-2 rounded mr-2 mt-2"
            >
              Editar
            </button>
            <button
              onClick={() => onDeleteCategory(categoria.id)}
              className="bg-red-500 text-white p-2 rounded mt-2"
            >
              Excluir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


