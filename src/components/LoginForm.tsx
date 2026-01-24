import { useState } from "react"
import { useLeague } from '../context/LeagueContext'

import { signInByPasswordForLeague } from '../services/auth.service.js'
import "./LoginForm.css"

export default function InlineLoginForm({ onClose }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const { league, loading: leagueLoading } = useLeague()


  async function handleSubmit(e) {
    e.preventDefault()
    setErrorMessage(null)

    try {
      await signInByPasswordForLeague(email, password, league.id)
      onClose()
    } catch (err) {
      setErrorMessage(err.message)
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
