import { useState, useEffect } from 'react'
import api from '../services/api'

export default function Movimentacao() {
  const [itens, setItens] = useState([])
  const [form, setForm] = useState({ item_id: '', tipo: 'entrada', quantidade: '', observacoes: '' })
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/itens/').then(r => {
      setItens(r.data)
      if (r.data.length > 0) {
        const id = r.data[0]._id || r.data[0].id
        setForm(f => ({ ...f, item_id: id }))
      }
    })
  }, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      await api.post('/movimentacoes/', {
        ...form,
        quantidade: Number(form.quantidade)
      })
      setStatus({ tipo: 'ok' })
      setForm(f => ({ ...f, quantidade: '', observacoes: '' }))
    } catch (err) {
      const msg = err.response?.data?.detail || 'Erro ao registrar'
      setStatus({ tipo: 'erro', msg })
    }
    setLoading(false)
  }

  return (
    <div>
      <h1>Movimentação</h1>
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Item</label>
            <select name="item_id" value={form.item_id} onChange={handleChange} required>
              {itens.map(i => {
                const id = i._id || i.id
                return <option key={id} value={id}>{i.nome} ({i.quantidade} {i.unidade})</option>
              })}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tipo</label>
              <select name="tipo" value={form.tipo} onChange={handleChange}>
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </div>
            <div className="form-group">
              <label>Quantidade</label>
              <input name="quantidade" type="number" min="1" value={form.quantidade} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Observações</label>
            <input name="observacoes" value={form.observacoes} onChange={handleChange} placeholder="Opcional" />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar'}
          </button>
        </form>

        {status?.tipo === 'ok' && <div className="success-msg">✅ Movimentação registrada!</div>}
        {status?.tipo === 'erro' && <div className="error-msg">❌ {status.msg}</div>}
      </div>
    </div>
  )
}
