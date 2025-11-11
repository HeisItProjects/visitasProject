import { useState } from 'react'
import heisLogo from '../assets/branding/heis_logo.png'
import { loginUser } from '../services/supabaseClient'

function LoginScreen({ onLogin }) {
  const [nombre, setNombre] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (!nombre.trim() || !contrasena.trim()) {
        setError('Por favor, completa todos los campos.')
        setIsSubmitting(false)
        return
      }

      const user = await loginUser(nombre.trim(), contrasena.trim())
      
      // Guardar sesión en localStorage
      localStorage.setItem('visitas_user', JSON.stringify({ id: user.id, nombre: user.nombre }))
      
      if (onLogin) {
        onLogin(user)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="screen">
      <header className="screen__header">
        <img className="screen__brand" src={heisLogo} alt="HEIS Global" />
        <h1 className="screen__title">Iniciar sesión</h1>
        <p className="screen__subtitle">
          Introduce tus credenciales para acceder al sistema
        </p>
      </header>

      <div className="screen__content">
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label className="form-label" htmlFor="login-nombre">
              Usuario
            </label>
            <input
              id="login-nombre"
              name="nombre"
              type="text"
              className="text-input"
              placeholder="Introduce tu usuario"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoComplete="username"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="login-contrasena">
              Contraseña
            </label>
            <input
              id="login-contrasena"
              name="contrasena"
              type="password"
              className="text-input"
              placeholder="Introduce tu contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              autoComplete="current-password"
              required
              disabled={isSubmitting}
            />
          </div>

          {error ? <p className="form-alert form-alert--error">{error}</p> : null}

          <div className="form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginScreen

