import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/ui/sidebar'; // Caminho corrigido
import Dashboard from './pages/Dashboard';
import Configuracoes from './pages/Configuracoes';
import Prospeccoes from './pages/Prospeccoes';
import Pendencias from './pages/Pendencias';
import Clientes from './pages/Clientes';
import Filiais from './pages/Filiais';
import Titularidades from './pages/Titularidades';
import Contas from './pages/Contas';
import Contratos from './pages/Contratos';
import FaturasLogica from './pages/FaturasLogica';
import FaturasMensais from './pages/FaturasMensais';
import ServicosContestacoes from './pages/ServicosContestacoes';
import Relatorios from './pages/Relatorios';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
            <div className="container mx-auto px-6 py-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
                <Route path="/prospeccoes" element={<Prospeccoes />} />
                <Route path="/pendencias" element={<Pendencias />} />
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/filiais" element={<Filiais />} />
                <Route path="/titularidades" element={<Titularidades />} />
                <Route path="/contas" element={<Contas />} />
                <Route path="/contratos" element={<Contratos />} />
                <Route path="/faturas-logica" element={<FaturasLogica />} />
                <Route path="/faturas-mensais" element={<FaturasMensais />} />
                <Route path="/servicos-contestacoes" element={<ServicosContestacoes />} />
                <Route path="/relatorios" element={<Relatorios />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
