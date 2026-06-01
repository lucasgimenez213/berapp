import { useState } from 'react'
import api from '../services/api'

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', form)
      localStorage.setItem('token', res.data.access_token)
      onLogin()
    } catch {
      setError('Usuário ou senha inválidos')
    }
    setLoading(false)
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-mark">B</div>
          <span className="login-title">Berapp</span>
        </div>
        <p className="login-sub">Controle de estoque do Bernardo</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Usuário</label>
            <input
              name="username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="seu usuário"
              required
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label>Senha</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 20, padding: '11px' }}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
