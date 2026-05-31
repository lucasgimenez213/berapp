import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Estoque from './pages/Estoque'
import NovoItem from './pages/NovoItem'
import Movimentacao from './pages/Movimentacao'
import Historico from './pages/Historico'

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-logo">Berapp</div>
          <nav className="sidebar-nav">
            <NavLink to="/" end className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
              Estoque
            </NavLink>
            <NavLink to="/novo" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
              Novo Item
            </NavLink>
            <NavLink to="/movimentacao" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
              Movimentação
            </NavLink>
            <NavLink to="/historico" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
              Histórico
            </NavLink>
          </nav>
        </aside>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Estoque />} />
            <Route path="/novo" element={<NovoItem />} />
            <Route path="/movimentacao" element={<Movimentacao />} />
            <Route path="/historico" element={<Historico />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
