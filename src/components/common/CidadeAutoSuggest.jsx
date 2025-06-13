import React, { useState, useEffect } from 'react';
import { Form, Typeahead } from 'react-bootstrap';

const CidadeAutoSuggest = ({ cidades, value, onChange, disabled = false }) => {
  const [selected, setSelected] = useState([]);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    // Formatar as opções para exibir cidade e UF
    if (cidades && cidades.length > 0) {
      const formattedOptions = cidades.map(cidade => {
        // Extrair UF do nome da cidade, se disponível (formato esperado: "Cidade - UF")
        let nome = cidade.nome;
        let uf = '';
        
        if (nome.includes(' - ')) {
          const parts = nome.split(' - ');
          nome = parts[0];
          uf = parts[1];
        }
        
        return {
          id: cidade.id,
          nome: nome,
          uf: uf,
          label: uf ? `${nome} - ${uf}` : nome
        };
      });
      
      setOptions(formattedOptions);
    }
  }, [cidades]);

  useEffect(() => {
    // Quando o valor muda externamente, atualiza o estado interno
    if (value) {
      const selectedCity = options.find(option => option.id === parseInt(value));
      if (selectedCity) {
        setSelected([selectedCity]);
      } else {
        setSelected([]);
      }
    } else {
      setSelected([]);
    }
  }, [value, options]);

  const handleChange = (selected) => {
    setSelected(selected);
    if (selected && selected.length > 0) {
      onChange(selected[0].id);
    } else {
      onChange('');
    }
  };

  return (
    <Typeahead
      id="cidade-autocomplete"
      labelKey="label"
      options={options}
      placeholder="Digite para buscar cidade..."
      selected={selected}
      onChange={handleChange}
      disabled={disabled}
      renderMenuItemChildren={(option) => (
        <div>
          {option.label}
        </div>
      )}
    />
  );
};

export default CidadeAutoSuggest;
