import { useState } from 'react'
import { VIEWS } from '../constants/views'
import heisLogo from '../assets/branding/heis_logo.png'
import RecentVisitsPanel from './RecentVisitsPanel'

function HomeScreen({ onSelect }) {
  const [showRecent, setShowRecent] = useState(false)
  return (
    <div className="screen">
      <header className="screen__header">
        <button
          type="button"
          className="top-left-button"
          title="Últimos registros"
          aria-label="Últimos registros"
          onClick={() => setShowRecent(true)}
        >
          <span className="icon icon--log" aria-hidden="true">🗒️</span>
        </button>
        <p className="screen__eyebrow">Bienvenidos a</p>
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
      {showRecent ? (
        <RecentVisitsPanel onClose={() => setShowRecent(false)} />
      ) : null}
    </div>
  )
}

export default HomeScreen

