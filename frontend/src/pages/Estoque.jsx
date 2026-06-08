import { useState, useEffect } from 'react'
import api from '../services/api'

function getStatus(item) {
  if (item.quantidade <= item.quantidade_minima) return 'critico'
  if (item.quantidade <= item.quantidade_minima * 1.5) return 'atencao'
  return 'ok'
}

const statusLabel = { ok: 'OK', atencao: 'Atenção', critico: 'Crítico' }
const CATEGORIAS = ['medicamento', 'material', 'equipamento', 'outro']
const UNIDADES = ['unidade', 'caixa', 'frasco', 'ampola', 'ml', 'mg', 'comprimido', 'sachê']

const STATUS_ORDER = { critico: 0, atencao: 1, ok: 2 }

export default function Estoque() {
  const [itens, setItens] = useState([])
  const [loading, setLoading] = useState(true)
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [sortByStatus, setSortByStatus] = useState(false)

  const load = () => {
    api.get('/itens/').then(r => { setItens(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleEdit = async e => {
    e.preventDefault()
    setSaving(true)
    const id = editItem._id || editItem.id
    await api.put(`/itens/${id}`, {
      nome: editItem.nome,
      categoria: editItem.categoria,
      quantidade: Number(editItem.quantidade),
      unidade: editItem.unidade,
      quantidade_minima: Number(editItem.quantidade_minima),
      validade: editItem.validade || null,
      observacoes: editItem.observacoes
    })
    setSaving(false)
    setEditItem(null)
    load()
  }

  const handleDelete = async () => {
    const id = deleteItem._id || deleteItem.id
    await api.delete(`/itens/${id}`)
    setDeleteItem(null)
    load()
  }

  if (loading) return <div className="loading">Carregando...</div>

  const counts = itens.reduce(
    (acc, i) => { acc[getStatus(i)]++; return acc },
    { ok: 0, atencao: 0, critico: 0 }
  )

  const itensFiltrados = itens
    .filter(i => i.nome.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortByStatus ? STATUS_ORDER[getStatus(a)] - STATUS_ORDER[getStatus(b)] : 0)

  return (
    <div>
      <div className="page-header">
        <h1>Estoque</h1>
        <p>Insumos do Bernardo — home care</p>
      </div>
      <div className="page-body">

      {counts.critico > 0 && (
        <div className="alert-banner">
          ⚠️ {counts.critico} item(s) abaixo do estoque mínimo
        </div>
      )}

      <div className="search-filter-row">
        <div className="search-box">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Buscar item..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>
        <button
          className={`filter-btn ${sortByStatus ? 'active' : ''}`}
          onClick={() => setSortByStatus(v => !v)}
        >
          {sortByStatus ? '● ' : '○ '}Críticos primeiro
        </button>
      </div>

      <div className="summary-row">
        <div className="summary-card ok"><span className="count">{counts.ok}</span><span className="label">OK</span></div>
        <div className="summary-card atencao"><span className="count">{counts.atencao}</span><span className="label">Atenção</span></div>
        <div className="summary-card critico"><span className="count">{counts.critico}</span><span className="label">Crítico</span></div>
      </div>

      {itens.length === 0 ? (
        <div className="empty">Nenhum item cadastrado. Adicione o primeiro item!</div>
      ) : itensFiltrados.length === 0 ? (
        <div className="empty">Nenhum item encontrado para "{search}".</div>
      ) : (
        <div className="itens-grid">
          {itensFiltrados.map(item => {
            const id = item._id || item.id
            const status = getStatus(item)
            return (
              <div key={id} className={`item-card ${status}`}>
                <div className="item-header">
                  <span className="item-nome">{item.nome}</span>
                  <span className={`status-badge ${status}`}>{statusLabel[status]}</span>
                </div>
                <div className="item-quantidade">
                  {item.quantidade} <span>{item.unidade}</span>
                </div>
                <div className="item-footer">
                  <span className={`tag tag-${item.categoria}`}>{item.categoria}</span>
                  <span className="tag">Mín: {item.quantidade_minima}</span>
                  {item.validade && <span className="tag">Val: {item.validade}</span>}
                </div>
                <div className="item-actions">
                  <button className="action-btn edit" onClick={() => setEditItem({ ...item })}>Editar</button>
                  <button className="action-btn delete" onClick={() => setDeleteItem(item)}>Excluir</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de edição */}
      {editItem && (
        <div className="modal-overlay" onClick={() => setEditItem(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Editar Item</h2>
            <form onSubmit={handleEdit}>
              <div className="form-group">
                <label>Nome</label>
                <input value={editItem.nome} onChange={e => setEditItem({ ...editItem, nome: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Categoria</label>
                  <select value={editItem.categoria} onChange={e => setEditItem({ ...editItem, categoria: e.target.value })}>
                    {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Unidade</label>
                  <select value={editItem.unidade} onChange={e => setEditItem({ ...editItem, unidade: e.target.value })}>
                    {UNIDADES.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Quantidade</label>
                  <input type="number" min="0" value={editItem.quantidade} onChange={e => setEditItem({ ...editItem, quantidade: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Qtd Mínima</label>
                  <input type="number" min="0" value={editItem.quantidade_minima} onChange={e => setEditItem({ ...editItem, quantidade_minima: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Validade</label>
                <input type="date" value={editItem.validade || ''} onChange={e => setEditItem({ ...editItem, validade: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setEditItem(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>

      {/* Modal de confirmação de exclusão */}
      {deleteItem && (
        <div className="modal-overlay" onClick={() => setDeleteItem(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <h2>Excluir Item</h2>
            <p className="modal-text">Tem certeza que quer excluir <strong>{deleteItem.nome}</strong>? Esta ação não pode ser desfeita.</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteItem(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleDelete}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
