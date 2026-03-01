import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import SalesList from './pages/SalesList';
import YardiSync from './pages/YardiSync';
import Properties from './pages/Properties';
import Buyers from './pages/Buyers';
import Brokers from './pages/Brokers';
import Payments from './pages/Payments';
import AIEngine from './pages/AIEngine';
import Analytics from './pages/Analytics';
import Compliance from './pages/Compliance';

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-slate-950">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="absolute top-0 right-0 p-32 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 p-40 bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/sales" element={<SalesList />} />
              <Route path="/buyers" element={<Buyers />} />
              <Route path="/brokers" element={<Brokers />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/ai-engine" element={<AIEngine />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/yardi" element={<YardiSync />} />
              <Route path="/compliance" element={<Compliance />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
