import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Estoque from './pages/Estoque'
import NovoItem from './pages/NovoItem'
import Movimentacao from './pages/Movimentacao'
import Historico from './pages/Historico'
import Login from './pages/Login'

const links = [
  { to: '/', label: 'Estoque',      icon: '◈', end: true },
  { to: '/novo', label: 'Novo Item', icon: '＋' },
  { to: '/movimentacao', label: 'Movimentação', icon: '⇅' },
  { to: '/historico', label: 'Histórico', icon: '≡' },
]

export default function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('token'))

  const handleLogout = () => {
    localStorage.removeItem('token')
    setAuthed(false)
  }

  if (!authed) return <Login onLogin={() => setAuthed(true)} />

  return (
    <BrowserRouter>
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">B</div>
            <span className="logo-text">Berapp</span>
          </div>
          <nav className="sidebar-nav">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} end={l.end}
                className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                <span className="nav-icon">{l.icon}</span>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-footer">
            <button className="logout-btn" onClick={handleLogout}>
              <span>↩</span> Sair
            </button>
          </div>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Estoque />} />
            <Route path="/novo" element={<NovoItem />} />
            <Route path="/movimentacao" element={<Movimentacao />} />
            <Route path="/historico" element={<Historico />} />
          </Routes>
        </main>

        <nav className="bottom-nav">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => 'bottom-link' + (isActive ? ' active' : '')}>
              <span>{l.icon}</span>
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </BrowserRouter>
  )
}
