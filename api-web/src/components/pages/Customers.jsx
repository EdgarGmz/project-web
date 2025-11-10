import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const { hasPermission } = useAuth()

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    birth_date: '',
    document_type: 'dni',
    document_number: '',
    notes: ''
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/customers', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      if (data.success) setCustomers(data.data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const url = editingCustomer 
        ? `http://localhost:3000/api/customers/${editingCustomer.id}`
        : 'http://localhost:3000/api/customers'
      
      const response = await fetch(url, {
        method: editingCustomer ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        fetchCustomers()
        setShowForm(false)
        setEditingCustomer(null)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving customer:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      first_name: '', last_name: '', email: '', phone: '', address: '',
      birth_date: '', document_type: 'dni', document_number: '', notes: ''
    })
  }

  const handleEdit = (customer) => {
    setEditingCustomer(customer)
    setFormData({ ...customer })
    setShowForm(true)
  }

  const handleDelete = async (customerId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        const response = await fetch(`http://localhost:3000/api/customers/${customerId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        const data = await response.json()
        if (data.success) {
          alert('Cliente eliminado exitosamente')
          fetchCustomers()
        } else {
          alert(data.message)
        }
      } catch (error) {
        console.error('Error deleting customer:', error)
        alert('Error al eliminar cliente')
      }
    }
  }

  const viewCustomerDetails = async (customerId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/customers/${customerId}/details`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      if (data.success) {
        setSelectedCustomer(data.data)
        setShowDetails(true)
      }
    } catch (error) {
      console.error('Error fetching customer details:', error)
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm) ||
    customer.document_number?.includes(searchTerm)
  )

  if (loading) {
    return <div className="card text-center py-8">Cargando clientes...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Clientes</h1>
          <p className="text-muted">Gestiona la base de datos de clientes</p>
        </div>
        {hasPermission(['cashier', 'supervisor']) && (
          <button onClick={() => setShowForm(true)} className="btn">
            + Nuevo Cliente
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-semibold text-accent">{customers.length}</div>
          <div className="text-muted">Total Clientes</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-semibold text-green-400">
            {customers.filter(c => c.email).length}
          </div>
          <div className="text-muted">Con Email</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-semibold text-blue-400">
            {customers.filter(c => c.phone).length}
          </div>
          <div className="text-muted">Con Teléfono</div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="card">
        <input
          type="text"
          placeholder="Buscar por nombre, email, teléfono o documento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 bg-surface border border-slate-600/30 rounded-lg"
        />
      </div>

      {/* Lista de clientes */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-600/20">
                <th className="text-left py-3 px-4">Cliente</th>
                <th className="text-left py-3 px-4">Contacto</th>
                <th className="text-left py-3 px-4">Documento</th>
                <th className="text-left py-3 px-4">Sucursal</th>
                <th className="text-left py-3 px-4">Registrado</th>
                <th className="text-left py-3 px-4">Compras</th>
                <th className="text-left py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-slate-600/10 last:border-0 hover:bg-surface/50 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                        <span className="text-sm font-semibold">
                          {customer.first_name?.[0]}{customer.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">
                          {customer.first_name} {customer.last_name}
                        </div>
                        {customer.birth_date && (
                          <div className="text-muted text-sm">
                            {new Date().getFullYear() - new Date(customer.birth_date).getFullYear()} años
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      {customer.email && (
                        <div className="text-sm">{customer.email}</div>
                      )}
                      {customer.phone && (
                        <div className="text-muted text-sm">{customer.phone}</div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {customer.document_number && (
                      <div>
                        <div className="text-sm">{customer.document_type?.toUpperCase()}</div>
                        <div className="text-muted text-sm">{customer.document_number}</div>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {customer.Branch ? (
                      <div className="flex items-center gap-2">
                        <span className="text-blue-500">🏢</span>
                        <div>
                          <div className="text-sm font-medium">{customer.Branch.name}</div>
                          <div className="text-muted text-xs">{customer.Branch.code}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Sin asignar</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-muted text-sm">
                    {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-accent/20 text-accent px-2 py-1 rounded text-xs">
                      {customer.total_purchases || 0} compras
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewCustomerDetails(customer.id)}
                        className="text-blue-400 hover:opacity-80 transition"
                        title="Ver detalles"
                      >
                        👁️
                      </button>
                      {hasPermission(['cashier', 'supervisor']) && (
                        <>
                          <button
                            onClick={() => handleEdit(customer)}
                            className="text-accent hover:opacity-80 transition"
                            title="Editar cliente"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="text-red-400 hover:opacity-80 transition"
                            title="Eliminar cliente"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                {editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h3>
              <button onClick={() => setShowForm(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre *</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Apellido *</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
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
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Dirección</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  rows="2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Documento</label>
                  <select
                    value={formData.document_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, document_type: e.target.value }))}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  >
                    <option value="dni">DNI</option>
                    <option value="passport">Pasaporte</option>
                    <option value="license">Licencia</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Número de Documento</label>
                  <input
                    type="text"
                    value={formData.document_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, document_number: e.target.value }))}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notas</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  rows="3"
                  placeholder="Información adicional del cliente..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn flex-1">
                  {editingCustomer ? 'Actualizar' : 'Crear'} Cliente
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

      {/* Modal detalles del cliente */}
      {showDetails && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                Detalles de {selectedCustomer.first_name} {selectedCustomer.last_name}
              </h3>
              <button onClick={() => setShowDetails(false)}>✕</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Información del cliente */}
              <div className="lg:col-span-1 space-y-4">
                <div className="card bg-surface/50">
                  <div className="text-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-accent/20 border-2 border-accent/30 flex items-center justify-center mx-auto mb-2">
                      <span className="text-xl font-bold">
                        {selectedCustomer.first_name?.[0]}{selectedCustomer.last_name?.[0]}
                      </span>
                    </div>
                    <h4 className="font-semibold">{selectedCustomer.first_name} {selectedCustomer.last_name}</h4>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    {selectedCustomer.email && (
                      <div className="flex items-center gap-2">
                        <span>📧</span>
                        <span className="text-muted">Email:</span>
                        <span>{selectedCustomer.email}</span>
                      </div>
                    )}
                    {selectedCustomer.phone && (
                      <div className="flex items-center gap-2">
                        <span>📞</span>
                        <span className="text-muted">Teléfono:</span>
                        <span>{selectedCustomer.phone}</span>
                      </div>
                    )}
                    {selectedCustomer.address && (
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span className="text-muted">Dirección:</span>
                        <span>{selectedCustomer.address}</span>
                      </div>
                    )}
                    {selectedCustomer.birth_date && (
                      <div className="flex items-center gap-2">
                        <span>🎂</span>
                        <span className="text-muted">Edad:</span>
                        <span>{new Date().getFullYear() - new Date(selectedCustomer.birth_date).getFullYear()} años</span>
                      </div>
                    )}
                    {selectedCustomer.document_number && (
                      <div className="flex items-center gap-2">
                        <span>🆔</span>
                        <span className="text-muted">{selectedCustomer.document_type?.toUpperCase()}:</span>
                        <span>{selectedCustomer.document_number}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Estadísticas del cliente */}
                <div className="card bg-surface/50">
                  <h5 className="font-semibold mb-3">Estadísticas</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">Total compras:</span>
                      <span className="font-medium">{selectedCustomer.total_purchases || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Monto total:</span>
                      <span className="font-medium text-accent">${selectedCustomer.total_spent || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Última compra:</span>
                      <span className="font-medium">
                        {selectedCustomer.last_purchase ? new Date(selectedCustomer.last_purchase).toLocaleDateString() : 'Nunca'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Historial de compras */}
              <div className="lg:col-span-2">
                <h5 className="font-semibold mb-3">Historial de Compras</h5>
                <div className="card bg-surface/50 overflow-hidden">
                  {selectedCustomer.purchases?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-600/20">
                            <th className="text-left py-2 px-3 text-sm">Fecha</th>
                            <th className="text-left py-2 px-3 text-sm">Items</th>
                            <th className="text-left py-2 px-3 text-sm">Total</th>
                            <th className="text-left py-2 px-3 text-sm">Método</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedCustomer.purchases.map((purchase) => (
                            <tr key={purchase.id} className="border-b border-slate-600/10 last:border-0">
                              <td className="py-2 px-3 text-sm">
                                {new Date(purchase.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-2 px-3 text-sm">
                                {purchase.total_items} productos
                              </td>
                              <td className="py-2 px-3 text-sm font-medium">
                                ${purchase.total}
                              </td>
                              <td className="py-2 px-3 text-sm text-muted">
                                {purchase.payment_method}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">🛒</div>
                      <p className="text-muted">Sin compras registradas</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              {hasPermission(['cashier', 'supervisor']) && (
                <button
                  onClick={() => handleEdit(selectedCustomer)}
                  className="btn"
                >
                  ✏️ Editar Cliente
                </button>
              )}
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 border border-slate-600/30 rounded-md"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}