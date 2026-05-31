import { useState, useEffect } from 'react'
import api from '../services/api'

function getStatus(item) {
  if (item.quantidade <= item.quantidade_minima) return 'critico'
  if (item.quantidade <= item.quantidade_minima * 1.5) return 'atencao'
  return 'ok'
}

const statusLabel = { ok: 'OK', atencao: 'Atenção', critico: 'Crítico' }

export default function Estoque() {
  const [itens, setItens] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/itens/').then(r => {
      setItens(r.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Carregando...</div>

  const counts = itens.reduce(
    (acc, i) => { acc[getStatus(i)]++; return acc },
    { ok: 0, atencao: 0, critico: 0 }
  )

  return (
    <div>
      <h1>Estoque</h1>

      {counts.critico > 0 && (
        <div className="alert-banner">
          ⚠️ {counts.critico} item(s) abaixo do estoque mínimo
        </div>
      )}

      <div className="summary-row">
        <div className="summary-card ok">
          <span className="count">{counts.ok}</span>
          <span className="label">OK</span>
        </div>
        <div className="summary-card atencao">
          <span className="count">{counts.atencao}</span>
          <span className="label">Atenção</span>
        </div>
        <div className="summary-card critico">
          <span className="count">{counts.critico}</span>
          <span className="label">Crítico</span>
        </div>
      </div>

      {itens.length === 0 ? (
        <div className="empty">Nenhum item cadastrado. Adicione o primeiro item!</div>
      ) : (
        <div className="itens-grid">
          {itens.map(item => {
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
                  <span className="tag">{item.categoria}</span>
                  <span className="tag">Mín: {item.quantidade_minima}</span>
                  {item.validade && <span className="tag">Val: {item.validade}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
