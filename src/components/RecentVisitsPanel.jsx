import { useEffect, useMemo, useState } from 'react'
import { fetchVisits } from '../services/supabaseClient'

const PAGE_SIZE = 10

function RecentVisitsPanel({ onClose }) {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    nombreempresa: '',
    nombrepersona: '',
    fromDate: '',
    toDate: '',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)

  const totalPages = useMemo(() => {
    return total ? Math.max(1, Math.ceil(total / PAGE_SIZE)) : 1
  }, [total])

  const canPrev = page > 1
  const canNext = page < totalPages

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, total } = await fetchVisits({
          page,
          pageSize: PAGE_SIZE,
          filters,
        })
        if (!cancelled) {
          setRows(data)
          setTotal(total || 0)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error desconocido')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [page, filters])

  const updateFilter = (key) => (e) => {
    const value = e.target.value
    setPage(1)
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="panel-overlay" role="dialog" aria-modal="true">
      <div className="panel">
        <div className="panel__header">
          <h2 className="panel__title">Últimos registros</h2>
          <button type="button" className="panel__close" onClick={onClose} aria-label="Cerrar">
            ✖
          </button>
        </div>

        <div className="panel__filters">
          <div className="panel__filters-grid">
            <div className="form-field">
              <label className="form-label" htmlFor="f-empresa">Empresa</label>
              <input id="f-empresa" className="text-input" value={filters.nombreempresa} onChange={updateFilter('nombreempresa')} />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="f-persona">Persona</label>
              <input id="f-persona" className="text-input" value={filters.nombrepersona} onChange={updateFilter('nombrepersona')} />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="f-desde">Desde</label>
              <input id="f-desde" type="date" className="text-input" value={filters.fromDate} onChange={updateFilter('fromDate')} />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="f-hasta">Hasta</label>
              <input id="f-hasta" type="date" className="text-input" value={filters.toDate} onChange={updateFilter('toDate')} />
            </div>
          </div>
        </div>

        {error ? <p className="form-alert form-alert--error">{error}</p> : null}

        <div className="panel__body">
          {loading ? (
            <div className="placeholder-card">Cargando…</div>
          ) : rows.length ? (
            <ul className="recent-list" role="list">
              {rows.map((r) => (
                <li key={r.id} className="recent-list__row">
                  <div className="recent-list__main">
                    <span className="recent-list__name">{r.nombrepersona}</span>
                    {r.nombreempresa ? (
                      <span className="recent-list__company">· {r.nombreempresa}</span>
                    ) : null}
                  </div>
                  <div className="recent-list__meta">
                    <span>Entrada: {r.fechavisita} {r.horavisita?.slice(0,5)}</span>
                    {r.salida ? (
                      <span> · Salida: {r.fechasalida} {r.horasalida?.slice(0,5)}</span>
                    ) : (
                      <span> · Pendiente de salida</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="placeholder-card">Sin resultados.</div>
          )}
        </div>

        <div className="panel__footer">
          <button className="secondary-button" type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!canPrev}>
            Anterior
          </button>
          <div className="panel__page">{page} / {totalPages}</div>
          <button className="secondary-button" type="button" onClick={() => setPage((p) => p + 1)} disabled={!canNext}>
            Siguiente
          </button>
        </div>
      </div>
    </div>
  )
}

export default RecentVisitsPanel

