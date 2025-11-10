import { useState } from 'react'
import { loginUser } from '../services/supabaseClient'

function PasswordPrompt({ currentUser, onSuccess, onCancel }) {
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (!contrasena.trim()) {
        setError('Por favor, introduce tu contraseña.')
        setIsSubmitting(false)
        return
      }

      // Verificar contraseña contra el usuario actual
      const user = await loginUser(currentUser.nombre, contrasena.trim())
      
      if (user && user.id === currentUser.id) {
        if (onSuccess) {
          onSuccess()
        }
      } else {
        setError('Contraseña incorrecta.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al verificar la contraseña.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="panel-overlay" role="dialog" aria-modal="true">
      <div className="panel">
        <div className="panel__header">
          <h2 className="panel__title">Verificación de seguridad</h2>
          <button
            type="button"
            className="panel__close"
            aria-label="Cerrar"
            onClick={onCancel}
          >
            ✖
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="panel__body">
            <p className="panel__description">
              Introduce tu contraseña para acceder a los registros de visitas.
            </p>
            <div className="form-field">
              <label className="form-label" htmlFor="password-prompt">
                Contraseña
              </label>
              <input
                id="password-prompt"
                name="contrasena"
                type="password"
                className="text-input"
                placeholder="Introduce tu contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                autoComplete="current-password"
                autoFocus
                required
                disabled={isSubmitting}
              />
            </div>
            {error ? <p className="form-alert form-alert--error">{error}</p> : null}
          </div>
          <div className="panel__footer">
            <button
              type="button"
              className="secondary-button"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Verificando…' : 'Verificar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PasswordPrompt

