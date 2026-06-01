import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { BottomBar } from './components/BottomBar'
import { Footer } from './components/Footer'
import { Breadcrumb } from './components/Breadcrumb'
import { Dashboard } from './pages/Dashboard/Dashboard'
import { Historico } from './pages/Historico/Historico'
import { Projeto } from './pages/Projeto/Projeto'
import { Equipe } from './pages/Equipe/Equipe'
import { Chassi3D } from './pages/Chassi/Chassi3D'
import { useState, useEffect } from 'react'
import './index.css'
import type { Page } from './types/navigation'

const PAGE_ROUTES: Record<Page, string> = {
  dashboard: '/',
  historico: '/historico',
  projeto: '/projeto',
  equipe: '/equipe',
  chassi: '/chassi',
}

function AppLayout(){
  const navigate = useNavigate()
  const location = useLocation()
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  const currentPage = (Object.entries(PAGE_ROUTES).find(
    ([, path]) => path === location.pathname
  )?.[0] ?? 'dashboard') as Page

  const handlePageChange = (page: Page) => {
    navigate(PAGE_ROUTES[page])
  }

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.dataset.theme = next
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [])

  const PAGE_LABELS: Record<Page, string> = {
    dashboard: 'Dashboard',
    historico: 'Histórico',
    projeto: 'Projeto',
    chassi: 'Chassi',
    equipe: 'Equipe',
  }

  useEffect(() => {
    document.title = `XAROPi | ${PAGE_LABELS[currentPage]}`
  }, [currentPage])

  return (
    <>
        <Header
            theme={theme}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onThemeToggle={toggleTheme}
        />

        <main>
          <div className="Center">
            {currentPage !== 'dashboard' && currentPage !== 'chassi' && <Breadcrumb />}
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/historico" element={<Historico />} />
              <Route path="/projeto" element={<Projeto />} />
              <Route path="/equipe" element={<Equipe />} />
              <Route path="/chassi" element={<Chassi3D />} />
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
