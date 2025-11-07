import heisLogo from '../assets/branding/heis_logo.png'

function ExitScreen({ onBack }) {
  return (
    <div className="screen">
      <header className="screen__header">
        <p className="screen__eyebrow">Bienvenidos a</p>
        <img className="screen__brand" src={heisLogo} alt="HEIS Global" />
        <h1 className="screen__title">Registrar salida</h1>
        <p className="screen__subtitle">
          Esta sección estará disponible pronto.
        </p>
      </header>

      <div className="screen__content">
        <div className="placeholder-card">
          Aquí podrás confirmar que la visita ha abandonado las instalaciones.
        </div>
      </div>

      <button type="button" className="secondary-button" onClick={onBack}>
        Volver
      </button>
    </div>
  )
}

export default ExitScreen

