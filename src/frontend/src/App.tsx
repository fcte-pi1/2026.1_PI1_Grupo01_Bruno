import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { BottomBar } from './components/BottomBar'
import { Footer } from './components/Footer'
import { Connection } from './components/Connection'
import { Battery } from './components/Battery'
import { Breadcrumb } from './components/Breadcrumb'
import { Dashboard } from './pages/Dashboard/Dashboard'
import { Historico } from './pages/Historico/Historico'
import { Projeto } from './pages/Projeto/Projeto'
import { Equipe } from './pages/Equipe/Equipe'
<<<<<<< HEAD
import { TesteIntegracao } from './pages/TesteIntegracao'
=======
import { Percurso } from './pages/Percurso/Percurso'
>>>>>>> f285209e2e2ae3683a6bf6a9d05bc60f4b70ffe7
import { useState, useEffect } from 'react'
import './index.css'
import type { Page } from './types/navigation'
import { PAGE_CONFIG } from './config/pages'
import styles from './App.module.css'

function AppLayout(){
  const navigate = useNavigate()
  const location = useLocation()
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [connection, setConnection] = useState({ status: 'connected' as 'connected' | 'warn' | 'disconnected', port: 'COM3' })
  const [battery, setBattery] = useState({ level: 80, voltage: 7.4 })

  const currentPage = (Object.entries(PAGE_CONFIG).find(
    ([, config]) => config.route === location.pathname
  )?.[0] ?? 'dashboard') as Page

  const { label, description, showTopPage } = PAGE_CONFIG[currentPage]

  const handlePageChange = (page: Page) => {
    navigate(PAGE_CONFIG[page].route)
  }

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.dataset.theme = next
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    document.title = `XAROPi | ${label}`
  }, [currentPage])

  return (
    <>
      <Header
        theme={theme}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onThemeToggle={toggleTheme}
      />

<<<<<<< HEAD
        <main>
          <div className="Center">
            {currentPage !== 'dashboard' && <Breadcrumb />}
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/historico" element={<Historico />} />
              <Route path="/projeto" element={<Projeto />} />
              <Route path="/equipe" element={<Equipe />} />
              <Route path="/teste" element={<TesteIntegracao />} />
            </Routes>
          </div>
=======
      <main>
        <div className="Center">
          {currentPage !== 'dashboard' && <Breadcrumb />}
>>>>>>> f285209e2e2ae3683a6bf6a9d05bc60f4b70ffe7

          {showTopPage && (
            <div className={styles.TopPage}>
              <div className={styles.TopPageLeft}>
                <h1>{label}</h1>
                <p>{description}</p>
              </div>
              <div className={styles.TopPageRight}>
                <Connection status={connection.status} port={connection.port} />
                <Battery level={battery.level} voltage={battery.voltage} />
              </div>
            </div>
          )}

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/historico" element={<Historico />} />
            <Route path="/projeto" element={<Projeto />} />
            <Route path="/equipe" element={<Equipe />} />
            <Route path="/percurso" element={<Percurso />} />
          </Routes>
        </div>

        <Footer />
      </main>

      <BottomBar
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App