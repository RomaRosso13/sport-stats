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
      await signInByPasswordForLeague(email, password, league.id)
      onClose()
      navigate(`/${league.slug}/admin`)
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="inline-login" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "…" : "Entrar"}
      </button>

      {errorMessage && (
        <p className="login-error">{errorMessage}</p>
      )}
    </form>
  )
}
