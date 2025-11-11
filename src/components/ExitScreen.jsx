import { useMemo, useState } from 'react'
import heisLogo from '../assets/branding/heis_logo.png'
import {
  getCurrentTimeString,
  getTodayDateString,
  markVisitAsExited,
  searchOpenVisits,
} from '../services/supabaseClient'

function ExitScreen({ onBack }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [visits, setVisits] = useState([])
  const [processingId, setProcessingId] = useState(null)
  const [ratingForId, setRatingForId] = useState(null)
  const [rating, setRating] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchFilters, setSearchFilters] = useState({
    nombrepersona: '',
    nombreempresa: '',
  })

  const hasItems = useMemo(() => Array.isArray(visits) && visits.length > 0, [visits])
  const emojis = ['😡','😠','😕','🙁','😐','🙂','😊','😃','😄','🤩']

  const handleSearch = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setHasSearched(false)
    setVisits([])
    try {
      const data = await searchOpenVisits(searchFilters)
      setVisits(data)
      setHasSearched(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar visitas.')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field) => (event) => {
    setSearchFilters((prev) => ({
      ...prev,
      [field]: event.target.value,
    }))
  }

  const handleExitClick = (id) => {
    if (!id || processingId) return
    setRatingForId(id)
    setRating(null)
  }

  const confirmExitWithRating = async () => {
    if (!ratingForId || processingId) return
    setProcessingId(ratingForId)
    setError(null)
    try {
      const fechasalida = getTodayDateString()
      const horasalida = getCurrentTimeString()
      await markVisitAsExited(ratingForId, { fechasalida, horasalida })
      setVisits((prev) => prev.filter((v) => v.id !== ratingForId))
      // Aquí podríamos enviar 'rating' a analytics si se necesitara en el futuro
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar la salida.')
    } finally {
      setProcessingId(null)
      setRatingForId(null)
      setRating(null)
    }
  }

  return (
    <div className="screen">
      <header className="screen__header">
        <img className="screen__brand" src={heisLogo} alt="HEIS Global" />
        <h1 className="screen__title">Registrar salida</h1>
        <p className="screen__subtitle">
          Selecciona la visita que abandona las instalaciones
        </p>
      </header>

      <div className="screen__content">
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-form__grid">
            <div className="form-field">
              <label className="form-label" htmlFor="search-nombrepersona">
                Nombre de la visita
              </label>
              <input
                id="search-nombrepersona"
                name="nombrepersona"
                type="text"
                className="text-input"
                placeholder="Ej. Ana Gómez"
                value={searchFilters.nombrepersona}
                onChange={handleFilterChange('nombrepersona')}
                autoComplete="off"
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="search-nombreempresa">
                Empresa
              </label>
              <input
                id="search-nombreempresa"
                name="nombreempresa"
                type="text"
                className="text-input"
                placeholder="Ej. Empresa S.L."
                value={searchFilters.nombreempresa}
                onChange={handleFilterChange('nombreempresa')}
                autoComplete="off"
              />
            </div>
          </div>
          <div className="search-form__actions">
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Buscando…' : 'Buscar'}
            </button>
          </div>
        </form>

        {error ? <p className="form-alert form-alert--error">{error}</p> : null}

        {hasSearched && !loading ? (
          hasItems ? (
            <ul className="exit-list" role="list">
              {visits.map((v) => (
                <li key={v.id}>
                  <button
                    type="button"
                    className="exit-list__item"
                    onClick={() => handleExitClick(v.id)}
                    disabled={processingId === v.id}
                  >
                    <span className="exit-list__name">{v.nombrepersona}</span>
                    {v.nombreempresa ? (
                      <span className="exit-list__company">{v.nombreempresa}</span>
                    ) : null}
                    <span className="exit-list__time">
                      Entrada: {v.fechavisita} {v.horavisita?.slice(0, 5)}
                    </span>
                    <span className="exit-list__cta">
                      {processingId === v.id ? 'Registrando…' : 'Registrar salida'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="placeholder-card">
              No se encontraron visitas con los criterios de búsqueda.
            </div>
          )
        ) : null}
      </div>

      <button type="button" className="secondary-button" onClick={onBack}>
        Volver
      </button>

      {ratingForId ? (
        <div className="panel-overlay" role="dialog" aria-modal="true">
          <div className="panel">
            <div className="panel__header">
              <h2 className="panel__title">¿Cómo ha sido tu visita?</h2>
              <button
                type="button"
                className="panel__close"
                aria-label="Cerrar"
                onClick={() => {
                  setRatingForId(null)
                  setRating(null)
                }}
              >
                ✖
              </button>
            </div>
            <div className="panel__body">
              <div className="rating-emojis" role="group" aria-label="Valoración de 1 a 10">
                {emojis.map((e, idx) => {
                  const value = idx + 1
                  const selected = rating === value
                  return (
                    <button
                      key={value}
                      type="button"
                      className={`rating-emoji${selected ? ' rating-emoji--selected' : ''}`}
                      onClick={() => setRating(value)}
                    >
                      <span aria-hidden="true">{e}</span>
                      <span className="sr-only">{value}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="panel__footer">
              <button
                type="button"
                className="secondary-button"
                onClick={confirmExitWithRating}
                disabled={!rating || processingId === ratingForId}
              >
                {processingId === ratingForId ? 'Guardando…' : 'Confirmar salida'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ExitScreen

