import { useEffect, useState } from 'react'
import HomeScreen from './components/HomeScreen'
import EntryFormScreen from './components/EntryFormScreen'
import ExitScreen from './components/ExitScreen'
import LoginScreen from './components/LoginScreen'
import { VIEWS } from './constants/views'
import './App.css'

function App() {
  const [view, setView] = useState(VIEWS.HOME)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    // Verificar si hay sesión guardada
    const savedUser = localStorage.getItem('visitas_user')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        if (user && user.id && user.nombre) {
          setIsAuthenticated(true)
        }
      } catch (err) {
        localStorage.removeItem('visitas_user')
      }
    }
    setIsCheckingAuth(false)
  }, [])

  const handleLogin = (user) => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('visitas_user')
    setIsAuthenticated(false)
    setView(VIEWS.HOME)
  }

  const handleGoHome = () => setView(VIEWS.HOME)

  if (isCheckingAuth) {
    return (
      <div className="screen">
        <div className="placeholder-card">Cargando…</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />
  }

  switch (view) {
    case VIEWS.ENTRY:
      return <EntryFormScreen onBack={handleGoHome} />
    case VIEWS.EXIT:
      return <ExitScreen onBack={handleGoHome} />
    default:
      return <HomeScreen onSelect={setView} onLogout={handleLogout} />
  }
}

export default App
