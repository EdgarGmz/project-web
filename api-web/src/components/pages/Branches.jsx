import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function Branches() {
  const [branches, setBranches] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingBranch, setEditingBranch] = useState(null)
  const [loading, setLoading] = useState(true)
  const { hasPermission } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    manager: '',
    status: 'active'
  })

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/branches', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      if (data.success) setBranches(data.data)
    } catch (error) {
      console.error('Error fetching branches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const url = editingBranch 
        ? `http://localhost:3000/api/branches/${editingBranch.id}`
        : 'http://localhost:3000/api/branches'
      
      const response = await fetch(url, {
        method: editingBranch ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        fetchBranches()
        setShowForm(false)
        setEditingBranch(null)
        setFormData({ name: '', address: '', phone: '', manager: '', status: 'active' })
      }
    } catch (error) {
      console.error('Error saving branch:', error)
    }
  }

  const handleEdit = (branch) => {
    setEditingBranch(branch)
    setFormData({
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      manager: branch.manager,
      status: branch.status
    })
    setShowForm(true)
  }

  if (loading) {
    return <div className="card text-center py-8">Cargando sucursales...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Sucursales</h1>
          <p className="text-muted">Gestiona las sucursales de la franquicia</p>
        </div>
        {hasPermission(['owner', 'admin']) && (
          <button onClick={() => setShowForm(true)} className="btn">
            + Nueva Sucursal
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-semibold text-accent">{branches.length}</div>
          <div className="text-muted">Total Sucursales</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-semibold text-green-400">
            {branches.filter(b => b.status === 'active').length}
          </div>
          <div className="text-muted">Activas</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-semibold text-red-400">
            {branches.filter(b => b.status === 'inactive').length}
          </div>
          <div className="text-muted">Inactivas</div>
        </div>
      </div>

      {/* Lista de sucursales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => (
          <div key={branch.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-accent/20 border border-accent/30 flex items-center justify-center">
                  🏢
                </div>
                <div>
                  <h3 className="font-semibold">{branch.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    branch.status === 'active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {branch.status === 'active' ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>
              {hasPermission(['owner', 'admin']) && (
                <button
                  onClick={() => handleEdit(branch)}
                  className="text-accent hover:opacity-80"
                >
                  ✏️
                </button>
              )}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted">
                <span>📍</span>
                <span>{branch.address}</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <span>📞</span>
                <span>{branch.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <span>👤</span>
                <span>{branch.manager || 'Sin asignar'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                {editingBranch ? 'Editar Sucursal' : 'Nueva Sucursal'}
              </h3>
              <button onClick={() => setShowForm(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Dirección</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Teléfono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Encargado</label>
                <input
                  type="text"
                  value={formData.manager}
                  onChange={(e) => setFormData(prev => ({ ...prev, manager: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Estado</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                >
                  <option value="active">Activa</option>
                  <option value="inactive">Inactiva</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn flex-1">
                  {editingBranch ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-slate-600/30 rounded-md"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}