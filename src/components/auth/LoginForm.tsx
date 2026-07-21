import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLeague } from '../../context/LeagueContext'

import { signInByPasswordForLeague } from '../../services/auth.service.js'
import "./LoginForm.css"

export default function InlineLoginForm({ onClose }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const { league } = useLeague()
  const navigate = useNavigate()


  async function handleSubmit(e) {
    e.preventDefault()
    setErrorMessage(null)

    try {
      setLoading(true)
      const { role } = await signInByPasswordForLeague(email, password, league.id)
      onClose()
      const dest = role === 'Referi' ? `/${league.slug}/admin/editar`
        : role === 'Fotografo' ? `/${league.slug}/admin/fotos`
        : role === 'Coach' ? `/${league.slug}/admin/mi-equipo`
        : `/${league.slug}/admin`
      navigate(dest)
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-popover">
      <div className="login-popover-header">
        <span>Iniciar sesión</span>
        <button
          type="button"
          className="login-close-btn"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <label className="login-field">
          <span>Email</span>
          <input
            type="email"
            placeholder="tucorreo@ejemplo.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
            required
          />
        </label>

        <label className="login-field">
          <span>Contraseña</span>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </label>

        {errorMessage && (
          <p className="login-error">{errorMessage}</p>
        )}

        <button type="submit" className="login-submit-btn" disabled={loading}>
          {loading ? "Ingresando..." : "Entrar"}
        </button>
      </form>
    </div>
  )
}
