import { useState } from 'react'
import { VIEWS } from '../constants/views'
import heisLogo from '../assets/branding/heis_logo.png'
import RecentVisitsPanel from './RecentVisitsPanel'
import PasswordPrompt from './PasswordPrompt'

function HomeScreen({ onSelect }) {
  const [showRecent, setShowRecent] = useState(false)
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)

  const getCurrentUser = () => {
    const savedUser = localStorage.getItem('visitas_user')
    if (savedUser) {
      try {
        return JSON.parse(savedUser)
      } catch {
        return null
      }
    }
    return null
  }

  const handleShowRecentClick = () => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setShowPasswordPrompt(true)
    }
  }

  const handlePasswordSuccess = () => {
    setShowPasswordPrompt(false)
    setShowRecent(true)
  }

  const handlePasswordCancel = () => {
    setShowPasswordPrompt(false)
  }

  const currentUser = getCurrentUser()

  return (
    <div className="screen">
      <header className="screen__header">
        <button
          type="button"
          className="top-left-button"
          title="Últimos registros"
          aria-label="Últimos registros"
          onClick={handleShowRecentClick}
        >
          <span className="icon icon--log" aria-hidden="true">🗒️</span>
        </button>
        <p className="screen__eyebrow screen__eyebrow--home">Bienvenidos a</p>
        <img className="screen__brand" src={heisLogo} alt="HEIS Global" />
        <p className="screen__subtitle">Selecciona una opción para continuar</p>
      </header>

      <div className="screen__content screen__content--center">
        <div className="home-actions">
          <button
            type="button"
            className="home-button home-button--enter"
            onClick={() => onSelect(VIEWS.ENTRY)}
          >
            Entrar
          </button>
          <button
            type="button"
            className="home-button home-button--exit"
            onClick={() => onSelect(VIEWS.EXIT)}
          >
            Salir
          </button>
        </div>
      </div>
      {showPasswordPrompt && currentUser ? (
        <PasswordPrompt
          currentUser={currentUser}
          onSuccess={handlePasswordSuccess}
          onCancel={handlePasswordCancel}
        />
      ) : null}
      {showRecent ? (
        <RecentVisitsPanel onClose={() => setShowRecent(false)} />
      ) : null}
    </div>
  )
}

export default HomeScreen

