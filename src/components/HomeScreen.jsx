import { VIEWS } from '../constants/views'
import heisLogo from '../assets/branding/heis_logo.png'

function HomeScreen({ onSelect }) {
  return (
    <div className="screen">
      <header className="screen__header">
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
    </div>
  )
}

export default HomeScreen

