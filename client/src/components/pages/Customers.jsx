import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import ConfirmModal from '../molecules/ConfirmModal'
import SuccessModal from '../molecules/SuccessModal'
import CancelledModal from '../molecules/CancelledModal'

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

  // Estado para modal de confirmación
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, customer: null })
  // Estado para modal de éxito
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' })
  // Estado para modal de cancelación
  const [cancelledModal, setCancelledModal] = useState({ isOpen: false, message: '' })

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
        setSuccessModal({ 
          isOpen: true, 
          message: editingCustomer ? 'Cliente actualizado exitosamente' : 'Cliente creado exitosamente' 
        })
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

  const handleDelete = async (customer) => {
    setConfirmModal({
      isOpen: true,
      customer: customer
    })
  }

  const confirmDelete = async () => {
    const customerId = confirmModal.customer.id
    setConfirmModal({ isOpen: false, customer: null })
    
    try {
      const response = await fetch(`http://localhost:3000/api/customers/${customerId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      if (data.success) {
        setCancelledModal({ isOpen: true, message: 'Cliente eliminado exitosamente' })
        fetchCustomers()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      alert('Error al eliminar cliente')
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

  const clearFilters = () => {
    setSearchTerm('')
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
        {hasPermission(['cashier']) && (
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Filtros</h2>
          {searchTerm && (
            <button
              onClick={clearFilters}
              className="text-sm text-accent hover:opacity-80 transition flex items-center gap-2"
              title="Limpiar filtros"
            >
              🗑️ Limpiar filtros
            </button>
          )}
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre, email, teléfono o documento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 bg-surface border border-slate-600/30 rounded-lg"
        />
      </div>

      {/* Lista de clientes */}
      <div className="card overflow-hidden border border-slate-600/20 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-800/80 via-slate-700/80 to-slate-800/80 border-b border-slate-600/30">
                <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>👥</span>
                    <span>Cliente</span>
                  </div>
                </th>
                <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>📞</span>
                    <span>Contacto</span>
                  </div>
                </th>
                <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>🆔</span>
                    <span>Documento</span>
                  </div>
                </th>
                <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>🏢</span>
                    <span>Sucursal</span>
                  </div>
                </th>
                <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span>Registrado</span>
                  </div>
                </th>
                <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>💰</span>
                    <span>Compras</span>
                  </div>
                </th>
                <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>⚙️</span>
                    <span>Acciones</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-600/20">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="group hover:bg-gradient-to-r hover:from-slate-800/40 hover:to-slate-700/20 transition-all duration-200 border-b border-slate-600/10">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/30 to-blue-500/10 border-2 border-blue-500/40 flex items-center justify-center shadow-sm">
                        <span className="text-sm font-bold text-white">
                          {customer.first_name?.[0]}{customer.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-white group-hover:text-accent transition-colors">
                          {customer.first_name} {customer.last_name}
                        </div>
                        {customer.birth_date && (
                          <div className="text-muted text-sm mt-0.5">
                            {new Date().getFullYear() - new Date(customer.birth_date).getFullYear()} años
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      {customer.email && (
                        <div className="text-sm text-white flex items-center gap-1">
                          <span>📧</span>
                          <span className="truncate max-w-[200px]" title={customer.email}>{customer.email}</span>
                        </div>
                      )}
                      {customer.phone && (
                        <div className="text-muted text-sm flex items-center gap-1">
                          <span>📞</span>
                          <span>{customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {customer.document_number ? (
                      <div className="bg-slate-800/30 rounded-lg p-2 border border-slate-600/20">
                        <div className="text-xs font-semibold text-blue-400">{customer.document_type?.toUpperCase()}</div>
                        <div className="text-sm text-white font-mono">{customer.document_number}</div>
                      </div>
                    ) : (
                      <span className="text-muted text-sm italic">Sin documento</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {customer.branches && customer.branches.length > 0 ? (
                      <div className="space-y-1">
                        {customer.branches.slice(0, 2).map((branch) => (
                          <div key={branch.id} className="flex items-center gap-2 bg-slate-800/30 rounded px-2 py-1">
                            <span className="text-blue-400">🏢</span>
                            <div>
                              <div className="text-xs font-medium text-white">{branch.name}</div>
                              <div className="text-muted text-xs">{branch.code}</div>
                            </div>
                          </div>
                        ))}
                        {customer.branches.length > 2 && (
                          <div className="text-xs text-muted">+{customer.branches.length - 2} más</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted text-sm italic">Sin asignar</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-white">
                      {customer.created_at ? new Date(customer.created_at).toLocaleDateString('es-MX', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      }) : 'N/A'}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-semibold shadow-sm">
                      {customer.total_purchases || 0} compras
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewCustomerDetails(customer.id)}
                        className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all hover:scale-110"
                        title="Ver detalles"
                      >
                        👁️
                      </button>
                      {hasPermission(['supervisor', 'cashier']) && (
                        <>
                          <button
                            onClick={() => handleEdit(customer)}
                            className="p-2 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent hover:text-accent/80 transition-all hover:scale-110"
                            title="Editar cliente"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all hover:scale-110"
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
                      <span className="font-medium text-accent">${parseFloat(selectedCustomer.total_spent || 0).toFixed(2)}</span>
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
                                ${parseFloat(purchase.total || 0).toFixed(2)}
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
              {hasPermission(['admin', 'supervisor', 'cashier']) && (
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

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, customer: null })}
        title="Eliminar Cliente"
        message="¿Estás seguro de que deseas eliminar este cliente?"
        type="danger"
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        message={successModal.message}
      />

      {/* Modal de cancelación */}
      <CancelledModal
        isOpen={cancelledModal.isOpen}
        onClose={() => setCancelledModal({ isOpen: false, message: '' })}
        message={cancelledModal.message}
      />
    </div>
  )
}
