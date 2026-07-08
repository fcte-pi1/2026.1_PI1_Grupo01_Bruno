import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { BottomBar } from './components/BottomBar';
import { Footer } from './components/Footer';
import { Connection } from './components/Connection';
import { Battery } from './components/Battery';
import { Breadcrumb } from './components/Breadcrumb';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Historico } from './pages/Historico/Historico';
import { Projeto } from './pages/Projeto/Projeto';
import { Equipe } from './pages/Equipe/Equipe';
import { Percurso } from './pages/Percurso/Percurso';
import { Chassi3D } from './pages/Chassi/Chassi3D';
import { useState, useEffect } from 'react';
import { socket } from './socket'; 
import './index.css';
import type { Page } from './types/navigation';
import { PAGE_CONFIG } from './config/pages';
import styles from './App.module.css';

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  const [connection, setConnection] = useState<{ status: 'connected' | 'warn' | 'disconnected'; port: string }>({ 
    status: 'disconnected', port: 'C0444' 
  });
  const [battery, setBattery] = useState({ level: 100, voltage: 8.4 });

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    socket.on('novaTelemetria', (dado: any) => {
      setConnection({ status: 'connected', port: 'C0444' });
      
      const calcLevel = dado.mah_restante ? (dado.mah_restante / 1000) * 100 : 100;
      setBattery({ voltage: dado.voltagem || dado.tensao || 8.4, level: Math.floor(calcLevel) });

      clearTimeout(timeout);
      timeout = setTimeout(() => setConnection({ status: 'disconnected', port: 'C0444' }), 3000);
    });

    return () => {
      socket.off('novaTelemetria');
      clearTimeout(timeout);
    };
  }, []);

  const currentPage = (Object.entries(PAGE_CONFIG).find(([, config]) => config.route === location.pathname)?.[0] ?? 'dashboard') as Page;
  const { label, description, showTopPage } = PAGE_CONFIG[currentPage];
  const handlePageChange = (page: Page) => navigate(PAGE_CONFIG[page].route);
  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.dataset.theme = next;
  };

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => { document.title = `XAROPi | ${label}`; }, [label]);

  return (
    <>
      <a href="#main-content" className="skip-link"><span>Pular para o conteúdo principal</span></a>
      <Header theme={theme} currentPage={currentPage} onPageChange={handlePageChange} onThemeToggle={toggleTheme} />

      <div className="Center">
        {currentPage !== 'dashboard' && <Breadcrumb />}

        {showTopPage && (
          <div className={styles.TopPage}>
            <div className={styles.TopPageLeft}>
              <h1>{label}</h1>
              <p>{description}</p>
            </div>
            <div className={styles.TopPageRight} style={{ display: 'flex', gap: '1rem', width: 'auto' }}>
              <Connection status={connection.status} port={connection.port} />
              <Battery level={battery.level} voltage={battery.voltage} />
            </div>
          </div>
        )}

        <main id="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/historico" element={<Historico />} />
            <Route path="/projeto" element={<Projeto />} />
            <Route path="/equipe" element={<Equipe />} />
            <Route path="/percurso" element={<Percurso />} />
            <Route path="/chassi" element={<Chassi3D />} />
          </Routes>
        </main>
      </div>
      <Footer />
      <BottomBar currentPage={currentPage} onPageChange={handlePageChange} />
    </>
  );
}

export default function App() { return <BrowserRouter><AppLayout /></BrowserRouter>; }