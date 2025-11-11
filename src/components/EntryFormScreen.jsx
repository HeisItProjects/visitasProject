import VisitEntryForm from './forms/VisitEntryForm'
import heisLogo from '../assets/branding/heis_logo.png'

function EntryFormScreen({ onBack }) {
  return (
    <div className="screen">
      <header className="screen__header">
        <img className="screen__brand" src={heisLogo} alt="HEIS Global" />
        <h1 className="screen__title">Registro de entrada</h1>
        <p className="screen__subtitle">
          Completa tus datos para generar la etiqueta de visitante
        </p>
      </header>

      <div className="screen__content">
        <VisitEntryForm />
      </div>

      <button type="button" className="secondary-button" onClick={onBack}>
        Volver
      </button>
    </div>
  )
}

export default EntryFormScreen

