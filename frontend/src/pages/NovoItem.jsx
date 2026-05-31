import { useState } from 'react'
import api from '../services/api'

const CATEGORIAS = ['medicamento', 'material', 'equipamento', 'outro']
const UNIDADES = ['unidade', 'caixa', 'frasco', 'ampola', 'ml', 'mg', 'comprimido', 'sachê']

const INICIAL = {
  nome: '', categoria: 'material', quantidade: '',
  unidade: 'unidade', quantidade_minima: '', validade: '', observacoes: ''
}

export default function NovoItem() {
  const [form, setForm] = useState(INICIAL)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      await api.post('/itens/', {
        ...form,
        quantidade: Number(form.quantidade),
        quantidade_minima: Number(form.quantidade_minima),
        validade: form.validade || null
      })
      setStatus('ok')
      setForm(INICIAL)
    } catch {
      setStatus('erro')
    }
    setLoading(false)
  }

  return (
    <div>
      <h1>Novo Item</h1>
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome</label>
            <input name="nome" value={form.nome} onChange={handleChange} required placeholder="Ex: Seringa 20ml" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Categoria</label>
              <select name="categoria" value={form.categoria} onChange={handleChange}>
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Unidade</label>
              <select name="unidade" value={form.unidade} onChange={handleChange}>
                {UNIDADES.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Quantidade inicial</label>
              <input name="quantidade" type="number" min="0" value={form.quantidade} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Quantidade mínima</label>
              <input name="quantidade_minima" type="number" min="0" value={form.quantidade_minima} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Validade (opcional)</label>
            <input name="validade" type="date" value={form.validade} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Observações</label>
            <input name="observacoes" value={form.observacoes} onChange={handleChange} placeholder="Opcional" />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Cadastrar Item'}
          </button>
        </form>

        {status === 'ok' && <div className="success-msg">✅ Item cadastrado com sucesso!</div>}
        {status === 'erro' && <div className="error-msg">❌ Erro ao cadastrar. Tente novamente.</div>}
      </div>
    </div>
  )
}
