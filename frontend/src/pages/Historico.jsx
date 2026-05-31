import { useState, useEffect } from 'react'
import api from '../services/api'

function formatDate(str) {
  return new Date(str).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export default function Historico() {
  const [movs, setMovs] = useState([])
  const [itensMap, setItensMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/movimentacoes/'), api.get('/itens/')])
      .then(([movsRes, itensRes]) => {
        setMovs(movsRes.data)
        const map = {}
        itensRes.data.forEach(i => { map[i._id || i.id] = i.nome })
        setItensMap(map)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Carregando...</div>

  if (movs.length === 0) return (
    <div>
      <h1>Histórico</h1>
      <div className="empty">Nenhuma movimentação registrada ainda.</div>
    </div>
  )

  return (
    <div>
      <h1>Histórico</h1>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Item</th>
              <th>Tipo</th>
              <th>Quantidade</th>
              <th>Observações</th>
            </tr>
          </thead>
          <tbody>
            {movs.map(m => {
              const id = m._id || m.id
              return (
                <tr key={id}>
                  <td>{formatDate(m.data)}</td>
                  <td>{itensMap[m.item_id] || m.item_id}</td>
                  <td>
                    <span className={m.tipo === 'entrada' ? 'badge-entrada' : 'badge-saida'}>
                      {m.tipo === 'entrada' ? '↑ Entrada' : '↓ Saída'}
                    </span>
                  </td>
                  <td>{m.quantidade}</td>
                  <td>{m.observacoes || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
